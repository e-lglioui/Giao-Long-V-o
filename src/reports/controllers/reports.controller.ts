import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportsService } from '../providers/reports.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @Roles(Role.SCHOOL_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Generate new report' })
  async generateReport(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.generateReport(createReportDto);
  }

  @Get()
  @Roles(Role.SCHOOL_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Get all reports' })
  async findAll(@Query() filters: any) {
    return this.reportsService.findAll(filters);
  }

  @Get(':id')
  @Roles(Role.SCHOOL_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Get report by id' })
  async findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Post(':id/archive')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Archive report' })
  async archiveReport(@Param('id') id: string) {
    return this.reportsService.archiveReport(id);
  }
} 