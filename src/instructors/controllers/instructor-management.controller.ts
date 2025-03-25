import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Get, 
  Param, 
  Put, 
  Delete, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException,
  Logger
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { Role } from '../../auth/enums/role.enum';
import { Permission } from '../../auth/enums/permission.enum';
import { InstructorManagementService } from '../providers/instructor-management.service';
import { User } from '../../auth/decorators/user.decorator';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CertificationDto } from '../dto/create-instructor.dto';

@ApiTags('school-instructors')
@Controller('schools/:schoolId/instructors')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
export class InstructorManagementController {
  private readonly logger = new Logger(InstructorManagementController.name);

  constructor(
    private readonly instructorManagementService: InstructorManagementService,
  ) {}

  // Add a new instructor
  @Post()
  @RequirePermissions(Permission.INSTRUCTOR_CREATE)
  @ApiOperation({ summary: 'Add a new instructor to a school' })
  async addInstructor(
    @Param('schoolId') schoolId: string,
    @Body() createInstructorDto: any,
    @User() user: any
  ) {
    return this.instructorManagementService.addInstructor(schoolId, createInstructorDto, user);
  }

  // Get all instructors for a school
  @Get()
  @RequirePermissions(Permission.INSTRUCTOR_READ)
  @ApiOperation({ summary: 'Get all instructors for a school' })
  async getInstructors(
    @Param('schoolId') schoolId: string,
    @User() user: any
  ) {
    return this.instructorManagementService.getInstructorsBySchool(schoolId, user);
  }
// Get instructor details
  @Get(':instructorId')
  @RequirePermissions(Permission.INSTRUCTOR_READ)
  @ApiOperation({ summary: 'Get instructor details' })
  async getInstructorById(
    @Param('schoolId') schoolId: string,
    @Param('instructorId') instructorId: string,
    @User() user: any
  ) {
    return this.instructorManagementService.getInstructorById(schoolId, instructorId, user);
  }

  // Update instructor details
  @Put(':instructorId')
  @RequirePermissions(Permission.INSTRUCTOR_UPDATE)
  @ApiOperation({ summary: 'Update instructor details' })
  async updateInstructor(
    @Param('schoolId') schoolId: string,
    @Param('instructorId') instructorId: string,
    @Body() updateInstructorDto: any,
    @User() user: any
  ) {
    return this.instructorManagementService.updateInstructor(
      schoolId, 
      instructorId, 
      updateInstructorDto, 
      user
    );
  }

  // Remove instructor from school
  @Delete(':instructorId')
  @RequirePermissions(Permission.INSTRUCTOR_DELETE)
  @ApiOperation({ summary: 'Remove instructor from school' })
  async removeInstructor(
    @Param('schoolId') schoolId: string,
    @Param('instructorId') instructorId: string,
    @User() user: any
  ) {
    return this.instructorManagementService.removeInstructor(schoolId, instructorId, user);
  }

  // Upload profile image for instructor
  @Post(':instructorId/profile-image')
  @RequirePermissions(Permission.INSTRUCTOR_UPDATE)
  @ApiOperation({ summary: 'Upload profile image for instructor' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = './uploads/images';
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `school-instructor-image-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    }),
  )
  async uploadProfileImage(
    @Param('schoolId') schoolId: string,
    @Param('instructorId') instructorId: string,
    @UploadedFile() file: Express.Multer.File,
    @User() user: any
  ) {
    this.logger.log(`Uploading profile image for instructor ${instructorId} in school ${schoolId}`);
    
    if (!file) {
      throw new BadRequestException('No image file uploaded');
    }

    const imageUrl = `/images/${file.filename}`;
    return this.instructorManagementService.addProfileImage(
      schoolId,
      instructorId,
      imageUrl,
      user
    );
  }

  // Upload certification for instructor
  @Post(':instructorId/certificate')
  @RequirePermissions(Permission.INSTRUCTOR_UPDATE)
  @ApiOperation({ summary: 'Upload certification document for instructor' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('certificate', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = './uploads/documents';
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `school-instructor-certificate-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(pdf)$/)) {
          return cb(new BadRequestException('Only PDF files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadCertificate(
    @Param('schoolId') schoolId: string,
    @Param('instructorId') instructorId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() certificationDetails: CertificationDto,
    @User() user: any
  ) {
    this.logger.log(`Uploading certificate for instructor ${instructorId} in school ${schoolId}`);

    if (!file) {
      throw new BadRequestException('No certificate file uploaded');
    }

    const fileUrl = `/documents/${file.filename}`;
    
    // Create certification object with file path
    const certification = {
      name: certificationDetails.name,
      issuingOrganization: certificationDetails.issuingOrganization,
      issueDate: certificationDetails.issueDate,
      expiryDate: certificationDetails.expiryDate,
      certificateFile: fileUrl,
    };

    return this.instructorManagementService.addCertification(
      schoolId,
      instructorId,
      certification,
      user
    );
  }

  // Upload sports passport for instructor
  @Post(':instructorId/sports-passport')
  @RequirePermissions(Permission.INSTRUCTOR_UPDATE)
  @ApiOperation({ summary: 'Upload sports passport for instructor' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('passport', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = './uploads/documents';
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `school-instructor-passport-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(pdf)$/)) {
          return cb(new BadRequestException('Only PDF files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadSportsPassport(
    @Param('schoolId') schoolId: string,
    @Param('instructorId') instructorId: string,
    @UploadedFile() file: Express.Multer.File,
    @User() user: any
  ) {
    this.logger.log(`Uploading sports passport for instructor ${instructorId} in school ${schoolId}`);

    if (!file) {
      throw new BadRequestException('No passport file uploaded');
    }

    const fileUrl = `/documents/${file.filename}`;
    
    return this.instructorManagementService.updateSportsPassport(
      schoolId,
      instructorId,
      fileUrl,
      user
    );
  }

  // Get instructor full profile including certifications and documents
  @Get(':instructorId/full-profile')
  @RequirePermissions(Permission.INSTRUCTOR_READ)
  @ApiOperation({ summary: 'Get instructor full profile including certifications and documents' })
  async getFullProfile(
    @Param('schoolId') schoolId: string,
    @Param('instructorId') instructorId: string,
    @User() user: any
  ) {
    this.logger.log(`Getting full profile for instructor ${instructorId} in school ${schoolId}`);
    return this.instructorManagementService.getFullProfile(schoolId, instructorId, user);
  }
}