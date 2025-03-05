import { Injectable, Logger } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import type { Model } from "mongoose"
import { School } from "../schemas/school.schema"
import { InvalidOperationException } from "../../common/exceptions/custom.exceptions"

@Injectable()
export class SchoolValidatorService {
  private readonly logger = new Logger(SchoolValidatorService.name);

  constructor(
    @InjectModel(School.name) private readonly schoolModel: Model<School>
  ) {}

  async validateSchoolName(name: string, excludeId?: string): Promise<void> {
    this.logger.log(`Validating school name: "${name}"`)

    if (!name || name.trim() === "") {
      this.logger.warn("Empty school name provided for validation")
      throw new InvalidOperationException("School name cannot be empty")
    }

    const query: any = { name }
    if (excludeId) {
      query._id = { $ne: excludeId }
    }

    this.logger.log(`Checking for existing school with query: ${JSON.stringify(query)}`)
    const existingSchool = await this.schoolModel.findOne(query).exec()

    if (existingSchool) {
      this.logger.warn(`School name validation failed: "${name}" already exists with ID: ${existingSchool._id}`)
      throw new InvalidOperationException(`School with name "${name}" already exists`)
    }

    this.logger.log(`School name "${name}" validation passed`)
  }

  async validateCapacity(schoolId: string, additionalStudents: number): Promise<void> {
    const school = await this.schoolModel.findById(schoolId).exec()
    if (!school) {
      throw new InvalidOperationException(`School with ID "${schoolId}" not found`)
    }

    // Example capacity check - adjust based on your business rules
    const currentCount = school.dashboard?.studentCount || 0
    const maxCapacity = school.maxStudents || 100

    if (currentCount + additionalStudents > maxCapacity) {
      this.logger.warn(
        `Capacity validation failed for school ${schoolId}: ${currentCount}/${maxCapacity} + ${additionalStudents}`,
      )
      throw new InvalidOperationException(`School has reached maximum capacity (${currentCount}/${maxCapacity})`)
    }
  }
}

