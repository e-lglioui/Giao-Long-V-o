import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../../auth/enums/role.enum';
import { User } from '../../users/schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SchoolAdminService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('School') private readonly schoolModel: Model<any>,
    @InjectModel('SchoolAdmin') private readonly schoolAdminModel: Model<any>,
  ) {}

  /**
   * Create a school admin user and associate with a school
   */
  async createSchoolAdmin(schoolId: string, createSchoolAdminDto: any) {
    // Check if school exists
    const school = await this.schoolModel.findById(schoolId).exec();
    if (!school) {
      throw new NotFoundException(`School with ID ${schoolId} not found`);
    }

    // Check if user with email already exists
    const existingUser = await this.userModel.findOne({ email: createSchoolAdminDto.email }).exec();
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createSchoolAdminDto.password, salt);

    // Create new user with SCHOOL_ADMIN role
    const newUser = new this.userModel({
      username: createSchoolAdminDto.username,
      email: createSchoolAdminDto.email,
      password: hashedPassword,
      firstName: createSchoolAdminDto.firstName,
      lastName: createSchoolAdminDto.lastName,
      role: Role.SCHOOL_ADMIN,
      isConfirmed: true // Auto-confirm school admin accounts
    });

    // Save user
    const savedUser = await newUser.save();

    // Create school admin relationship
    const schoolAdmin = new this.schoolAdminModel({
      user: savedUser._id,
      school: schoolId,
      isActive: true,
      createdAt: new Date()
    });

    await schoolAdmin.save();

    // Return user without sensitive information
    const { password, ...result } = savedUser.toObject();
    return {
      message: 'School admin created successfully',
      user: result,
      school: school.name
    };
  }

  /**
   * Get all admin users for a specific school
   */
  async getAdminsBySchool(schoolId: string, requestingUserId?: string) {
    // Check if school exists
    const school = await this.schoolModel.findById(schoolId).exec();
    if (!school) {
      throw new NotFoundException(`School with ID ${schoolId} not found`);
    }

    // If requesting user is a school admin, verify they belong to this school
    if (requestingUserId) {
      const isAdmin = await this.schoolAdminModel.exists({
        user: requestingUserId,
        school: schoolId,
        isActive: true
      });

      if (!isAdmin) {
        throw new ForbiddenException('You are not authorized to view admins for this school');
      }
    }

    // Find all school admin relationships for this school
    const schoolAdmins = await this.schoolAdminModel.find({
      school: schoolId,
      isActive: true
    }).populate('user', 'username email firstName lastName -_id').exec();

    return {
      school: school.name,
      admins: schoolAdmins.map(admin => admin.user)
    };
  }

  /**
   * Remove a school admin (doesn't delete the user, just removes admin role)
   */
  async removeSchoolAdmin(schoolId: string, adminId: string) {
    // Check if school exists
    const school = await this.schoolModel.findById(schoolId).exec();
    if (!school) {
      throw new NotFoundException(`School with ID ${schoolId} not found`);
    }

    // Find the school admin relationship
    const schoolAdmin = await this.schoolAdminModel.findOne({
      user: adminId,
      school: schoolId
    }).exec();

    if (!schoolAdmin) {
      throw new NotFoundException(`Admin relationship not found`);
    }

    // Deactivate the relationship
    schoolAdmin.isActive = false;
    await schoolAdmin.save();

    // Find the user and change role back to USER if they're not admin for other schools
    const user = await this.userModel.findById(adminId).exec();
    
    // Check if user is admin for any other active schools
    const otherAdminRoles = await this.schoolAdminModel.countDocuments({
      user: adminId,
      school: { $ne: schoolId },
      isActive: true
    }).exec();

    // If no other admin roles, downgrade to USER role
    if (otherAdminRoles === 0 && user) {
      user.role = Role.USER;
      await user.save();
    }

    return {
      message: 'School admin removed successfully',
      schoolName: school.name
    };
  }
} 