import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role } from '../../auth/enums/role.enum';
import { User } from '../../users/schemas/user.schema';
import { InstructorProfile } from '../schemas/instructor-profile.schema';
import { Certification } from '../schemas/instructor-profile.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class InstructorManagementService {
  private readonly logger = new Logger(InstructorManagementService.name);

  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('School') private readonly schoolModel: Model<any>,
    @InjectModel('SchoolInstructor') private readonly schoolInstructorModel: Model<any>,
    @InjectModel('InstructorProfile') private readonly instructorProfileModel: Model<InstructorProfile>,
  ) {}

async addInstructor(schoolId: string, instructor: any, currentUser: any): Promise<any> {
  try {
    // Get the school
    const school = await this.schoolModel.findById(schoolId).exec();
    if (!school) {
      throw new NotFoundException(`School with ID ${schoolId} not found`);
    }

    // Extract just the instructor ID if a full object was passed
    const instructorId = instructor._id ? 
      (typeof instructor._id === 'string' ? instructor._id : instructor._id.toString()) : 
      (instructor.id ? instructor.id : instructor);

    // Check if instructor exists
    const instructorExists = await this.userModel.findById(instructorId).exec();
    if (!instructorExists) {
      console.log("test 1")
      throw new NotFoundException(`Instructor with ID ${instructorId} not found`);
    }

    // Check if instructor is already in the school
    if (school.instructors.includes(instructorId)) {
      throw new BadRequestException(`Instructor is already associated with this school`);
    }

    // Add instructor to school
    school.instructors.push(instructorId);
    await school.save();

    // Update instructor profile to include this school
    const instructorProfile = await this.instructorProfileModel.findOne({ userId: instructorId }).exec();
    if (instructorProfile) {
      // Store school ID as string
      if (!instructorProfile.schools.includes(schoolId)) {
        instructorProfile.schools.push(schoolId);
        await instructorProfile.save();
      }
    }

    this.logger.log(`Added instructor ${instructorId} to school ${schoolId}`);
    return { 
      message: 'Instructor added to school successfully',
      school: school.name,
      instructorId: instructorId
    };
  } catch (error) {
    this.logger.error(`Failed to add instructor ${JSON.stringify(instructor)} to school ${schoolId}: ${error.message}`, error.stack);
    throw error;
  }
}
  /**
   * Get all instructors for a specific school
   */
  async getInstructorsBySchool(schoolId: string, user?: any) {
    // First, verify the school exists and has instructors
    const school = await this.schoolModel.findById(schoolId).exec();
    if (!school) {
      throw new NotFoundException(`School with ID ${schoolId} not found`);
    }
    
    this.logger.debug(`School instructors array: ${JSON.stringify(school.instructors)}`);
    
    if (!school.instructors || school.instructors.length === 0) {
      return {
        school: school.name,
        instructorCount: 0,
        instructors: []
      };
    }
    
    // Convert string IDs to ObjectIds if needed
    const instructorIds = school.instructors.map(id => 
      typeof id === 'string' ? new Types.ObjectId(id) : id
    );
    
    // Find all instructors that match the IDs in the school
    const instructors = await this.userModel.find({
      _id: { $in: instructorIds }
    }).exec();
    
    this.logger.debug(`Found ${instructors.length} instructors for school ${schoolId}`);
    
    return {
      school: school.name,
      instructorCount: instructors.length,
      instructors: instructors
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
  
    // Check if instructor is in the school's instructors array
    if (!school.instructors.some(id => id.toString() === instructorId)) {
      throw new NotFoundException(`Instructor with ID ${instructorId} not found in this school`);
    }
  
    // Get the instructor user
    const instructor = await this.userModel.findById(instructorId)
      .select('username email firstName lastName')
      .exec();
  
    if (!instructor) {
      throw new NotFoundException(`Instructor with ID ${instructorId} not found`);
    }
  
    // Get instructor profile if it exists
    const instructorProfile = await this.instructorProfileModel.findOne({ userId: instructorId }).exec();
  
    return {
      id: instructor._id,
      name: `${instructor.firstName} ${instructor.lastName}`,
      email: instructor.email,
      username: instructor.username,
      // Include profile data if available
      ...(instructorProfile && {
        specialties: instructorProfile.specialties || [],
        biography: instructorProfile.bio || '',
      }),
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

    // Update instructor profile to remove school
    const instructorProfile = await this.instructorProfileModel.findOne({ userId: instructorId }).exec();
    if (instructorProfile && instructorProfile.schools) {
      const schoolObjectId = new Types.ObjectId(schoolId);
      // Use string comparison instead of equals method
      instructorProfile.schools = instructorProfile.schools.filter(
        school => school.toString() !== schoolId
      );
      await instructorProfile.save();
    }

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
   * Add profile image for instructor
   */
  async addProfileImage(schoolId: string, instructorId: string, imageUrl: string, currentUser: any) {
    // Verify permissions
    await this.verifySchoolInstructorAccess(schoolId, instructorId, currentUser);
    
    // Get instructor profile
    const instructorProfile = await this.getOrCreateInstructorProfile(instructorId);
    
    // Add image to profile
    instructorProfile.profileImages = instructorProfile.profileImages || [];
    instructorProfile.profileImages.push(imageUrl);
    
    await instructorProfile.save();
    
    return {
      message: 'Profile image added successfully',
      instructorId,
      imageUrl
    };
  }
  
  /**
   * Add certification for instructor
   */
  async addCertification(schoolId: string, instructorId: string, certification: Certification, currentUser: any) {
    // Verify permissions
    await this.verifySchoolInstructorAccess(schoolId, instructorId, currentUser);
    
    // Get instructor profile
    const instructorProfile = await this.getOrCreateInstructorProfile(instructorId);
    
    // Add certification to profile
    instructorProfile.certifications = instructorProfile.certifications || [];
    instructorProfile.certifications.push(certification);
    
    await instructorProfile.save();
    
    return {
      message: 'Certification added successfully',
      instructorId,
      certification: certification.name
    };
  }
  
  /**
   * Update sports passport for instructor
   */
  async updateSportsPassport(schoolId: string, instructorId: string, fileUrl: string, currentUser: any) {
    // Verify permissions
    await this.verifySchoolInstructorAccess(schoolId, instructorId, currentUser);
    
    // Get instructor profile
    const instructorProfile = await this.getOrCreateInstructorProfile(instructorId);
    
    // Update sports passport
    instructorProfile.sportsPassport = fileUrl;
    
    await instructorProfile.save();
    
    return {
      message: 'Sports passport updated successfully',
      instructorId,
      fileUrl
    };
  }
  
  /**
   * Get full profile for instructor
   */
  async getFullProfile(schoolId: string, instructorId: string, currentUser: any) {
    // Verify permissions
    await this.verifySchoolInstructorAccess(schoolId, instructorId, currentUser);
    
    // Get instructor relationship
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
    
    // Get instructor profile
    const instructorProfile = await this.instructorProfileModel.findOne({ userId: instructorId })
      .exec();
    
    // Get school details
    const school = await this.schoolModel.findById(schoolId)
      .select('name location contactInfo')
      .exec();
    
    return {
      basicInfo: {
        id: instructorRelationship.user._id,
        name: `${instructorRelationship.user.firstName} ${instructorRelationship.user.lastName}`,
        email: instructorRelationship.user.email,
        username: instructorRelationship.user.username,
      },
      schoolInfo: {
        school: school.name,
        rank: instructorRelationship.rank,
        specialties: instructorRelationship.specialties,
        biography: instructorRelationship.biography,
        joinedAt: instructorRelationship.createdAt,
      },
      profileInfo: instructorProfile ? {
        bio: instructorProfile.bio,
        phone: instructorProfile.phone,
        address: instructorProfile.address,
        yearsOfExperience: instructorProfile.yearsOfExperience,
        certifications: instructorProfile.certifications || [],
        profileImages: instructorProfile.profileImages || [],
        sportsPassport: instructorProfile.sportsPassport,
      } : null
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
  
  /**
   * Helper method to verify access to school instructor
   */
  private async verifySchoolInstructorAccess(schoolId: string, instructorId: string, currentUser: any) {
    // Check if school exists
    const school = await this.schoolModel.findById(schoolId).exec();
    if (!school) {
      throw new NotFoundException(`School with ID ${schoolId} not found`);
    }

    // If current user is a school admin, verify they belong to this school
    if (currentUser.role === Role.SCHOOL_ADMIN) {
      const isSchoolAdmin = await this.isUserSchoolAdmin(currentUser.id, schoolId);
      if (!isSchoolAdmin) {
        throw new ForbiddenException('You are not authorized to access instructors for this school');
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
  }
  
  /**
   * Helper method to get or create instructor profile
   */
  private async getOrCreateInstructorProfile(instructorId: string): Promise<InstructorProfile> {
    let instructorProfile = await this.instructorProfileModel.findOne({ userId: instructorId }).exec();
    
    if (!instructorProfile) {
      instructorProfile = new this.instructorProfileModel({
        userId: instructorId,
        bio: '',
        phone: '',
        address: '',
        specialties: [],
        certifications: [],
        yearsOfExperience: 0,
        profileImages: [],
        schools: []
      });
    }
    
    return instructorProfile;
  }
}