import { Student } from '../schemas/student.schema';
import { CreateStudentDto } from '../dtos/create-student.dto';

export interface IStudentService {
  getAllStudents(): Promise<Student[]>;
  getStudentById(id: string): Promise<Student>;
  getStudentByStudentId(studentId: string): Promise<Student>;
  createStudent(createStudentDto: CreateStudentDto): Promise<Student>;
  updateStudent(id: string, updateStudentDto: Partial<CreateStudentDto>): Promise<Student>;
  deleteStudent(id: string): Promise<void>;
  getStudentsByClass(className: string): Promise<Student[]>;
  addGrade(studentId: string, course: string, grade: number): Promise<Student>;
  getStudentGrades(studentId: string): Promise<Map<string, number>>;
} 