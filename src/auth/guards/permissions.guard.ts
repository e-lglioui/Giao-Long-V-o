import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '../enums/permission.enum';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { ROLE_PERMISSIONS } from '../constants/role-permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No specific permissions required
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.role) {
      throw new ForbiddenException('User does not have a role assigned');
    }

    // Get permissions for the user's role
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    
    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every(
      permission => userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('You do not have sufficient permissions to perform this action');
    }

    return true;
  }
} 