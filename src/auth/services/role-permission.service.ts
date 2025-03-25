import { Injectable } from '@nestjs/common';
import { Role } from '../enums/role.enum';
import { Permission } from '../enums/permission.enum';
import { ROLE_PERMISSIONS } from '../constants/role-permissions';

@Injectable()
export class RolePermissionService {
  /**
   * Get all permissions for a specific role
   */
  getPermissionsForRole(role: Role): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Check if a role has a specific permission
   */
  hasPermission(role: Role, permission: Permission): boolean {
    const permissions = this.getPermissionsForRole(role);
    return permissions.includes(permission);
  }

  /**
   * Check if a role has all of the specified permissions
   */
  hasAllPermissions(role: Role, permissions: Permission[]): boolean {
    const rolePermissions = this.getPermissionsForRole(role);
    return permissions.every(permission => rolePermissions.includes(permission));
  }

  /**
   * Check if a role has any of the specified permissions
   */
  hasAnyPermission(role: Role, permissions: Permission[]): boolean {
    const rolePermissions = this.getPermissionsForRole(role);
    return permissions.some(permission => rolePermissions.includes(permission));
  }

  /**
   * Get all available roles
   */
  getAllRoles(): Role[] {
    return Object.values(Role);
  }

  /**
   * Get all available permissions
   */
  getAllPermissions(): Permission[] {
    return Object.values(Permission);
  }
} 