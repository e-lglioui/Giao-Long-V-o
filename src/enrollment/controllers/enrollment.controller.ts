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
import type { EnrollmentService } from "../providers/enrollment.service"
import type { CreateEnrollmentDto } from "../dto/create-enrollment.dto"
import { Enrollment, EnrollmentStatus } from "../schemas/enrollment.schema"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../auth/guards/roles.guard"
import { ParseObjectIdPipe } from "../../schools/pipes/mongodb-id.pipe"

@ApiTags("enrollments")
@ApiBearerAuth()
@Controller("enrollments")
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new enrollment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Enrollment successfully created',
    type: Enrollment,
  })
  create(
    @Body(new ValidationPipe({ transform: true }))
    createEnrollmentDto: CreateEnrollmentDto,
  ): Promise<Enrollment> {
    return this.enrollmentService.create(createEnrollmentDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all enrollments" })
  @ApiQuery({ name: "studentId", required: false, description: "Filter by student ID" })
  @ApiQuery({ name: "schoolId", required: false, description: "Filter by school ID" })
  @ApiQuery({ name: "status", required: false, enum: EnrollmentStatus, description: "Filter by enrollment status" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "List of all enrollments",
    type: [Enrollment],
  })
  findAll(
    @Query('studentId') studentId?: string,
    @Query('schoolId') schoolId?: string,
    @Query('status') status?: EnrollmentStatus,
  ): Promise<Enrollment[]> {
    const filters = {}
    if (studentId) filters["studentId"] = studentId
    if (schoolId) filters["schoolId"] = schoolId
    if (status) filters["status"] = status

    return this.enrollmentService.findAll(filters)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an enrollment by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Enrollment found',
    type: Enrollment,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Enrollment not found',
  })
  findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<Enrollment> {
    return this.enrollmentService.findOne(id);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get enrollments by student' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of enrollments by student',
    type: [Enrollment],
  })
  findByStudent(
    @Param('studentId', ParseObjectIdPipe) studentId: string,
  ): Promise<Enrollment[]> {
    return this.enrollmentService.findByStudent(studentId);
  }

  @Get('school/:schoolId')
  @ApiOperation({ summary: 'Get enrollments by school' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of enrollments by school',
    type: [Enrollment],
  })
  findBySchool(
    @Param('schoolId', ParseObjectIdPipe) schoolId: string,
  ): Promise<Enrollment[]> {
    return this.enrollmentService.findBySchool(schoolId);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update an enrollment" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Enrollment updated",
    type: Enrollment,
  })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ValidationPipe({ transform: true }))
    updateData: Partial<CreateEnrollmentDto>,
  ): Promise<Enrollment> {
    return this.enrollmentService.update(id, updateData)
  }

  @Post(":id/classes/:classId")
  @ApiOperation({ summary: "Add a class to an enrollment" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Class added to enrollment",
    type: Enrollment,
  })
  addClassToEnrollment(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('classId', ParseObjectIdPipe) classId: string,
  ): Promise<Enrollment> {
    return this.enrollmentService.addClassToEnrollment(id, classId)
  }

  @Delete(":id/classes/:classId")
  @ApiOperation({ summary: "Remove a class from an enrollment" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Class removed from enrollment",
    type: Enrollment,
  })
  removeClassFromEnrollment(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('classId', ParseObjectIdPipe) classId: string,
  ): Promise<Enrollment> {
    return this.enrollmentService.removeClassFromEnrollment(id, classId)
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Update enrollment status" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Enrollment status updated",
    type: Enrollment,
  })
  updateStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body('status') status: EnrollmentStatus,
  ): Promise<Enrollment> {
    return this.enrollmentService.updateStatus(id, status)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an enrollment' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Enrollment deleted',
  })
  async remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    await this.enrollmentService.remove(id);
  }
}

