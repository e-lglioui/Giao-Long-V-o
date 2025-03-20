import { Controller, Post, Body, UseGuards, Get, Param, Put, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { Role } from '../../auth/enums/role.enum';
import { Permission } from '../../auth/enums/permission.enum';
import { StaffManagementService } from '../providers/staff-management.service';
import { User } from '../../auth/decorators/user.decorator';
import { CreateStaffDto } from '../dto/create-staff.dto';
import { UpdateStaffDto } from '../dto/update-staff.dto';

@Controller('schools/:schoolId/staff')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
export class StaffManagementController {
  constructor(
    private readonly staffManagementService: StaffManagementService,
  ) {}

  // Add a new staff member
  @Post()
  @RequirePermissions(Permission.SCHOOL_MANAGE_STAFF)
  async addStaffMember(
    @Param('schoolId') schoolId: string,
    @Body() createStaffDto: CreateStaffDto,
    @User() user: any
  ) {
    return this.staffManagementService.createStaffMember(schoolId, createStaffDto, user);
  }

  // Get all staff for a school
  @Get()
  @RequirePermissions(Permission.USER_READ)
  async getStaffMembers(
    @Param('schoolId') schoolId: string,
    @User() user: any
  ) {
    return this.staffManagementService.getStaffBySchool(schoolId, user);
  }
  
  // Get staff member details
  @Get(':staffId')
  @RequirePermissions(Permission.USER_READ)
  async getStaffMemberById(
    @Param('schoolId') schoolId: string,
    @Param('staffId') staffId: string,
    @User() user: any
  ) {
    return this.staffManagementService.getStaffMemberById(schoolId, staffId, user);
  }

  // Update staff member details
  @Put(':staffId')
  @RequirePermissions(Permission.USER_UPDATE, Permission.SCHOOL_MANAGE_STAFF)
  async updateStaffMember(
    @Param('schoolId') schoolId: string,
    @Param('staffId') staffId: string,
    @Body() updateStaffDto: UpdateStaffDto,
    @User() user: any
  ) {
    return this.staffManagementService.updateStaffMember(
      schoolId, 
      staffId, 
      updateStaffDto, 
      user
    );
  }

  // Remove staff member from school
  @Delete(':staffId')
  @RequirePermissions(Permission.USER_DELETE, Permission.SCHOOL_MANAGE_STAFF)
  async removeStaffMember(
    @Param('schoolId') schoolId: string,
    @Param('staffId') staffId: string,
    @User() user: any
  ) {
    return this.staffManagementService.removeStaffMember(schoolId, staffId, user);
  }
} 