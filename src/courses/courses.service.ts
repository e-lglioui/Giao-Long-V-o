import { Injectable, NotFoundException } from '@nestjs/common';
import { CoursesRepository } from './courses.repository';
import { Course } from './interfaces/course.interface';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  async createCourse(createCourseDto: CreateCourseDto): Promise<Course> {
    return this.coursesRepository.create(createCourseDto);
  }

  async getAllCourses(): Promise<Course[]> {
    return this.coursesRepository.findAll();
  }

  async getCourseById(id: string): Promise<Course> {
    const course = await this.coursesRepository.findById(id);
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async updateCourse(id: string, updateData: Partial<Course>): Promise<Course> {
    const course = await this.coursesRepository.update(id, updateData);
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async deleteCourse(id: string): Promise<Course> {
    const course = await this.coursesRepository.delete(id);
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }
}