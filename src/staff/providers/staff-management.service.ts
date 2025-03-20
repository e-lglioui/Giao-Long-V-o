import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../../auth/enums/role.enum';
import { User } from '../../users/schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffManagementService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('School') private readonly schoolModel: Model<any>,
    @InjectModel('SchoolStaff') private readonly schoolStaffModel: Model<any>,
  ) {}

  /**
   * Create a staff member and associate with a school
   */
  async createStaffMember(schoolId: string, createStaffDto: any, currentUser: any) {
    // Check if school exists
    const school = await this.schoolModel.findById(schoolId).exec();
    if (!school) {
      throw new NotFoundException(`School with ID ${schoolId} not found`);
    }

    // If current user is a school admin, verify they belong to this school
    if (currentUser.role === Role.SCHOOL_ADMIN) {
      const isSchoolAdmin = await this.isUserSchoolAdmin(currentUser.id, schoolId);
      if (!isSchoolAdmin) {
        throw new ForbiddenException('You are not authorized to add staff to this school');
      }
    }

    // Check if user with email already exists
    const existingUser = await this.userModel.findOne({ email: createStaffDto.email }).exec();
    
    let userId: string;

    if (existingUser) {
      // If user exists but is not a staff member yet
      if (existingUser.role !== Role.STAFF) {
        existingUser.role = Role.STAFF;
        await existingUser.save();
      }
      userId = existingUser._id.toString();
    } else {
      // Create new user with STAFF role
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(createStaffDto.password, salt);

      const newUser = new this.userModel({
        username: createStaffDto.username,
        email: createStaffDto.email,
        password: hashedPassword,
        firstName: createStaffDto.firstName,
        lastName: createStaffDto.lastName,
        role: Role.STAFF,
        isConfirmed: true // Auto-confirm staff accounts
      });

      const savedUser = await newUser.save();
      userId = savedUser._id.toString();
    }

    // Check if staff member is already associated with this school
    const existingStaff = await this.schoolStaffModel.findOne({
      user: userId,
      school: schoolId,
      isActive: true
    }).exec();

    if (existingStaff) {
      throw new BadRequestException('This staff member is already associated with this school');
    }

    // Create school staff relationship
    const schoolStaff = new this.schoolStaffModel({
      user: userId,
      school: schoolId,
      position: createStaffDto.position || 'General Staff',
      department: createStaffDto.department || 'General',
      isActive: true,
      createdAt: new Date(),
      createdBy: currentUser.id
    });

    await schoolStaff.save();

    // Return newly created staff information
    return {
      message: 'Staff member added to school successfully',
      staffId: userId,
      school: school.name,
      position: schoolStaff.position
    };
  }

  /**
   * Get all staff members for a specific school
   */
  async getStaffBySchool(schoolId: string, currentUser: any) {
    // Check if school exists
    const school = await this.schoolModel.findById(schoolId).exec();
    if (!school) {
      throw new NotFoundException(`School with ID ${schoolId} not found`);
    }

    // If current user is a school admin, verify they belong to this school
    if (currentUser.role === Role.SCHOOL_ADMIN) {
      const isSchoolAdmin = await this.isUserSchoolAdmin(currentUser.id, schoolId);
      if (!isSchoolAdmin) {
        throw new ForbiddenException('You are not authorized to view staff for this school');
      }
    }

    // Find all staff relationships for this school
    const schoolStaff = await this.schoolStaffModel.find({
      school: schoolId,
      isActive: true
    })
    .populate('user', 'username email firstName lastName')
    .exec();

    return {
      school: school.name,
      staffCount: schoolStaff.length,
      staff: schoolStaff.map(staff => ({
        id: staff.user._id,
        name: `${staff.user.firstName} ${staff.user.lastName}`,
        email: staff.user.email,
        username: staff.user.username,
        position: staff.position,
        department: staff.department,
        joinedAt: staff.createdAt
      }))
    };
  }

  /**
   * Get a specific staff member details
   */
  async getStaffMemberById(schoolId: string, staffId: string, currentUser: any) {
    // Check if school exists
    const school = await this.schoolModel.findById(schoolId).exec();
    if (!school) {
      throw new NotFoundException(`School with ID ${schoolId} not found`);
    }

    // If current user is a school admin, verify they belong to this school
    if (currentUser.role === Role.SCHOOL_ADMIN) {
      const isSchoolAdmin = await this.isUserSchoolAdmin(currentUser.id, schoolId);
      if (!isSchoolAdmin) {
        throw new ForbiddenException('You are not authorized to view staff for this school');
      }
    }

    // Find staff relationship
    const staffRelationship = await this.schoolStaffModel.findOne({
      user: staffId,
      school: schoolId,
      isActive: true
    })
    .populate('user', 'username email firstName lastName')
    .exec();

    if (!staffRelationship) {
      throw new NotFoundException(`Staff member with ID ${staffId} not found in this school`);
    }

    return {
      id: staffRelationship.user._id,
      name: `${staffRelationship.user.firstName} ${staffRelationship.user.lastName}`,
      email: staffRelationship.user.email,
      username: staffRelationship.user.username,
      position: staffRelationship.position,
      department: staffRelationship.department,
      joinedAt: staffRelationship.createdAt,
      school: school.name
    };
  }

  /**
   * Update staff member details
   */
  async updateStaffMember(schoolId: string, staffId: string, updateStaffDto: any, currentUser: any) {
    // Check if school exists
    const school = await this.schoolModel.findById(schoolId).exec();
    if (!school) {
      throw new NotFoundException(`School with ID ${schoolId} not found`);
    }

    // If current user is a school admin, verify they belong to this school
    if (currentUser.role === Role.SCHOOL_ADMIN) {
      const isSchoolAdmin = await this.isUserSchoolAdmin(currentUser.id, schoolId);
      if (!isSchoolAdmin) {
        throw new ForbiddenException('You are not authorized to update staff for this school');
      }
    }

    // Find staff relationship
    const staffRelationship = await this.schoolStaffModel.findOne({
      user: staffId,
      school: schoolId,
      isActive: true
    }).exec();

    if (!staffRelationship) {
      throw new NotFoundException(`Staff member with ID ${staffId} not found in this school`);
    }

    // Update staff position and department if provided
    if (updateStaffDto.position) {
      staffRelationship.position = updateStaffDto.position;
    }

    if (updateStaffDto.department) {
      staffRelationship.department = updateStaffDto.department;
    }

    staffRelationship.updatedAt = new Date();
    staffRelationship.updatedBy = currentUser.id;

    await staffRelationship.save();

    // Update user details if provided
    if (updateStaffDto.firstName || updateStaffDto.lastName || updateStaffDto.email) {
      const user = await this.userModel.findById(staffId).exec();
      
      if (updateStaffDto.firstName) {
        user.firstName = updateStaffDto.firstName;
      }
      
      if (updateStaffDto.lastName) {
        user.lastName = updateStaffDto.lastName;
      }
      
      if (updateStaffDto.email && user.email !== updateStaffDto.email) {
        // Check if email is already in use
        const existingUserWithEmail = await this.userModel.findOne({ 
          email: updateStaffDto.email,
          _id: { $ne: staffId }
        }).exec();
        
        if (existingUserWithEmail) {
          throw new BadRequestException('Email is already in use by another user');
        }
        
        user.email = updateStaffDto.email;
      }

      await user.save();
    }

    return {
      message: 'Staff member updated successfully',
      staffId: staffId,
      school: school.name
    };
  }

  /**
   * Remove staff member from school
   */
  async removeStaffMember(schoolId: string, staffId: string, currentUser: any) {
    // Check if school exists
    const school = await this.schoolModel.findById(schoolId).exec();
    if (!school) {
      throw new NotFoundException(`School with ID ${schoolId} not found`);
    }

    // If current user is a school admin, verify they belong to this school
    if (currentUser.role === Role.SCHOOL_ADMIN) {
      const isSchoolAdmin = await this.isUserSchoolAdmin(currentUser.id, schoolId);
      if (!isSchoolAdmin) {
        throw new ForbiddenException('You are not authorized to remove staff from this school');
      }
    }

    // Find staff relationship
    const staffRelationship = await this.schoolStaffModel.findOne({
      user: staffId,
      school: schoolId,
      isActive: true
    }).exec();

    if (!staffRelationship) {
      throw new NotFoundException(`Staff member with ID ${staffId} not found in this school`);
    }

    // Deactivate the relationship
    staffRelationship.isActive = false;
    staffRelationship.deactivatedAt = new Date();
    staffRelationship.deactivatedBy = currentUser.id;
    await staffRelationship.save();

    // Check if user is staff in any other active schools
    const otherStaffRoles = await this.schoolStaffModel.countDocuments({
      user: staffId,
      school: { $ne: schoolId },
      isActive: true
    }).exec();

    // If no other staff roles, downgrade to USER role
    if (otherStaffRoles === 0) {
      const user = await this.userModel.findById(staffId).exec();
      if (user && user.role === Role.STAFF) {
        user.role = Role.USER;
        await user.save();
      }
    }

    return {
      message: 'Staff member removed from school successfully',
      school: school.name
    };
  }

  /**
   * Helper method to check if a user is an admin for a specific school
   */
  private async isUserSchoolAdmin(userId: string, schoolId: string): Promise<boolean> {
    const adminRelationship = await this.schoolModel.findOne({
      _id: schoolId,
      $or: [
        { admins: userId },
        { owner: userId }
      ]
    }).exec();

    return !!adminRelationship;
  }
} 