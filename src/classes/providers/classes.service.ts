import { Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import type { Model } from "mongoose"
import { Class, type ClassStatus } from "../schemas/class.schema"
import type { CreateClassDto } from "../dto/create-class.dto"
import type { UpdateClassDto } from "../dto/update-class.dto"
import type { EnrollStudentDto, EnrollMultipleStudentsDto } from "../dto/enroll-student.dto"
import type { SchoolsService } from "../../schools/providers/schools.service"

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(Class.name) private classModel: Model<Class>,
    private readonly schoolsService: SchoolsService,
  ) {}

  async create(createClassDto: CreateClassDto): Promise<Class> {
    // Verify the school exists
    const school = await this.schoolsService.findOne(createClassDto.schoolId)
    if (!school) {
      throw new NotFoundException(`School with ID ${createClassDto.schoolId} not found`)
    }

    // Verify the class time is within school operating hours
    const isWithinOperatingHours = this.isWithinSchoolHours(
      createClassDto.startTime,
      createClassDto.endTime,
      school.schedule.openingTime,
      school.schedule.closingTime,
    )

    if (!isWithinOperatingHours) {
      throw new BadRequestException(
        `Class time must be within school operating hours (${school.schedule.openingTime} - ${school.schedule.closingTime})`,
      )
    }

    // Verify the class date is on a day when the school is operating
    const classDay = new Date(createClassDto.date).toLocaleDateString("en-US", { weekday: "long" })
    if (!school.schedule.operatingDays.includes(classDay)) {
      throw new BadRequestException(`School is not open on ${classDay}`)
    }

    // Create the class
    const newClass = new this.classModel({
      ...createClassDto,
      currentEnrollment: 0,
    })

    return newClass.save()
  }

  async findAll(filters: any = {}): Promise<Class[]> {
    return this.classModel
      .find(filters)
      .populate("schoolId", "name address")
      .populate("instructorId", "firstName lastName email")
      .populate("courseId", "title description")
      .exec()
  }

  async findOne(id: string): Promise<Class> {
    const foundClass = await this.classModel
      .findById(id)
      .populate("schoolId", "name address")
      .populate("instructorId", "firstName lastName email")
      .populate("courseId", "title description")
      .populate("enrolledStudents", "firstName lastName email")
      .exec()

    if (!foundClass) {
      throw new NotFoundException(`Class with ID ${id} not found`)
    }

    return foundClass
  }

  async update(id: string, updateClassDto: UpdateClassDto): Promise<Class> {
    const existingClass = await this.findOne(id)

    // If school or times are being updated, verify operating hours
    if (
      (updateClassDto.schoolId || updateClassDto.startTime || updateClassDto.endTime) &&
      (updateClassDto.startTime || updateClassDto.endTime)
    ) {
      const schoolId = updateClassDto.schoolId || existingClass.schoolId.toString()
      const school = await this.schoolsService.findOne(schoolId)

      const startTime = updateClassDto.startTime || existingClass.startTime
      const endTime = updateClassDto.endTime || existingClass.endTime

      const isWithinOperatingHours = this.isWithinSchoolHours(
        startTime,
        endTime,
        school.schedule.openingTime,
        school.schedule.closingTime,
      )

      if (!isWithinOperatingHours) {
        throw new BadRequestException(
          `Class time must be within school operating hours (${school.schedule.openingTime} - ${school.schedule.closingTime})`,
        )
      }
    }

    const updatedClass = await this.classModel.findByIdAndUpdate(id, updateClassDto, { new: true }).exec()

    if (!updatedClass) {
      throw new NotFoundException(`Class with ID ${id} not found`)
    }

    return updatedClass
  }

  async remove(id: string): Promise<void> {
    const result = await this.classModel.findByIdAndDelete(id).exec()

    if (!result) {
      throw new NotFoundException(`Class with ID ${id} not found`)
    }
  }

  async enrollStudent(classId: string, enrollDto: EnrollStudentDto): Promise<Class> {
    const classToUpdate = await this.findOne(classId)

    // Check if class is at capacity
    if (classToUpdate.currentEnrollment >= classToUpdate.maxCapacity) {
      throw new ConflictException("Class is already at maximum capacity")
    }

    // Check if student is already enrolled
    const isAlreadyEnrolled = classToUpdate.enrolledStudents.some(
      (student) => student.toString() === enrollDto.studentId,
    )

    if (isAlreadyEnrolled) {
      throw new ConflictException("Student is already enrolled in this class")
    }

    // Enroll the student
    const updatedClass = await this.classModel
      .findByIdAndUpdate(
        classId,
        {
          $push: { enrolledStudents: enrollDto.studentId },
          $inc: { currentEnrollment: 1 },
        },
        { new: true },
      )
      .exec()

    return updatedClass
  }

  async enrollMultipleStudents(classId: string, enrollDto: EnrollMultipleStudentsDto): Promise<Class> {
    const classToUpdate = await this.findOne(classId)

    // Check if adding these students would exceed capacity
    if (classToUpdate.currentEnrollment + enrollDto.studentIds.length > classToUpdate.maxCapacity) {
      throw new ConflictException("Enrolling these students would exceed class capacity")
    }

    // Filter out students who are already enrolled
    const existingStudentIds = classToUpdate.enrolledStudents.map((id) => id.toString())
    const newStudentIds = enrollDto.studentIds.filter((id) => !existingStudentIds.includes(id))

    if (newStudentIds.length === 0) {
      throw new ConflictException("All students are already enrolled in this class")
    }

    // Enroll the students
    const updatedClass = await this.classModel
      .findByIdAndUpdate(
        classId,
        {
          $push: { enrolledStudents: { $each: newStudentIds } },
          $inc: { currentEnrollment: newStudentIds.length },
        },
        { new: true },
      )
      .exec()

    return updatedClass
  }

  async removeStudent(classId: string, studentId: string): Promise<Class> {
    const classToUpdate = await this.findOne(classId)

    // Check if student is enrolled
    const isEnrolled = classToUpdate.enrolledStudents.some((student) => student.toString() === studentId)

    if (!isEnrolled) {
      throw new NotFoundException("Student is not enrolled in this class")
    }

    // Remove the student
    const updatedClass = await this.classModel
      .findByIdAndUpdate(
        classId,
        {
          $pull: { enrolledStudents: studentId },
          $inc: { currentEnrollment: -1 },
        },
        { new: true },
      )
      .exec()

    return updatedClass
  }

  async updateClassStatus(classId: string, status: ClassStatus): Promise<Class> {
    const updatedClass = await this.classModel.findByIdAndUpdate(classId, { status }, { new: true }).exec()

    if (!updatedClass) {
      throw new NotFoundException(`Class with ID ${classId} not found`)
    }

    return updatedClass
  }

  async getClassesByInstructor(instructorId: string): Promise<Class[]> {
    return this.classModel
      .find({ instructorId })
      .populate("schoolId", "name address")
      .populate("courseId", "title description")
      .exec()
  }

  async getClassesByStudent(studentId: string): Promise<Class[]> {
    return this.classModel
      .find({ enrolledStudents: studentId })
      .populate("schoolId", "name address")
      .populate("instructorId", "firstName lastName email")
      .populate("courseId", "title description")
      .exec()
  }

  async getClassesBySchool(schoolId: string): Promise<Class[]> {
    return this.classModel
      .find({ schoolId })
      .populate("instructorId", "firstName lastName email")
      .populate("courseId", "title description")
      .exec()
  }

  private isWithinSchoolHours(
    classStartTime: string,
    classEndTime: string,
    schoolOpeningTime: string,
    schoolClosingTime: string,
  ): boolean {
    // Convert times to minutes for easier comparison
    const toMinutes = (time: string): number => {
      const [hours, minutes] = time.split(":").map(Number)
      return hours * 60 + minutes
    }

    const classStart = toMinutes(classStartTime)
    const classEnd = toMinutes(classEndTime)
    const schoolOpening = toMinutes(schoolOpeningTime)
    const schoolClosing = toMinutes(schoolClosingTime)

    return classStart >= schoolOpening && classEnd <= schoolClosing
  }
}

