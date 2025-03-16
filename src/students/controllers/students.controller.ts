import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StudentService } from '../providers/student.service';
import { CreateStudentDto } from '../dtos/create-student.dto';
import { Student } from '../schemas/student.schema';
// import { Roles } from '../../auth/decorators/roles.decorator';
// import { Role } from '../../auth/enums/role.enum';
// import { RolesGuard } from '../../auth/guards/roles.guard';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('students')
@Controller('students')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  // @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get all students' })
  async getAllStudents(): Promise<Student[]> {
    return this.studentService.getAllStudents();
  }

  @Get(':id')
  // @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get student by ID' })
  async getStudentById(@Param('id') id: string): Promise<Student> {
    return this.studentService.getStudentById(id);
  }

  @Post()
  // @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create new student' })
  async createStudent(@Body() createStudentDto: CreateStudentDto): Promise<Student> {
    return this.studentService.createStudent(createStudentDto);
  }

  @Get('class/:className')
  // @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get students by class' })
  async getStudentsByClass(@Param('className') className: string): Promise<Student[]> {
    return this.studentService.getStudentsByClass(className);
  }

  @Put(':id/grades')
  // @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Add grade to student' })
  async addGrade(
    @Param('id') id: string,
    @Body() gradeData: { course: string; grade: number }
  ): Promise<Student> {
    return this.studentService.addGrade(id, gradeData.course, gradeData.grade);
  }
} 