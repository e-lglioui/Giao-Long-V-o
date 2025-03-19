import { Injectable, Logger, forwardRef, Inject } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import type { Model } from "mongoose"
import { School } from "../schemas/school.schema"
import type { CreateSchoolDto } from "../dto/create-school.dto"
import { SchoolValidatorService } from "./school-validator.service"
import { SchoolNotFoundException, InvalidOperationException } from "../../common/exceptions/custom.exceptions"
import { User } from "../../users/schemas/user.schema"
import { Student } from "../../students/schemas/student.schema"

@Injectable()
export class SchoolsService {
  private readonly logger = new Logger(SchoolsService.name);

  constructor(
    @InjectModel(School.name) private readonly schoolModel: Model<School>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Student.name) private readonly studentModel: Model<Student>,
    @Inject(forwardRef(() => SchoolValidatorService)) private readonly validatorService: SchoolValidatorService
  ) {}

  async create(createSchoolDto: CreateSchoolDto): Promise<School> {
    this.logger.log(`Creating school with data: ${JSON.stringify(createSchoolDto)}`)

    // Validate school name
    if (!createSchoolDto.name) {
      this.logger.error("Name is missing in the DTO")
      throw new InvalidOperationException("School name is required")
    }

    try {
      // Validate school name uniqueness
      await this.validatorService.validateSchoolName(createSchoolDto.name)

      const createdSchool = new this.schoolModel({
        name: createSchoolDto.name,
        address: createSchoolDto.address,
        contactNumber: createSchoolDto.contactNumber,
        description: createSchoolDto.description,
        maxStudents: createSchoolDto.maxStudents,
        location: createSchoolDto.location,
        images: createSchoolDto.images || [],
        schedule: createSchoolDto.schedule || {
          openingTime: "08:00",
          closingTime: "16:00",
          operatingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        },
        dashboard: {
          studentCount: 0,
          revenue: 0,
          performanceStats: new Map(),
        },
      })

      const savedSchool = await createdSchool.save()
      this.logger.log(`Created new school with ID: ${savedSchool._id}`)
      return savedSchool
    } catch (error) {
      this.logger.error(`Failed to create school: ${error.message}`, error.stack)
      throw error
    }
  }

  // Rest of the service remains the same
  async findAll(): Promise<School[]> {
    try {
      return await this.schoolModel
        .find()
        .populate("instructors", "username email")
        .populate("students", "username")
        .populate("studentReferences")
        .exec()
    } catch (error) {
      this.logger.error(`Failed to fetch schools: ${error.message}`, error.stack)
      throw error
    }
  }

  async findOne(id: string): Promise<School> {
    try {
      const school = await this.schoolModel
        .findById(id)
        .populate("instructors", "username email")
        .populate("students", "username")
        .populate("studentReferences")
        .exec()

      if (!school) {
        throw new SchoolNotFoundException(id)
      }

      return school
    } catch (error) {
      this.logger.error(`Failed to fetch school ${id}: ${error.message}`, error.stack)
      throw error
    }
  }

  async update(id: string, updateSchoolDto: Partial<CreateSchoolDto>): Promise<School> {
    try {
      if (updateSchoolDto.name) {
        await this.validatorService.validateSchoolName(updateSchoolDto.name, id)
      }

      const updatedSchool = await this.schoolModel.findByIdAndUpdate(id, updateSchoolDto, { new: true }).exec()

      if (!updatedSchool) {
        throw new SchoolNotFoundException(id)
      }

      this.logger.log(`Updated school with ID: ${id}`)
      return updatedSchool
    } catch (error) {
      this.logger.error(`Failed to update school ${id}: ${error.message}`, error.stack)
      throw error
    }
  }

  async addInstructor(schoolId: string, instructorId: string): Promise<School> {
    try {
      const school = await this.schoolModel.findById(schoolId)
      if (!school) {
        throw new SchoolNotFoundException(schoolId)
      }

      const instructor = await this.userModel.findById(instructorId)
      if (!instructor) {
        throw new InvalidOperationException("Instructor not found")
      }

      if (school.instructors.some((instructor) => instructor.toString() === instructorId)) {
        throw new InvalidOperationException("Instructor already assigned to this school")
      }

      school.instructors.push(instructor)
      const updatedSchool = await school.save()

      this.logger.log(`Added instructor ${instructorId} to school ${schoolId}`)
      return updatedSchool
    } catch (error) {
      this.logger.error(`Failed to add instructor ${instructorId} to school ${schoolId}: ${error.message}`, error.stack)
      throw error
    }
  }

  async addStudent(schoolId: string, studentId: string): Promise<School> {
    try {
      await this.validatorService.validateCapacity(schoolId, 1)

      const school = await this.schoolModel.findById(schoolId)
      if (!school) {
        throw new SchoolNotFoundException(schoolId)
      }

      const student = await this.userModel.findById(studentId)
      if (!student) {
        throw new InvalidOperationException("Student not found")
      }

      if (school.students.some((student) => student.toString() === studentId)) {
        throw new InvalidOperationException("Student already enrolled in this school")
      }

      school.students.push(student)
      school.dashboard.studentCount += 1

      // Find and add the student reference if it exists
      const studentRef = await this.studentModel.findOne({ userId: studentId })
      if (studentRef && !school.studentReferences.some((ref) => ref.toString() === studentRef._id.toString())) {
        school.studentReferences.push(studentRef)
      }

      const updatedSchool = await school.save()
      this.logger.log(`Added student ${studentId} to school ${schoolId}`)
      return updatedSchool
    } catch (error) {
      this.logger.error(`Failed to add student ${studentId} to school ${schoolId}: ${error.message}`, error.stack)
      throw error
    }
  }

  async addImage(schoolId: string, imageUrl: string): Promise<School> {
    try {
      const school = await this.schoolModel.findById(schoolId)
      if (!school) {
        throw new SchoolNotFoundException(schoolId)
      }

      if (!school.images) {
        school.images = []
      }

      school.images.push(imageUrl)
      const updatedSchool = await school.save()

      this.logger.log(`Added image to school ${schoolId}`)
      return updatedSchool
    } catch (error) {
      this.logger.error(`Failed to add image to school ${schoolId}: ${error.message}`, error.stack)
      throw error
    }
  }

  async updateSchedule(
    schoolId: string,
    schedule: { openingTime: string; closingTime: string; operatingDays?: string[] },
  ): Promise<School> {
    try {
      const school = await this.schoolModel.findById(schoolId)
      if (!school) {
        throw new SchoolNotFoundException(schoolId)
      }

      school.schedule = {
        ...school.schedule,
        ...schedule,
      }

      const updatedSchool = await school.save()
      this.logger.log(`Updated schedule for school ${schoolId}`)
      return updatedSchool
    } catch (error) {
      this.logger.error(`Failed to update schedule for school ${schoolId}: ${error.message}`, error.stack)
      throw error
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.schoolModel.findByIdAndDelete(id).exec()
      if (!result) {
        throw new SchoolNotFoundException(id)
      }
      this.logger.log(`Deleted school with ID: ${id}`)
    } catch (error) {
      this.logger.error(`Failed to delete school ${id}: ${error.message}`, error.stack)
      throw error
    }
  }
  async removeImage(schoolId: string, imageUrl: string): Promise<School> {
    try {
      const school = await this.schoolModel.findById(schoolId)
      if (!school) {
        throw new SchoolNotFoundException(schoolId)
      }

      if (!school.images) {
        throw new InvalidOperationException("School does not have any images")
      }

      const imageIndex = school.images.findIndex((img) => img === imageUrl)
      if (imageIndex === -1) {
        throw new InvalidOperationException("Image not found in school")
      }

      school.images.splice(imageIndex, 1)
      const updatedSchool = await school.save()

      this.logger.log(`Removed image from school ${schoolId}`)
      return updatedSchool
    } catch (error) {
      this.logger.error(`Failed to remove image from school ${schoolId}: ${error.message}`, error.stack)
      throw error
    }
  }

  async findNearbySchools(latitude: number, longitude: number, maxDistance?: number): Promise<School[]> {
    try {
      this.logger.log(
        `Finding schools near coordinates: [${latitude}, ${longitude}] within ${maxDistance || 10000} meters`,
      )

      // Validate inputs
      if (isNaN(latitude) || isNaN(longitude)) {
        throw new InvalidOperationException("Valid latitude and longitude are required")
      }

      // Set default distance if not provided
      const distance = maxDistance || 10000 // Default to 10km if not specified

      // Find schools near the provided coordinates
      const schools = await this.schoolModel
        .find({
          "location.latitude": { $exists: true },
          "location.longitude": { $exists: true },
        })
        .exec()

      // Filter schools by distance (since we're not using a geospatial index yet)
      const nearbySchools = schools.filter((school) => {
        if (!school.location?.latitude || !school.location?.longitude) return false

        // Calculate distance using the Haversine formula
        const distanceInKm = this.calculateDistance(
          latitude,
          longitude,
          school.location.latitude,
          school.location.longitude,
        )

        // Convert the distance to meters for comparison
        return distanceInKm * 1000 <= distance
      })

      // Sort schools by distance from the user's location
      nearbySchools.sort((a, b) => {
        const distanceA = this.calculateDistance(latitude, longitude, a.location.latitude, a.location.longitude)
        const distanceB = this.calculateDistance(latitude, longitude, b.location.latitude, b.location.longitude)
        return distanceA - distanceB
      })

      this.logger.log(`Found ${nearbySchools.length} schools within ${distance} meters`)
      return nearbySchools
    } catch (error) {
      this.logger.error(`Failed to find nearby schools: ${error.message}`, error.stack)
      throw error
    }
  }

  // Helper method to calculate distance between two points using the Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in kilometers
    return distance
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }

  async getSchoolsByInstructorId(instructorId: string): Promise<School[]> {
    return this.schoolModel.find({ instructors: instructorId }).exec();
  }
}

