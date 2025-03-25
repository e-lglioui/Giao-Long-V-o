import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Query
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProgressService } from '../providers/progress.service';
import { CreateProgressDto } from '../dto/create-progress.dto';
import { 
  UpdateProgressDto, 
  ExamResultDto, 
  SkillEvaluationDto 
} from '../dto/update-progress.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';

@ApiTags('progress')
@Controller('progress')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post()
  @Roles(Role.SCHOOL_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Create progress record' })
  async create(@Body() createProgressDto: CreateProgressDto) {
    return this.progressService.create(createProgressDto);
  }

  @Get()
  @Roles(Role.SCHOOL_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Get all progress records' })
  async findAll() {
    return this.progressService.findAll();
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get student progress' })
  async findByStudent(@Param('studentId') studentId: string) {
    return this.progressService.findByStudent(studentId);
  }

  @Get('dashboard/:studentId')
  @ApiOperation({ summary: 'Get student dashboard' })
  async getStudentDashboard(@Param('studentId') studentId: string) {
    return this.progressService.getStudentDashboard(studentId);
  }

  @Post(':id/exam')
  @Roles(Role.SCHOOL_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Add exam result' })
  async addExamResult(
    @Param('id') id: string,
    @Body() examResult: ExamResultDto
  ) {
    return this.progressService.addExamResult(id, examResult);
  }

  @Post(':id/skill')
  @Roles(Role.SCHOOL_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Evaluate skill' })
  async evaluateSkill(
    @Param('id') id: string,
    @Body() evaluation: SkillEvaluationDto
  ) {
    return this.progressService.evaluateSkill(id, evaluation);
  }

  @Put(':id')
  @Roles(Role.SCHOOL_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Update progress record' })
  async update(
    @Param('id') id: string,
    @Body() updateProgressDto: UpdateProgressDto
  ) {
    return this.progressService.update(id, updateProgressDto);
  }
} 