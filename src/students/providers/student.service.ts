import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student } from '../schemas/student.schema';
import { CreateStudentDto } from '../dtos/create-student.dto';
import { IStudentService } from '../interfaces/student.interface';

@Injectable()
export class StudentService implements IStudentService {
  constructor(
    @InjectModel(Student.name) private readonly studentModel: Model<Student>
  ) {}

  async getAllStudents(): Promise<Student[]> {
    return this.studentModel.find().exec();
  }

  async getStudentById(id: string): Promise<Student> {
    const student = await this.studentModel.findById(id).exec();
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async getStudentByStudentId(studentId: string): Promise<Student> {
    const student = await this.studentModel.findOne({ studentId }).exec();
    if (!student) {
      throw new NotFoundException(`Student with student ID ${studentId} not found`);
    }
    return student;
  }

  async createStudent(createStudentDto: CreateStudentDto): Promise<Student> {
    const newStudent = new this.studentModel(createStudentDto);
    return newStudent.save();
  }

  async updateStudent(id: string, updateStudentDto: Partial<CreateStudentDto>): Promise<Student> {
    const updatedStudent = await this.studentModel
      .findByIdAndUpdate(id, updateStudentDto, { new: true })
      .exec();
    if (!updatedStudent) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return updatedStudent;
  }

  async deleteStudent(id: string): Promise<void> {
    const result = await this.studentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
  }

  async getStudentsByClass(className: string): Promise<Student[]> {
    return this.studentModel.find({ class: className }).exec();
  }

  async addGrade(studentId: string, course: string, grade: number): Promise<Student> {
    const student = await this.studentModel.findById(studentId).exec();
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    if (!student.grades) {
      student.grades = new Map();
    }
    student.grades.set(course, grade);
    return student.save();
  }

  async getStudentGrades(studentId: string): Promise<Map<string, number>> {
    const student = await this.getStudentById(studentId);
    return student.grades || new Map();
  }
} 