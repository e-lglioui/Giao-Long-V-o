import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
  Logger,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from "@nestjs/swagger"
import { FileInterceptor } from "@nestjs/platform-express"
import { Express } from "express"
import { InstructorsService } from "../providers/instructors.service"
import { CreateInstructorDto, CertificationDto } from "../dto/create-instructor.dto"
import { UpdateInstructorDto } from "../dto/update-instructor.dto"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../auth/guards/roles.guard"
import { Roles } from "../../auth/decorators/roles.decorator"
import { Role } from "../../auth/enums/role.enum"
import { ParseObjectIdPipe } from "../../common/pipes/parse-objectid.pipe"
import { Certification } from "../schemas/instructor-profile.schema"
import { diskStorage } from "multer"
import { extname } from "path"
import { existsSync, mkdirSync } from "fs"

@ApiTags("instructors")
@Controller("instructors")
export class InstructorsController {
  private readonly logger = new Logger(InstructorsController.name)

  constructor(private readonly instructorsService: InstructorsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new instructor' })
  @ApiResponse({ status: 201, description: 'Instructor successfully created' })
  async create(@Body(new ValidationPipe()) createInstructorDto: CreateInstructorDto) {
    this.logger.log('Creating new instructor');
    return this.instructorsService.create(createInstructorDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get all instructors" })
  async findAll() {
    this.logger.log("Getting all instructors")
    return this.instructorsService.findAll()
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get instructor by id' })
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    this.logger.log(`Getting instructor with id: ${id}`);
    return this.instructorsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: "Update instructor by id" })
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ValidationPipe()) updateInstructorDto: UpdateInstructorDto,
  ) {
    this.logger.log(`Updating instructor with id: ${id}`)
    return this.instructorsService.update(id, updateInstructorDto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete instructor by id' })
  async remove(@Param('id', ParseObjectIdPipe) id: string) {
    this.logger.log(`Deleting instructor with id: ${id}`);
    return this.instructorsService.remove(id);
  }

  @Post(":id/profile-image")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Upload profile image" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = "./uploads/images"
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true })
          }
          callback(null, uploadPath)
        },
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
          const ext = extname(file.originalname)
          callback(null, `image-${uniqueSuffix}${ext}`)
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException("Only image files are allowed!"), false)
        }
        cb(null, true)
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    }),
  )
  async uploadProfileImage(@Param('id', ParseObjectIdPipe) id: string, @UploadedFile() file: Express.Multer.File) {
    this.logger.log(`Uploading profile image for instructor: ${id}`)
    this.logger.debug(`File received: ${JSON.stringify(file, null, 2)}`)

    if (!file) {
      throw new BadRequestException("No image file uploaded")
    }

    this.logger.debug(`File properties: ${file.fieldname}, ${file.originalname}, ${file.filename}, ${file.path}`)

    const imageUrl = `/images/${file.filename}`
    this.logger.log(`Image URL will be: ${imageUrl}`)
    return this.instructorsService.addProfileImage(id, imageUrl)
  }

  @Post(":id/certificate")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Upload certification document" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("certificate", {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = "./uploads/documents"
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true })
          }
          callback(null, uploadPath)
        },
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
          const ext = extname(file.originalname)
          callback(null, `certificate-${uniqueSuffix}${ext}`)
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(pdf)$/)) {
          return cb(new BadRequestException("Only PDF files are allowed!"), false)
        }
        cb(null, true)
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadCertificate(
    @Param('id', ParseObjectIdPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() certificationDetails: CertificationDto,
  ) {
    this.logger.log(`Uploading certificate for instructor: ${id}`)

    if (!file) {
      throw new BadRequestException("No certificate file uploaded")
    }

    const fileUrl = `/documents/${file.filename}`
    this.logger.log(`Certificate URL will be: ${fileUrl}`)

    // Create certification object with file path
    const certification: Certification = {
      name: certificationDetails.name,
      issuingOrganization: certificationDetails.issuingOrganization,
      issueDate: certificationDetails.issueDate,
      expiryDate: certificationDetails.expiryDate,
      certificateFile: fileUrl,
    }

    return this.instructorsService.addCertification(id, certification)
  }

  @Post(":id/sports-passport")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Upload sports passport" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("passport", {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = "./uploads/documents"
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true })
          }
          callback(null, uploadPath)
        },
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
          const ext = extname(file.originalname)
          callback(null, `passport-${uniqueSuffix}${ext}`)
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(pdf)$/)) {
          return cb(new BadRequestException("Only PDF files are allowed!"), false)
        }
        cb(null, true)
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadSportsPassport(@Param('id', ParseObjectIdPipe) id: string, @UploadedFile() file: Express.Multer.File) {
    this.logger.log(`Uploading sports passport for instructor: ${id}`)

    if (!file) {
      throw new BadRequestException("No passport file uploaded")
    }

    const fileUrl = `/documents/${file.filename}`
    this.logger.log(`Sports passport URL will be: ${fileUrl}`)

    return this.instructorsService.updateSportsPassport(id, fileUrl)
  }

  @Get(':id/full-profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get instructor full profile including schools' })
  async getFullProfile(@Param('id', ParseObjectIdPipe) id: string) {
    this.logger.log(`Getting full profile for instructor: ${id}`);
    return this.instructorsService.getFullProfile(id);
  }
}

