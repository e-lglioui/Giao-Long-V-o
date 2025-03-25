import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  ValidationPipe,
  NotFoundException,
  ForbiddenException,
  Logger,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from "@nestjs/common"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../auth/guards/roles.guard"
import { PermissionsGuard } from "../../auth/guards/permissions.guard"
import { Roles } from "../../auth/decorators/roles.decorator"
import { RequirePermissions } from "../../auth/decorators/permissions.decorator"
import { Role } from "../../auth/enums/role.enum"
import { Permission } from "../../auth/enums/permission.enum"
import { User } from "../../auth/decorators/user.decorator"
import { SchoolsService } from "../providers/schools.service"
import { CreateSchoolDto } from "../dto/create-school.dto"
import { School } from "../schemas/school.schema"
import { ParseObjectIdPipe } from "../pipes/mongodb-id.pipe"
import { InstructorsService } from "../../instructors/providers/instructors.service"
import { CreateInstructorDto } from "../../instructors/dto/create-instructor.dto"
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from "@nestjs/swagger"
import { HttpStatus } from "@nestjs/common"
import type { Express } from "express"

@ApiTags("school-admin/schools")
@ApiBearerAuth()
@Controller("school-admin/schools")
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SCHOOL_ADMIN)
export class SchoolAdminSchoolsController {
  private readonly logger = new Logger(SchoolAdminSchoolsController.name)

  constructor(
    private readonly schoolsService: SchoolsService,
    private readonly instructorsService: InstructorsService,
  ) {
    this.logger.log("SchoolAdminSchoolsController initialized")
  }

  @Post()
  @RequirePermissions(Permission.SCHOOL_CREATE)
  @ApiOperation({ summary: "Create a new school (school admin can only create one)" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "School successfully created",
    type: School,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "School with this name already exists or admin already has a school",
  })
  async create(
    @Body(new ValidationPipe({ transform: true, whitelist: true })) 
    createSchoolDto: CreateSchoolDto,
    @User() user: any,
  ): Promise<School> {
    // Check if admin already has a school
    const adminSchools = await this.schoolsService.findSchoolsByAdmin(user.id)

    if (adminSchools.length > 0) {
      throw new ForbiddenException("School admin can only create one school")
    }

    // Create the school
    const school = await this.schoolsService.create({
      ...createSchoolDto,
      adminId: user.id, // Associate the school with this admin
    })

    return school
  }

  @Get('my-school')
  @RequirePermissions(Permission.SCHOOL_READ)
  @ApiOperation({ summary: 'Get the school admin\'s school' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'School found',
    type: School
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'School not found' 
  })
  async getMySchool(@User() user: any): Promise<School> {
    const schools = await this.schoolsService.findSchoolsByAdmin(user.id);
    
    if (schools.length === 0) {
      throw new NotFoundException('You do not have a school yet');
    }
    
    return schools[0]; // Return the first (and should be only) school
  }

  @Put("my-school")
  @RequirePermissions(Permission.SCHOOL_UPDATE)
  @ApiOperation({ summary: "Update the school admin's school" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "School updated",
    type: School,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "School not found",
  })
  async updateMySchool(
    @Body(new ValidationPipe({ transform: true })) 
    updateSchoolDto: Partial<CreateSchoolDto>,
    @User() user: any,
  ): Promise<School> {
    const schools = await this.schoolsService.findSchoolsByAdmin(user.id)

    if (schools.length === 0) {
      throw new NotFoundException("You do not have a school yet")
    }

    return this.schoolsService.update(schools[0]._id.toString(), updateSchoolDto)
  }

  @Post("my-school/images")
  @RequirePermissions(Permission.SCHOOL_UPDATE)
  @ApiOperation({ summary: "Upload an image for the school admin's school" })
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
  async uploadImage(@UploadedFile() file: Express.Multer.File, @User() user: any): Promise<School> {
    if (!file) {
      throw new Error("No image file uploaded")
    }

    const schools = await this.schoolsService.findSchoolsByAdmin(user.id)

    if (schools.length === 0) {
      throw new NotFoundException("You do not have a school yet")
    }

    const imageUrl = `/images/${file.filename}`
    return this.schoolsService.addImage(schools[0]._id.toString(), imageUrl)
  }

  @Post("my-school/multiple-images")
  @RequirePermissions(Permission.SCHOOL_UPDATE)
  @ApiOperation({ summary: "Upload multiple images for the school admin's school" })
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
  async uploadMultipleImages(@UploadedFiles() files: Array<Express.Multer.File>, @User() user: any): Promise<School> {
    const schools = await this.schoolsService.findSchoolsByAdmin(user.id)

    if (schools.length === 0) {
      throw new NotFoundException("You do not have a school yet")
    }

    let school = schools[0]
    const schoolId = school._id.toString()

    for (const file of files) {
      const imageUrl = `/images/${file.filename}`
      school = await this.schoolsService.addImage(schoolId, imageUrl)
    }

    return school
  }

  @Post("my-school/instructors")
  @RequirePermissions(Permission.SCHOOL_MANAGE_STAFF)
  @ApiOperation({ summary: "Add new instructor to the school admin's school" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Instructor created and added to school",
    type: School,
  })
  async addInstructor(
    @Body(new ValidationPipe({ transform: true })) createInstructorDto: CreateInstructorDto,
    @User() user: any,
  ): Promise<School> {
    const schools = await this.schoolsService.findSchoolsByAdmin(user.id)

    if (schools.length === 0) {
      throw new NotFoundException("You do not have a school yet")
    }

    // Create the instructor first
    const instructor = await this.instructorsService.create(createInstructorDto)

    // Then add the instructor to the school
    return this.schoolsService.addInstructor(schools[0]._id.toString(), instructor.userId.toString())
  }

  @Put("my-school/instructors/:instructorId")
  @RequirePermissions(Permission.SCHOOL_MANAGE_STAFF)
  @ApiOperation({ summary: "Add existing instructor to the school admin's school" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Instructor added to school",
    type: School,
  })
  async addExistingInstructor(
    @Param('instructorId', ParseObjectIdPipe) instructorId: string,
    @User() user: any,
  ): Promise<School> {
    const schools = await this.schoolsService.findSchoolsByAdmin(user.id)

    if (schools.length === 0) {
      throw new NotFoundException("You do not have a school yet")
    }

    return this.schoolsService.addInstructor(schools[0]._id.toString(), instructorId)
  }

  @Put("my-school/students/:studentId")
  // @RequirePermissions(Permission.SCHOOL_MANAGE_STUDENTS)
  @ApiOperation({ summary: "Add student to the school admin's school" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Student added to school",
    type: School,
  })
  async addStudent(@Param('studentId', ParseObjectIdPipe) studentId: string, @User() user: any): Promise<School> {
    const schools = await this.schoolsService.findSchoolsByAdmin(user.id)

    if (schools.length === 0) {
      throw new NotFoundException("You do not have a school yet")
    }

    return this.schoolsService.addStudent(schools[0]._id.toString(), studentId)
  }
}