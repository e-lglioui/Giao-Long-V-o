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
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Query,
  Logger,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from "@nestjs/swagger"
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express"
import type { Express } from "express"
import { SchoolsService } from "../providers/schools.service"
import  { CreateSchoolDto } from "../dto/create-school.dto"
import { School } from "../schemas/school.schema"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../auth/guards/roles.guard"
import { ParseObjectIdPipe } from "../pipes/mongodb-id.pipe"
import { InstructorsService } from "../../instructors/providers/instructors.service"
import { CreateInstructorDto } from "../../instructors/dto/create-instructor.dto"

@ApiTags("schools")
@ApiBearerAuth()
@Controller("schools")
export class SchoolsController {
  private readonly logger = new Logger(SchoolsController.name)

  constructor(
    private readonly schoolsService: SchoolsService,
    private readonly instructorsService: InstructorsService,
  ) {
    this.logger.log("SchoolsController initialized")
  }

  @Get("map")
  @ApiOperation({ summary: "Get all schools with location data for map display" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "List of schools with location data",
    type: [School],
  })
  async getSchoolsForMap(): Promise<School[]> {
    this.logger.log("Getting schools for map")
    const schools = await this.schoolsService.findAll()
    return schools.filter(
      (school) =>
        school.location &&
        typeof school.location.latitude === "number" &&
        typeof school.location.longitude === "number",
    )
  }

  @Get("nearby")
  @ApiOperation({ summary: "Find schools near a location" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "List of nearby schools",
    type: [School],
  })
  @ApiQuery({ name: "latitude", required: true, type: Number })
  @ApiQuery({ name: "longitude", required: true, type: Number })
  @ApiQuery({ name: "maxDistance", required: false, type: Number })
  findNearbySchools(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('maxDistance') maxDistance?: string,
  ): Promise<School[]> {
    this.logger.log(`Finding nearby schools at lat: ${latitude}, lng: ${longitude}`)
    return this.schoolsService.findNearbySchools(
      Number(latitude),
      Number(longitude),
      maxDistance ? Number(maxDistance) : undefined,
    )
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
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
    @Body(new ValidationPipe({ 
      transform: true,
      whitelist: true 
    })) 
    createSchoolDto: CreateSchoolDto
  ): Promise<School> {
    return this.schoolsService.create(createSchoolDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN, Role.STAFF)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN, Role.STAFF)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a school' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'School deleted' 
  })
  async remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    await this.schoolsService.remove(id);
  }

  @Post(":id/images")
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Upload an image for a school" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        image: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Image uploaded successfully",
    type: School,
  })
  @UseInterceptors(FileInterceptor("image"))
  async uploadImage(
    @Param('id', ParseObjectIdPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<School> {
    if (!file) {
      throw new Error("No image file uploaded")
    }
    const imageUrl = `/images/${file.filename}`
    return this.schoolsService.addImage(id, imageUrl)
  }

  @Post(":id/multiple-images")
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Upload multiple images for a school" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        images: {
          type: "array",
          items: {
            type: "string",
            format: "binary",
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Images uploaded successfully",
    type: School,
  })
  @UseInterceptors(FilesInterceptor("images", 10))
  async uploadMultipleImages(
    @Param('id', ParseObjectIdPipe) id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<School> {
    let school = await this.schoolsService.findOne(id)

    for (const file of files) {
      const imageUrl = `/images/${file.filename}`
      school = await this.schoolsService.addImage(id, imageUrl)
    }

    return school
  }

  @Post(":id/instructors")
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Add new instructor to school" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Instructor created and added to school",
    type: School,
  })
  @Post(":id/instructors")
  @UseGuards(JwtAuthGuard, RolesGuard)
  async addInstructor(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ValidationPipe({ transform: true })) createInstructorDto: CreateInstructorDto,
  ): Promise<School> {
    this.logger.log(`Creating and adding instructor to school ${id}`)
  
    // Create the instructor first
    const instructor = await this.instructorsService.create(createInstructorDto)
    
    // Log the instructor object to see its structure
    this.logger.log(`Instructor created: ${JSON.stringify(instructor)}`)
    
    // Log both potential ID formats
    this.logger.log(`Instructor _id: ${instructor._id}`)
    this.logger.log(`Instructor id: ${instructor.id}`)
    
    // Make sure we're passing just the ID, not the entire instructor object
    const instructorId = instructor._id.toString() || instructor.id
    this.logger.log(`Using instructor ID: ${instructorId}`)
    
    // Then add the instructor to the school
    return this.schoolsService.addInstructor(id, instructorId)
  }

  @Put(":id/instructors/:instructorId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Add existing instructor to school" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Instructor added to school",
    type: School,
  })
  addExistingInstructor(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('instructorId', ParseObjectIdPipe) instructorId: string,
  ): Promise<School> {
    return this.schoolsService.addInstructor(id, instructorId)
  }

  @Put(":id/students/:studentId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN, Role.STAFF)
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
}

