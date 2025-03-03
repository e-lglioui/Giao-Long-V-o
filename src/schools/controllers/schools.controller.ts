import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ValidationPipe,
  HttpStatus,
  Patch,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import type { SchoolsService } from "../providers/schools.service"
import type { CreateSchoolDto } from "../dto/create-school.dto"
import { School } from "../schemas/school.schema"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../auth/guards/roles.guard"

import { ParseObjectIdPipe } from "../pipes/mongodb-id.pipe"

@ApiTags("schools")
@ApiBearerAuth()
@Controller("schools")
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new school' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'School successfully created',
    type: School 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'School with this name already exists' 
  })
  create(
    @Body(new ValidationPipe({ transform: true })) 
    createSchoolDto: CreateSchoolDto
  ): Promise<School> {
    return this.schoolsService.create(createSchoolDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all schools" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "List of all schools",
    type: [School],
  })
  findAll(): Promise<School[]> {
    return this.schoolsService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a school by id' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'School found',
    type: School 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'School not found' 
  })
  findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<School> {
    return this.schoolsService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a school" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "School updated",
    type: School,
  })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ValidationPipe({ transform: true })) 
    updateSchoolDto: Partial<CreateSchoolDto>,
  ): Promise<School> {
    return this.schoolsService.update(id, updateSchoolDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a school' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'School deleted' 
  })
  async remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    await this.schoolsService.remove(id);
  }

  @Put(":id/instructors/:instructorId")
  @ApiOperation({ summary: "Add instructor to school" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Instructor added to school",
    type: School,
  })
  addInstructor(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('instructorId', ParseObjectIdPipe) instructorId: string,
  ): Promise<School> {
    return this.schoolsService.addInstructor(id, instructorId)
  }

  @Put(":id/students/:studentId")
  @ApiOperation({ summary: "Add student to school" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Student added to school",
    type: School,
  })
  addStudent(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('studentId', ParseObjectIdPipe) studentId: string,
  ): Promise<School> {
    return this.schoolsService.addStudent(id, studentId)
  }

  @Patch(":id/images")
  @ApiOperation({ summary: "Add image to school" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Image added to school",
    type: School,
  })
  addImage(@Param('id', ParseObjectIdPipe) id: string, @Body() body: { imageUrl: string }): Promise<School> {
    return this.schoolsService.addImage(id, body.imageUrl)
  }

  @Patch(":id/schedule")
  @ApiOperation({ summary: "Update school schedule" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "School schedule updated",
    type: School,
  })
  updateSchedule(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() schedule: { openingTime: string; closingTime: string; operatingDays?: string[] },
  ): Promise<School> {
    return this.schoolsService.updateSchedule(id, schedule)
  }
}

