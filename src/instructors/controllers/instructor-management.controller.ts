import { Controller, Post, Body, UseGuards, Get, Param, Put, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { Role } from '../../auth/enums/role.enum';
import { Permission } from '../../auth/enums/permission.enum';
import { InstructorManagementService } from '../providers/instructor-management.service';
import { User } from '../../auth/decorators/user.decorator';

@Controller('schools/:schoolId/instructors')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
export class InstructorManagementController {
  constructor(
    private readonly instructorManagementService: InstructorManagementService,
  ) {}

  // Add a new instructor
  @Post()
  @RequirePermissions(Permission.INSTRUCTOR_CREATE)
  async addInstructor(
    @Param('schoolId') schoolId: string,
    @Body() createInstructorDto: any,
    @User() user: any
  ) {
    return this.instructorManagementService.createInstructor(schoolId, createInstructorDto, user);
  }

  // Get all instructors for a school
  @Get()
  @RequirePermissions(Permission.INSTRUCTOR_READ)
  async getInstructors(
    @Param('schoolId') schoolId: string,
    @User() user: any
  ) {
    return this.instructorManagementService.getInstructorsBySchool(schoolId, user);
  }
  
  // Get instructor details
  @Get(':instructorId')
  @RequirePermissions(Permission.INSTRUCTOR_READ)
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
  async removeInstructor(
    @Param('schoolId') schoolId: string,
    @Param('instructorId') instructorId: string,
    @User() user: any
  ) {
    return this.instructorManagementService.removeInstructor(schoolId, instructorId, user);
  }
} 