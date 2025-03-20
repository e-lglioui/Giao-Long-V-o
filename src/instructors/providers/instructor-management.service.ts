import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../../auth/enums/role.enum';
import { User } from '../../users/schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class InstructorManagementService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('School') private readonly schoolModel: Model<any>,
    @InjectModel('SchoolInstructor') private readonly schoolInstructorModel: Model<any>,
  ) {}

  /**
   * Create an instructor and associate with a school
   */
  async createInstructor(schoolId: string, createInstructorDto: any, currentUser: any) {
    // Check if school exists
    const school = await this.schoolModel.findById(schoolId).exec();
    if (!school) {
      throw new NotFoundException(`School with ID ${schoolId} not found`);
    }

    // If current user is a school admin, verify they belong to this school
    if (currentUser.role === Role.SCHOOL_ADMIN) {
      const isSchoolAdmin = await this.isUserSchoolAdmin(currentUser.id, schoolId);
      if (!isSchoolAdmin) {
        throw new ForbiddenException('You are not authorized to add instructors to this school');
      }
    }

    // Check if user with email already exists
    const existingUser = await this.userModel.findOne({ email: createInstructorDto.email }).exec();
    
    let userId: string;

    if (existingUser) {
      // If user exists but is not an instructor yet
      if (existingUser.role !== Role.INSTRUCTOR) {
        existingUser.role = Role.INSTRUCTOR;
        await existingUser.save();
      }
      userId = existingUser._id.toString();
    } else {
      // Create new user with INSTRUCTOR role
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(createInstructorDto.password, salt);

      const newUser = new this.userModel({
        username: createInstructorDto.username,
        email: createInstructorDto.email,
        password: hashedPassword,
        firstName: createInstructorDto.firstName,
        lastName: createInstructorDto.lastName,
        role: Role.INSTRUCTOR,
        isConfirmed: true // Auto-confirm instructor accounts
      });

      const savedUser = await newUser.save();
      userId = savedUser._id.toString();
    }

    // Check if instructor is already associated with this school
    const existingInstructor = await this.schoolInstructorModel.findOne({
      user: userId,
      school: schoolId,
      isActive: true
    }).exec();

    if (existingInstructor) {
      throw new BadRequestException('This instructor is already associated with this school');
    }

    // Create school instructor relationship
    const schoolInstructor = new this.schoolInstructorModel({
      user: userId,
      school: schoolId,
      specialties: createInstructorDto.specialties || [],
      rank: createInstructorDto.rank || 'Regular Instructor',
      biography: createInstructorDto.biography || '',
      isActive: true,
      createdAt: new Date(),
      createdBy: currentUser.id
    });

    await schoolInstructor.save();

    // Return newly created instructor information
    return {
      message: 'Instructor added to school successfully',
      instructorId: userId,
      school: school.name,
      rank: schoolInstructor.rank
    };
  }

  /**
   * Get all instructors for a specific school
   */
  async getInstructorsBySchool(schoolId: string, currentUser: any) {
    // Check if school exists
    const school = await this.schoolModel.findById(schoolId).exec();
    if (!school) {
      throw new NotFoundException(`School with ID ${schoolId} not found`);
    }

    // If current user is a school admin, verify they belong to this school
    if (currentUser.role === Role.SCHOOL_ADMIN) {
      const isSchoolAdmin = await this.isUserSchoolAdmin(currentUser.id, schoolId);
      if (!isSchoolAdmin) {
        throw new ForbiddenException('You are not authorized to view instructors for this school');
      }
    }

    // Find all instructor relationships for this school
    const schoolInstructors = await this.schoolInstructorModel.find({
      school: schoolId,
      isActive: true
    })
    .populate('user', 'username email firstName lastName')
    .exec();

    return {
      school: school.name,
      instructorCount: schoolInstructors.length,
      instructors: schoolInstructors.map(instructor => ({
        id: instructor.user._id,
        name: `${instructor.user.firstName} ${instructor.user.lastName}`,
        email: instructor.user.email,
        username: instructor.user.username,
        rank: instructor.rank,
        specialties: instructor.specialties,
        biography: instructor.biography,
        joinedAt: instructor.createdAt
      }))
    };
  }

  /**
   * Get a specific instructor details
   */
  async getInstructorById(schoolId: string, instructorId: string, currentUser: any) {
    // Check if school exists
    const school = await this.schoolModel.findById(schoolId).exec();
    if (!school) {
      throw new NotFoundException(`School with ID ${schoolId} not found`);
    }

    // If current user is a school admin, verify they belong to this school
    if (currentUser.role === Role.SCHOOL_ADMIN) {
      const isSchoolAdmin = await this.isUserSchoolAdmin(currentUser.id, schoolId);
      if (!isSchoolAdmin) {
        throw new ForbiddenException('You are not authorized to view instructors for this school');
      }
    }

    // Find instructor relationship
    const instructorRelationship = await this.schoolInstructorModel.findOne({
      user: instructorId,
      school: schoolId,
      isActive: true
    })
    .populate('user', 'username email firstName lastName')
    .exec();

    if (!instructorRelationship) {
      throw new NotFoundException(`Instructor with ID ${instructorId} not found in this school`);
    }

    return {
      id: instructorRelationship.user._id,
      name: `${instructorRelationship.user.firstName} ${instructorRelationship.user.lastName}`,
      email: instructorRelationship.user.email,
      username: instructorRelationship.user.username,
      rank: instructorRelationship.rank,
      specialties: instructorRelationship.specialties,
      biography: instructorRelationship.biography,
      joinedAt: instructorRelationship.createdAt,
      school: school.name
    };
  }

  /**
   * Update instructor details
   */
  async updateInstructor(schoolId: string, instructorId: string, updateInstructorDto: any, currentUser: any) {
    // Check if school exists
    const school = await this.schoolModel.findById(schoolId).exec();
    if (!school) {
      throw new NotFoundException(`School with ID ${schoolId} not found`);
    }

    // If current user is a school admin, verify they belong to this school
    if (currentUser.role === Role.SCHOOL_ADMIN) {
      const isSchoolAdmin = await this.isUserSchoolAdmin(currentUser.id, schoolId);
      if (!isSchoolAdmin) {
        throw new ForbiddenException('You are not authorized to update instructors for this school');
      }
    }

    // Find instructor relationship
    const instructorRelationship = await this.schoolInstructorModel.findOne({
      user: instructorId,
      school: schoolId,
      isActive: true
    }).exec();

    if (!instructorRelationship) {
      throw new NotFoundException(`Instructor with ID ${instructorId} not found in this school`);
    }

    // Update instructor profile details if provided
    if (updateInstructorDto.rank) {
      instructorRelationship.rank = updateInstructorDto.rank;
    }

    if (updateInstructorDto.specialties) {
      instructorRelationship.specialties = updateInstructorDto.specialties;
    }

    if (updateInstructorDto.biography) {
      instructorRelationship.biography = updateInstructorDto.biography;
    }

    instructorRelationship.updatedAt = new Date();
    instructorRelationship.updatedBy = currentUser.id;

    await instructorRelationship.save();

    // Update user details if provided
    if (updateInstructorDto.firstName || updateInstructorDto.lastName || updateInstructorDto.email) {
      const user = await this.userModel.findById(instructorId).exec();
      
      if (updateInstructorDto.firstName) {
        user.firstName = updateInstructorDto.firstName;
      }
      
      if (updateInstructorDto.lastName) {
        user.lastName = updateInstructorDto.lastName;
      }
      
      if (updateInstructorDto.email && user.email !== updateInstructorDto.email) {
        // Check if email is already in use
        const existingUserWithEmail = await this.userModel.findOne({ 
          email: updateInstructorDto.email,
          _id: { $ne: instructorId }
        }).exec();
        
        if (existingUserWithEmail) {
          throw new BadRequestException('Email is already in use by another user');
        }
        
        user.email = updateInstructorDto.email;
      }

      await user.save();
    }

    return {
      message: 'Instructor updated successfully',
      instructorId: instructorId,
      school: school.name
    };
  }

  /**
   * Remove instructor from school
   */
  async removeInstructor(schoolId: string, instructorId: string, currentUser: any) {
    // Check if school exists
    const school = await this.schoolModel.findById(schoolId).exec();
    if (!school) {
      throw new NotFoundException(`School with ID ${schoolId} not found`);
    }

    // If current user is a school admin, verify they belong to this school
    if (currentUser.role === Role.SCHOOL_ADMIN) {
      const isSchoolAdmin = await this.isUserSchoolAdmin(currentUser.id, schoolId);
      if (!isSchoolAdmin) {
        throw new ForbiddenException('You are not authorized to remove instructors from this school');
      }
    }

    // Find instructor relationship
    const instructorRelationship = await this.schoolInstructorModel.findOne({
      user: instructorId,
      school: schoolId,
      isActive: true
    }).exec();

    if (!instructorRelationship) {
      throw new NotFoundException(`Instructor with ID ${instructorId} not found in this school`);
    }

    // Deactivate the relationship
    instructorRelationship.isActive = false;
    instructorRelationship.deactivatedAt = new Date();
    instructorRelationship.deactivatedBy = currentUser.id;
    await instructorRelationship.save();

    // Check if user is an instructor in any other active schools
    const otherInstructorRoles = await this.schoolInstructorModel.countDocuments({
      user: instructorId,
      school: { $ne: schoolId },
      isActive: true
    }).exec();

    // If no other instructor roles, downgrade to USER role
    if (otherInstructorRoles === 0) {
      const user = await this.userModel.findById(instructorId).exec();
      if (user && user.role === Role.INSTRUCTOR) {
        user.role = Role.USER;
        await user.save();
      }
    }

    return {
      message: 'Instructor removed from school successfully',
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