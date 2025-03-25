import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
  HttpStatus,
  Patch,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"
import type { ClassesService } from "../providers/classes.service"
import type { CreateClassDto } from "../dto/create-class.dto"
import type { UpdateClassDto } from "../dto/update-class.dto"
import type { EnrollStudentDto, EnrollMultipleStudentsDto } from "../dto/enroll-student.dto"
import { Class, ClassStatus } from "../schemas/class.schema"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../auth/guards/roles.guard"
import { ParseObjectIdPipe } from "../../schools/pipes/mongodb-id.pipe"

@ApiTags("classes")
@ApiBearerAuth()
@Controller("classes")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new class' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Class successfully created',
    type: Class,
  })
  create(
    @Body(new ValidationPipe({ transform: true }))
    createClassDto: CreateClassDto,
  ): Promise<Class> {
    return this.classesService.create(createClassDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all classes" })
  @ApiQuery({ name: "schoolId", required: false, description: "Filter by school ID" })
  @ApiQuery({ name: "instructorId", required: false, description: "Filter by instructor ID" })
  @ApiQuery({ name: "status", required: false, enum: ClassStatus, description: "Filter by class status" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "List of all classes",
    type: [Class],
  })
  findAll(
    @Query('schoolId') schoolId?: string,
    @Query('instructorId') instructorId?: string,
    @Query('status') status?: ClassStatus,
  ): Promise<Class[]> {
    const filters = {}
    if (schoolId) filters["schoolId"] = schoolId
    if (instructorId) filters["instructorId"] = instructorId
    if (status) filters["status"] = status

    return this.classesService.findAll(filters)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a class by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Class found',
    type: Class,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Class not found',
  })
  findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<Class> {
    return this.classesService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a class" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Class updated",
    type: Class,
  })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ValidationPipe({ transform: true }))
    updateClassDto: UpdateClassDto,
  ): Promise<Class> {
    return this.classesService.update(id, updateClassDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a class' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Class deleted',
  })
  async remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    await this.classesService.remove(id);
  }

  @Post(":id/enroll")
  @ApiOperation({ summary: "Enroll a student in a class" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Student enrolled in class",
    type: Class,
  })
  enrollStudent(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ValidationPipe({ transform: true }))
    enrollDto: EnrollStudentDto,
  ): Promise<Class> {
    return this.classesService.enrollStudent(id, enrollDto)
  }

  @Post(":id/enroll-multiple")
  @ApiOperation({ summary: "Enroll multiple students in a class" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Students enrolled in class",
    type: Class,
  })
  enrollMultipleStudents(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ValidationPipe({ transform: true }))
    enrollDto: EnrollMultipleStudentsDto,
  ): Promise<Class> {
    return this.classesService.enrollMultipleStudents(id, enrollDto)
  }

  @Delete(":id/students/:studentId")
  @ApiOperation({ summary: "Remove a student from a class" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Student removed from class",
    type: Class,
  })
  removeStudent(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('studentId', ParseObjectIdPipe) studentId: string,
  ): Promise<Class> {
    return this.classesService.removeStudent(id, studentId)
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Update class status" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Class status updated",
    type: Class,
  })
  updateStatus(@Param('id', ParseObjectIdPipe) id: string, @Body('status') status: ClassStatus): Promise<Class> {
    return this.classesService.updateClassStatus(id, status)
  }

  @Get('instructor/:instructorId')
  @ApiOperation({ summary: 'Get classes by instructor' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of classes by instructor',
    type: [Class],
  })
  getClassesByInstructor(
    @Param('instructorId', ParseObjectIdPipe) instructorId: string,
  ): Promise<Class[]> {
    return this.classesService.getClassesByInstructor(instructorId);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get classes by student' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of classes by student',
    type: [Class],
  })
  getClassesByStudent(
    @Param('studentId', ParseObjectIdPipe) studentId: string,
  ): Promise<Class[]> {
    return this.classesService.getClassesByStudent(studentId);
  }

  @Get('school/:schoolId')
  @ApiOperation({ summary: 'Get classes by school' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of classes by school',
    type: [Class],
  })
  getClassesBySchool(
    @Param('schoolId', ParseObjectIdPipe) schoolId: string,
  ): Promise<Class[]> {
    return this.classesService.getClassesBySchool(schoolId);
  }
}

