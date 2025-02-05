import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CoursesRepository } from './courses.repository';
import CourseSchema from './schemas/courses.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Course', schema: CourseSchema }])
  ],
  controllers: [CoursesController],
  providers: [CoursesService, CoursesRepository],
  exports: [CoursesService]
})
export class CoursesModule {}
