import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { School } from '../schemas/school.schema';
import { CreateSchoolDto } from '../dto/create-school.dto';
import { SchoolValidatorService } from './school-validator.service';
import { 
  SchoolNotFoundException, 
  InvalidOperationException 
} from '../../common/exceptions/custom.exceptions';
import { User } from '../../users/schemas/user.schema';

@Injectable()
export class SchoolsService {
  private readonly logger = new Logger(SchoolsService.name);

  constructor(
    @InjectModel(School.name) private readonly schoolModel: Model<School>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly validatorService: SchoolValidatorService
  ) {}

  async create(createSchoolDto: CreateSchoolDto): Promise<School> {
    try {
      await this.validatorService.validateSchoolName(createSchoolDto.name);

      const createdSchool = new this.schoolModel({
        ...createSchoolDto,
        dashboard: {
          studentCount: 0,
          revenue: 0,
          performanceStats: new Map()
        }
      });

      const savedSchool = await createdSchool.save();
      this.logger.log(`Created new school with ID: ${savedSchool._id}`);
      return savedSchool;
    } catch (error) {
      this.logger.error(`Failed to create school: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<School[]> {
    try {
      return await this.schoolModel.find()
        .populate('instructors', 'username email')
        .populate('students', 'username')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to fetch schools: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<School> {
    try {
      const school = await this.schoolModel.findById(id)
        .populate('instructors', 'username email')
        .populate('students', 'username')
        .exec();
      
      if (!school) {
        throw new SchoolNotFoundException(id);
      }
      
      return school;
    } catch (error) {
      this.logger.error(`Failed to fetch school ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateSchoolDto: Partial<CreateSchoolDto>): Promise<School> {
    try {
      if (updateSchoolDto.name) {
        await this.validatorService.validateSchoolName(updateSchoolDto.name, id);
      }

      const updatedSchool = await this.schoolModel
        .findByIdAndUpdate(id, updateSchoolDto, { new: true })
        .exec();
      
      if (!updatedSchool) {
        throw new SchoolNotFoundException(id);
      }

      this.logger.log(`Updated school with ID: ${id}`);
      return updatedSchool;
    } catch (error) {
      this.logger.error(`Failed to update school ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async addInstructor(schoolId: string, instructorId: string): Promise<School> {
    try {
      const school = await this.schoolModel.findById(schoolId);
      if (!school) {
        throw new SchoolNotFoundException(schoolId);
      }

      const instructor = await this.userModel.findById(instructorId);
      if (!instructor) {
        throw new InvalidOperationException('Instructor not found');
      }

      if (school.instructors.some(instructor => instructor.toString() === instructorId)) {
        throw new InvalidOperationException('Instructor already assigned to this school');
      }

      school.instructors.push(instructor);
      const updatedSchool = await school.save();
      
      this.logger.log(`Added instructor ${instructorId} to school ${schoolId}`);
      return updatedSchool;
    } catch (error) {
      this.logger.error(
        `Failed to add instructor ${instructorId} to school ${schoolId}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async addStudent(schoolId: string, studentId: string): Promise<School> {
    try {
      await this.validatorService.validateCapacity(schoolId, 1);

      const school = await this.schoolModel.findById(schoolId);
      if (!school) {
        throw new SchoolNotFoundException(schoolId);
      }

      const student = await this.userModel.findById(studentId);
      if (!student) {
        throw new InvalidOperationException('Student not found');
      }

      if (school.students.some(student => student.toString() === studentId)) {
        throw new InvalidOperationException('Student already enrolled in this school');
      }

      school.students.push(student);
      school.dashboard.studentCount += 1;
      
      const updatedSchool = await school.save();
      this.logger.log(`Added student ${studentId} to school ${schoolId}`);
      return updatedSchool;
    } catch (error) {
      this.logger.error(
        `Failed to add student ${studentId} to school ${schoolId}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.schoolModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new SchoolNotFoundException(id);
      }
      this.logger.log(`Deleted school with ID: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete school ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
} 