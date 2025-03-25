import { Controller, Post, Body, UseGuards, Get, Param, Put, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { Role } from '../../auth/enums/role.enum';
import { Permission } from '../../auth/enums/permission.enum';
import { SchoolAdminService } from '../providers/school-admin.service';
import { User } from '../../auth/decorators/user.decorator';

@Controller('admin/schools')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchoolAdminController {
  constructor(
    private readonly schoolAdminService: SchoolAdminService,
  ) {}

  @Post(':schoolId/admins')
  @Roles(Role.SUPER_ADMIN)
  @RequirePermissions(Permission.USER_CREATE, Permission.SCHOOL_MANAGE_STAFF)
  async createSchoolAdmin(
    @Param('schoolId') schoolId: string,
    @Body() createSchoolAdminDto: any
  ) {
    return this.schoolAdminService.createSchoolAdmin(schoolId, createSchoolAdminDto);
  }

  @Get(':schoolId/admins')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @RequirePermissions(Permission.USER_READ)
  async getSchoolAdmins(
    @Param('schoolId') schoolId: string,
    @User() user: any
  ) {
    if (user.role === Role.SCHOOL_ADMIN) {
      return this.schoolAdminService.getAdminsBySchool(schoolId, user.id);
    }

    return this.schoolAdminService.getAdminsBySchool(schoolId);
  }

  @Delete(':schoolId/admins/:adminId')
  @Roles(Role.SUPER_ADMIN)
  @RequirePermissions(Permission.USER_DELETE, Permission.SCHOOL_MANAGE_STAFF)
  async removeSchoolAdmin(
    @Param('schoolId') schoolId: string,
    @Param('adminId') adminId: string
  ) {
    return this.schoolAdminService.removeSchoolAdmin(schoolId, adminId);
  }
} 