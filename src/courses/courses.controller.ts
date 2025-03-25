import { Controller, Get, Post, Put, Delete, Body, Param, HttpStatus } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { Course } from './interfaces/course.interface';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  async createCourse(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return this.coursesService.createCourse(createCourseDto);
  }

  @Get()
  async getAllCourses(): Promise<Course[]> {
    return this.coursesService.getAllCourses();
  }

  @Get(':id')
  async getCourseById(@Param('id') id: string): Promise<Course> {
    return this.coursesService.getCourseById(id);
  }

  @Put(':id')
  async updateCourse(
    @Param('id') id: string,
    @Body() updateData: Partial<Course>
  ): Promise<Course> {
    return this.coursesService.updateCourse(id, updateData);
  }

  @Delete(':id')
  async deleteCourse(@Param('id') id: string): Promise<Course> {
    return this.coursesService.deleteCourse(id);
  }
} 