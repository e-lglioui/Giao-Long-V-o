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
  ParseUUIDPipe,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth 
} from '@nestjs/swagger';
import { SchoolsService } from '../providers/schools.service';
import { CreateSchoolDto } from '../dto/create-school.dto';
import { School } from '../schemas/school.schema';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';

@ApiTags('schools')
@ApiBearerAuth()
@Controller('schools')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Post()
  @Roles(Role.ADMIN)
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
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Get all schools' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'List of all schools',
    type: [School] 
  })
  findAll(): Promise<School[]> {
    return this.schoolsService.findAll();
  }
  @Get(':id')
  @Roles(Role.ADMIN, Role.STAFF)
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
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<School> {
    return this.schoolsService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a school' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'School updated',
    type: School 
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe({ transform: true })) 
    updateSchoolDto: Partial<CreateSchoolDto>
  ): Promise<School> {
    return this.schoolsService.update(id, updateSchoolDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a school' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'School deleted' 
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.schoolsService.remove(id);
  }

  @Put(':id/instructors/:instructorId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Add instructor to school' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Instructor added to school',
    type: School 
  })
  addInstructor(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('instructorId', ParseUUIDPipe) instructorId: string
  ): Promise<School> {
    return this.schoolsService.addInstructor(id, instructorId);
  }

  @Put(':id/students/:studentId')
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Add student to school' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Student added to school',
    type: School 
  })
  addStudent(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('studentId', ParseUUIDPipe) studentId: string
  ): Promise<School> {
    return this.schoolsService.addStudent(id, studentId);
  }
} 