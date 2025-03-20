import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import type { Model } from "mongoose"
import { Enrollment, EnrollmentStatus } from "../schemas/enrollment.schema"
import type { CreateEnrollmentDto } from "../dto/create-enrollment.dto"
import type { SchoolsService } from "../../schools/providers/schools.service"
import type { ClassesService } from "../../classes/providers/classes.service"
import { Role } from '../../auth/enums/role.enum'
import { User } from '../../users/schemas/user.schema'
import { PaymentsService } from '../../finance/providers/payments.service'
import { PaymentType, PaymentStatus } from '../../finance/schemas/payment.schema'
import { UserService } from '../../users/providers/user.service'
import { Types } from 'mongoose'

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectModel(Enrollment.name) private enrollmentModel: Model<Enrollment>,
    private readonly schoolsService: SchoolsService,
    private readonly classesService: ClassesService,
    private readonly paymentsService: PaymentsService,
    private readonly userService: UserService,
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('School') private readonly schoolModel: Model<any>,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    // Check if school exists
    const school = await this.schoolsService.findOne(createEnrollmentDto.schoolId)

    // Check if student is already enrolled in this school
    const existingEnrollment = await this.enrollmentModel
      .findOne({
        studentId: createEnrollmentDto.studentId,
        schoolId: createEnrollmentDto.schoolId,
      })
      .exec()

    if (existingEnrollment) {
      throw new ConflictException("Student is already enrolled in this school")
    }

    // Create enrollment
    const newEnrollment = new this.enrollmentModel(createEnrollmentDto)
    const savedEnrollment = await newEnrollment.save()

    // If classes are provided, enroll student in each class
    if (createEnrollmentDto.classes && createEnrollmentDto.classes.length > 0) {
      for (const classId of createEnrollmentDto.classes) {
        await this.classesService.enrollStudent(classId, { studentId: createEnrollmentDto.studentId })
      }
    }

    // Add student to school
    await this.schoolsService.addStudent(createEnrollmentDto.schoolId, createEnrollmentDto.studentId)

    return savedEnrollment
  }

  async findAll(filters: any = {}): Promise<Enrollment[]> {
    return this.enrollmentModel
      .find(filters)
      .populate("studentId", "firstName lastName email")
      .populate("schoolId", "name address")
      .populate("classes", "title date startTime endTime")
      .exec()
  }

  async findOne(id: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentModel
      .findById(id)
      .populate("studentId", "firstName lastName email")
      .populate("schoolId", "name address")
      .populate("classes", "title date startTime endTime")
      .exec()

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`)
    }

    return enrollment
  }

  async findByStudent(studentId: string): Promise<Enrollment[]> {
    return this.enrollmentModel
      .find({ studentId })
      .populate("schoolId", "name address")
      .populate("classes", "title date startTime endTime")
      .exec()
  }

  async findBySchool(schoolId: string): Promise<Enrollment[]> {
    return this.enrollmentModel
      .find({ schoolId })
      .populate("studentId", "firstName lastName email")
      .populate("classes", "title date startTime endTime")
      .exec()
  }

  async update(id: string, updateData: Partial<CreateEnrollmentDto>): Promise<Enrollment> {
    const updatedEnrollment = await this.enrollmentModel.findByIdAndUpdate(id, updateData, { new: true }).exec()

    if (!updatedEnrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`)
    }

    return updatedEnrollment
  }

  async addClassToEnrollment(enrollmentId: string, classId: string): Promise<Enrollment> {
    const enrollment = await this.findOne(enrollmentId)

    // Check if class is already in enrollment
    if (enrollment.classes.some((c) => c.toString() === classId)) {
      throw new ConflictException("Student is already enrolled in this class")
    }

    // Enroll student in class
    await this.classesService.enrollStudent(classId, { studentId: enrollment.studentId.toString() })

    // Add class to enrollment
    const updatedEnrollment = await this.enrollmentModel
      .findByIdAndUpdate(enrollmentId, { $push: { classes: classId } }, { new: true })
      .exec()

    return updatedEnrollment
  }

  async removeClassFromEnrollment(enrollmentId: string, classId: string): Promise<Enrollment> {
    const enrollment = await this.findOne(enrollmentId)

    // Check if class is in enrollment
    if (!enrollment.classes.some((c) => c.toString() === classId)) {
      throw new NotFoundException("Student is not enrolled in this class")
    }

    // Remove student from class
    await this.classesService.removeStudent(classId, enrollment.studentId.toString())

    // Remove class from enrollment
    const updatedEnrollment = await this.enrollmentModel
      .findByIdAndUpdate(enrollmentId, { $pull: { classes: classId } }, { new: true })
      .exec()

    return updatedEnrollment
  }

  async updateStatus(id: string, status: EnrollmentStatus): Promise<Enrollment> {
    const updatedEnrollment = await this.enrollmentModel.findByIdAndUpdate(id, { status }, { new: true }).exec()

    if (!updatedEnrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`)
    }

    return updatedEnrollment
  }

  async remove(id: string): Promise<void> {
    const enrollment = await this.findOne(id)

    // Remove student from all enrolled classes
    for (const classId of enrollment.classes) {
      await this.classesService.removeStudent(classId.toString(), enrollment.studentId.toString())
    }

    // Remove enrollment
    await this.enrollmentModel.findByIdAndDelete(id).exec()
  }

  /**
   * Enroll a user in a school and update their role to STUDENT
   */
  async enrollUserInSchool(userId: string, schoolId: string, enrollmentData: any) {
    // Verify user exists
    const user = await this.userModel.findById(userId).exec()
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`)
    }

    // Verify school exists
    const school = await this.schoolModel.findById(schoolId).exec()
    if (!school) {
      throw new NotFoundException(`School with ID ${schoolId} not found`)
    }

    // Check if user is already enrolled in this school
    const existingEnrollment = await this.enrollmentModel.findOne({
      user: userId,
      school: schoolId,
      status: { $ne: 'cancelled' } // Not cancelled enrollments
    }).exec()

    if (existingEnrollment) {
      throw new BadRequestException('User is already enrolled in this school')
    }

    // Create new enrollment
    const enrollment = new this.enrollmentModel({
      user: userId,
      school: schoolId,
      enrollmentDate: new Date(),
      status: 'pending', // Enrollment starts as pending and needs approval
      ...enrollmentData
    })

    // Save enrollment
    await enrollment.save()

    // If user has basic USER role, update to STUDENT role
    if (user.role === Role.USER) {
      user.role = Role.STUDENT
      await user.save()
    }

    return {
      message: 'Enrollment submitted successfully. Your role has been updated to Student.',
      enrollment: enrollment,
      currentRole: user.role
    }
  }

  /**
   * Approve a pending enrollment (by school admin or staff)
   */
  async approveEnrollment(enrollmentId: string, approverId: string) {
    const enrollment = await this.enrollmentModel.findById(enrollmentId).exec();
    
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${enrollmentId} not found`);
    }
    
    if (enrollment.status !== EnrollmentStatus.PENDING) {
      throw new BadRequestException(`Enrollment is not in pending status`);
    }
    
    // Update enrollment status
    enrollment.status = EnrollmentStatus.APPROVED;
    enrollment.approvedBy = approverId as any;
    enrollment.approvedAt = new Date();
    
    await enrollment.save();
    
    // Check if enrollment has user or studentId
    const userId = enrollment.user?.toString() || enrollment.studentId?.toString();
    
    // Ensure user has STUDENT role
    if (userId) {
      const user = await this.userModel.findById(userId).exec();
      if (user && user.role === Role.USER) {
        user.role = Role.STUDENT;
        await user.save();
      }
    }
    
    return {
      message: 'Enrollment approved successfully',
      enrollment: enrollment
    };
  }

  /**
   * Create a payment intent for school enrollment
   */
  async createEnrollmentPayment(enrollmentPaymentDto: any, user: any): Promise<any> {
    // Check if school exists
    const school = await this.schoolsService.findOne(enrollmentPaymentDto.schoolId);
    
    // Check if user is already enrolled - use both field names
    const existingEnrollment = await this.enrollmentModel.findOne({
      $or: [
        { studentId: user.id as any, schoolId: enrollmentPaymentDto.schoolId },
        { user: user.id as any, school: enrollmentPaymentDto.schoolId }
      ],
      status: { $ne: EnrollmentStatus.CANCELLED }
    }).exec();
    
    if (existingEnrollment) {
      throw new ConflictException('User is already enrolled or has a pending enrollment in this school');
    }
    
    // Get school pricing
    const enrollmentFee = school.enrollmentFee || 0;
    
    // Create payment intent
    const paymentData = {
      amount: enrollmentFee,
      type: enrollmentPaymentDto.paymentType || PaymentType.COURSE,
      metadata: {
        schoolId: enrollmentPaymentDto.schoolId,
        classes: enrollmentPaymentDto.classes || [],
        enrollmentType: 'school'
      }
    };
    
    // Create the payment and return payment intent details
    const payment = await this.paymentsService.createPayment(paymentData, user);
    
    // Create a pending enrollment record
    const enrollment = new this.enrollmentModel({
      studentId: user.id as any,
      user: user.id as any,
      schoolId: enrollmentPaymentDto.schoolId,
      school: enrollmentPaymentDto.schoolId,
      classes: enrollmentPaymentDto.classes || [],
      enrollmentDate: new Date(),
      status: EnrollmentStatus.PENDING,
      paymentDetails: {
        paymentId: payment._id,
        stripePaymentIntentId: payment.stripePaymentIntentId,
        amount: enrollmentFee,
        status: payment.status
      }
    });
    
    await enrollment.save();
    
    // Get the client secret directly from the Stripe payment intent
    // The PaymentsService should return the payment intent's client_secret
    return {
      enrollment: enrollment,
      payment: {
        clientSecret: payment.stripeClientSecret || payment.stripePaymentIntentId,
        amount: enrollmentFee,
        paymentId: payment._id
      }
    };
  }

  /**
   * Confirm enrollment after successful payment
   */
  async confirmEnrollmentPayment(paymentIntentId: string, user: any): Promise<any> {
    // Find the enrollment by payment intent ID
    const enrollment = await this.enrollmentModel.findOne({
      'paymentDetails.stripePaymentIntentId': paymentIntentId
    }).exec();
    
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found for this payment');
    }
    
    // Confirm the payment in our system
    await this.paymentsService.confirmPayment(paymentIntentId);
    
    // Update enrollment status
    enrollment.status = EnrollmentStatus.ACTIVE;
    enrollment.paymentDetails.status = PaymentStatus.COMPLETED;
    await enrollment.save();
    
    // Add student to school
    await this.schoolsService.addStudent(enrollment.schoolId.toString(), user.id);
    
    // Enroll in classes if any
    if (enrollment.classes && enrollment.classes.length > 0) {
      for (const classId of enrollment.classes) {
        await this.classesService.enrollStudent(classId.toString(), { studentId: user.id });
      }
    }
    
    // Update user role to STUDENT if needed
    const userToUpdate = await this.userModel.findById(user.id).exec();
    if (userToUpdate && userToUpdate.role === Role.USER) {
      userToUpdate.role = Role.STUDENT;
      await userToUpdate.save();
    }
    
    return {
      message: 'Enrollment confirmed successfully',
      enrollment: enrollment,
      currentRole: userToUpdate.role
    };
  }
}

