import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { School } from '../schemas/school.schema';
import { DuplicateSchoolException, InvalidOperationException } from '../../common/exceptions/custom.exceptions';

@Injectable()
export class SchoolValidatorService {
  constructor(
    @InjectModel(School.name) private readonly schoolModel: Model<School>
  ) {}

  async validateSchoolName(name: string, excludeId?: string): Promise<void> {
    const query = this.schoolModel.findOne({ name });
    if (excludeId) {
      query.where('_id').ne(excludeId);
    }
    
    const existingSchool = await query.exec();
    if (existingSchool) {
      throw new DuplicateSchoolException(name);
    }
  }

  async validateCapacity(schoolId: string, newStudentCount: number): Promise<void> {
    const school = await this.schoolModel.findById(schoolId);
    const currentStudentCount = school.dashboard?.studentCount || 0;
    
    if (currentStudentCount + newStudentCount > 1000) { // exemple de limite
      throw new InvalidOperationException('School capacity exceeded');
    }
  }
} 