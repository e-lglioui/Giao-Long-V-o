import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { Role } from '../../auth/enums/role.enum';

@Injectable()
export class UserRoleManagementService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  /**
   * Get all users with their roles
   */
  async getAllUsersWithRoles() {
    return this.userModel.find({}, 'username email firstName lastName role -_id').exec();
  }

  /**
   * Get a specific user with their role
   */
  async getUserWithRole(userId: string) {
    const user = await this.userModel.findById(userId, 'username email firstName lastName role').exec();
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    return user;
  }

  /**
   * Update a user's role
   */
  async updateUserRole(userId: string, newRole: Role) {
    // Check if trying to modify a super admin
    const user = await this.userModel.findById(userId).exec();
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    // Special protection for SUPER_ADMIN role
    // Ensure there's always at least one SUPER_ADMIN in the system
    if (user.role === Role.SUPER_ADMIN && newRole !== Role.SUPER_ADMIN) {
      // Count how many super admins exist
      const superAdminCount = await this.userModel.countDocuments({ role: Role.SUPER_ADMIN }).exec();
      
      if (superAdminCount <= 1) {
        throw new ForbiddenException('Cannot remove the last Super Admin from the system');
      }
    }
    
    // Update the user's role
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true, select: 'username email firstName lastName role' }
    ).exec();
    
    return updatedUser;
  }
} 