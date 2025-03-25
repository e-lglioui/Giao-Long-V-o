import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentsController } from './controllers/students.controller';
import { StudentService } from './providers/student.service';
import { Student, StudentSchema } from './schemas/student.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema }
    ])
  ],
  controllers: [StudentsController],
  providers: [StudentService],
  exports: [StudentService]
})
export class StudentsModule {} 