import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from '../providers/attendance.service';
import { CreateAttendanceDto } from '../dto/create-attendance.dto';
import { Attendance } from '../schemas/attendance.schema';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { ParseDatePipe } from '../../common/pipes/parse-date.pipe';

@ApiTags('attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Create attendance record' })
  async create(@Body() createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get all attendance records' })
  async findAll(): Promise<Attendance[]> {
    return this.attendanceService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get attendance record by id' })
  async findOne(@Param('id') id: string): Promise<Attendance> {
    return this.attendanceService.findOne(id);
  }

  @Get('student/:studentId')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Get attendance records by student' })
  async findByStudent(@Param('studentId') studentId: string): Promise<Attendance[]> {
    return this.attendanceService.findByStudent(studentId);
  }

  @Get('course/:courseId')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get attendance records by course' })
  async findByCourse(@Param('courseId') courseId: string): Promise<Attendance[]> {
    return this.attendanceService.findByCourse(courseId);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Update attendance record' })
  async update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: Partial<CreateAttendanceDto>
  ): Promise<Attendance> {
    return this.attendanceService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete attendance record' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.attendanceService.remove(id);
  }

  @Get('stats/:schoolId')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get attendance statistics for a school' })
  @ApiQuery({ 
    name: 'startDate', 
    required: true, 
    type: String,
    description: 'Start date in ISO format (YYYY-MM-DD)'
  })
  @ApiQuery({ 
    name: 'endDate', 
    required: true, 
    type: String,
    description: 'End date in ISO format (YYYY-MM-DD)'
  })
  async getStats(
    @Param('schoolId') schoolId: string,
    @Query('startDate', ParseDatePipe) startDate: Date,
    @Query('endDate', ParseDatePipe) endDate: Date
  ): Promise<any> {
    return this.attendanceService.getAttendanceStats(schoolId, startDate, endDate);
  }
} 