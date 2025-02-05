import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from './interfaces/course.interface';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CoursesRepository {
  constructor(
    @InjectModel('Course') private courseModel: Model<Course>
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    return this.courseModel.create(createCourseDto);
  }

  async findAll(): Promise<Course[]> {
    return this.courseModel.find().exec();
  }

  async findById(id: string): Promise<Course> {
    return this.courseModel.findById(id).exec();
  }

  async update(id: string, updateData: Partial<Course>): Promise<Course> {
    return this.courseModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Course> {
    return this.courseModel.findByIdAndDelete(id).exec();
  }
} 