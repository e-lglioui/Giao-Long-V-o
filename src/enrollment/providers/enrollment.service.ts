import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import type { Model } from "mongoose"
import { Enrollment, type EnrollmentStatus } from "../schemas/enrollment.schema"
import type { CreateEnrollmentDto } from "../dto/create-enrollment.dto"
import type { SchoolsService } from "../../schools/providers/schools.service"
import type { ClassesService } from "../../classes/providers/classes.service"

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectModel(Enrollment.name) private enrollmentModel: Model<Enrollment>,
    private readonly schoolsService: SchoolsService,
    private readonly classesService: ClassesService,
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
}

