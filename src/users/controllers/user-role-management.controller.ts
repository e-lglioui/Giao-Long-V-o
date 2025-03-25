import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { Role } from '../../auth/enums/role.enum';
import { Permission } from '../../auth/enums/permission.enum';
import { RolePermissionService } from '../../auth/services/role-permission.service';
import { UserRoleManagementService } from '../providers/user-role-management.service';
import { UpdateUserRoleDto } from '../dtos/update-user-role.dto';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class UserRoleManagementController {
  constructor(
    private readonly rolePermissionService: RolePermissionService,
    private readonly userRoleManagementService: UserRoleManagementService,
  ) {}

  // Get all users with their roles
  @Get()
  @RequirePermissions(Permission.USER_READ)
  async getAllUsers() {
    return this.userRoleManagementService.getAllUsersWithRoles();
  }

  // Get a specific user with their role
  @Get(':userId')
  @RequirePermissions(Permission.USER_READ)
  async getUserById(@Param('userId') userId: string) {
    return this.userRoleManagementService.getUserWithRole(userId);
  }

  // Update a user's role
  @Put(':userId/role')
  // @RequirePermissions(Permission.USER_UPDATE)
  async updateUserRole(
    @Param('userId') userId: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.userRoleManagementService.updateUserRole(userId, updateUserRoleDto.role);
  }

  // Get all available roles
  @Get('roles/all')
  async getAllRoles() {
    return this.rolePermissionService.getAllRoles();
  }

  // Get all permissions for a specific role
  @Get('roles/:role/permissions')
  async getRolePermissions(@Param('role') role: Role) {
    return {
      role,
      permissions: this.rolePermissionService.getPermissionsForRole(role),
    };
  }

  // Get all available permissions in the system
  @Get('permissions/all')
  async getAllPermissions() {
    return this.rolePermissionService.getAllPermissions();
  }
} 