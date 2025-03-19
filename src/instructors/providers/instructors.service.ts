import { Injectable, Logger, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import type { Model } from "mongoose"
import * as bcrypt from "bcrypt"
import  { CreateInstructorDto } from "../dto/create-instructor.dto"
import  { UpdateInstructorDto } from "../dto/update-instructor.dto"
import { InstructorProfile } from "../schemas/instructor-profile.schema"
import { User } from "../../users/schemas/user.schema"
import { Role } from "../../auth/enums/role.enum"
import { InstructorEmailService } from "./instructor-email.service"
import { School } from "../../schools/schemas/school.schema"
import { Certification } from "../schemas/instructor-profile.schema"
@Injectable()
export class InstructorsService {
  private readonly logger = new Logger(InstructorsService.name);

  constructor(
    @InjectModel(InstructorProfile.name) private instructorProfileModel: Model<InstructorProfile>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly emailService: InstructorEmailService,
    @InjectModel(School.name) private schoolModel: Model<School>,
  ) {}

  async create(createInstructorDto: CreateInstructorDto) {
    this.logger.log(`Creating instructor with email: ${createInstructorDto.email}`)

    // Check if user with this email already exists
    let user = await this.userModel.findOne({ email: createInstructorDto.email })

    if (user && user.roles.includes(Role.INSTRUCTOR)) {
      throw new BadRequestException(`User with email ${createInstructorDto.email} is already an instructor`)
    }

    // Generate a random password
    const password = Math.random().toString(36).slice(-8)

    if (!user) {
      // Create a new user with instructor role
      user = new this.userModel({
        username: createInstructorDto.email.split("@")[0],
        email: createInstructorDto.email,
        password: await bcrypt.hash(password, 10),
        firstName: createInstructorDto.firstName,
        lastName: createInstructorDto.lastName,
        roles: [Role.INSTRUCTOR],
        isConfirmed: true, // Auto-confirm instructor accounts
      })

      await user.save()
      this.logger.log(`Created new instructor user with ID: ${user._id}`)
    } else {
      // Update existing user to add instructor role
      user.roles.push(Role.INSTRUCTOR)
      await user.save()
      this.logger.log(`Added instructor role to existing user ${user._id}`)
    }

    // Create instructor profile
    const instructorProfile = new this.instructorProfileModel({
      userId: user._id,
      bio: createInstructorDto.bio,
      phone: createInstructorDto.phone,
      address: createInstructorDto.address,
      certifications: createInstructorDto.certifications || [],
      specialties: createInstructorDto.specialties || [],
      yearsOfExperience: createInstructorDto.yearsOfExperience,
    })

    await instructorProfile.save()
    this.logger.log(`Created instructor profile for user ${user._id}`)

    // Send email with credentials if new user
    if (!user.roles.includes(Role.INSTRUCTOR)) {
      await this.emailService.sendInstructorCredentials(
        user.email,
        password,
        user.firstName,
        user.lastName,
        "Kung Fu School", // You might want to pass the school name as a parameter
      )
    }

    return this.findOne(user._id.toString())
  }

  async findAll() {
    this.logger.log("Finding all instructors")

    const instructorProfiles = await this.instructorProfileModel
      .find()
      .populate("userId", "firstName lastName email username")
      .exec()

    return instructorProfiles
  }

  async findOne(id: string) {
    this.logger.log(`Finding instructor with id: ${id}`)

    // Try to find by profile ID first
    let instructorProfile = await this.instructorProfileModel
      .findById(id)
      .populate("userId", "firstName lastName email username")
      .exec()

    // If not found, try to find by user ID
    if (!instructorProfile) {
      instructorProfile = await this.instructorProfileModel
        .findOne({ userId: id })
        .populate("userId", "firstName lastName email username")
        .exec()
    }

    if (!instructorProfile) {
      throw new NotFoundException(`Instructor with ID ${id} not found`)
    }

    return instructorProfile
  }

  async update(id: string, updateInstructorDto: UpdateInstructorDto) {
    this.logger.log(`Updating instructor with id: ${id}`)

    // Find the instructor profile
    const instructorProfile = await this.instructorProfileModel.findById(id).exec()

    if (!instructorProfile) {
      throw new NotFoundException(`Instructor profile with ID ${id} not found`)
    }

    // Update the instructor profile
    if (updateInstructorDto.bio) instructorProfile.bio = updateInstructorDto.bio
    if (updateInstructorDto.phone) instructorProfile.phone = updateInstructorDto.phone
    if (updateInstructorDto.address) instructorProfile.address = updateInstructorDto.address
    if (updateInstructorDto.specialties) instructorProfile.specialties = updateInstructorDto.specialties
    if (updateInstructorDto.certifications) instructorProfile.certifications = updateInstructorDto.certifications
    if (updateInstructorDto.yearsOfExperience)
      instructorProfile.yearsOfExperience = updateInstructorDto.yearsOfExperience

    await instructorProfile.save()

    // Update user information if provided
    if (updateInstructorDto.firstName || updateInstructorDto.lastName || updateInstructorDto.email) {
      const user = await this.userModel.findById(instructorProfile.userId).exec()

      if (!user) {
        throw new NotFoundException(`User with ID ${instructorProfile.userId} not found`)
      }

      if (updateInstructorDto.firstName) user.firstName = updateInstructorDto.firstName
      if (updateInstructorDto.lastName) user.lastName = updateInstructorDto.lastName
      if (updateInstructorDto.email) user.email = updateInstructorDto.email

      await user.save()
    }

    return this.findOne(id)
  }

  async remove(id: string) {
    this.logger.log(`Removing instructor with id: ${id}`)

    // Find the instructor profile
    const instructorProfile = await this.instructorProfileModel.findById(id).exec()

    if (!instructorProfile) {
      throw new NotFoundException(`Instructor profile with ID ${id} not found`)
    }

    // Remove instructor role from user
    const user = await this.userModel.findById(instructorProfile.userId).exec()

    if (user) {
      user.roles = user.roles.filter((role) => role !== Role.INSTRUCTOR)
      await user.save()
      this.logger.log(`Removed instructor role from user ${user._id}`)
    }

    // Delete the instructor profile
    await this.instructorProfileModel.findByIdAndDelete(id).exec()
    this.logger.log(`Deleted instructor profile ${id}`)

    return { message: "Instructor successfully removed" }
  }

  async addProfileImage(id: string, imageUrl: string): Promise<InstructorProfile> {
    const instructorProfile = await this.instructorProfileModel.findById(id).exec();
    
    if (!instructorProfile) {
      throw new NotFoundException(`Instructor profile with ID ${id} not found`);
    }
    
    instructorProfile.profileImages = instructorProfile.profileImages || [];
    instructorProfile.profileImages.push(imageUrl);
    
    await instructorProfile.save();
    return this.findOne(id);
  }
  
  async addCertification(id: string, certification: Certification): Promise<InstructorProfile> {
    const instructorProfile = await this.instructorProfileModel.findById(id).exec();
    
    if (!instructorProfile) {
      throw new NotFoundException(`Instructor profile with ID ${id} not found`);
    }
    
    instructorProfile.certifications = instructorProfile.certifications || [];
    instructorProfile.certifications.push(certification);
    
    await instructorProfile.save();
    return this.findOne(id);
  }
  
  async updateSportsPassport(id: string, fileUrl: string): Promise<InstructorProfile> {
    const updated = await this.instructorProfileModel.findByIdAndUpdate(
      id,
      { $set: { sportsPassport: fileUrl } },
      { new: true }
    ).exec();
    
    if (!updated) {
      throw new NotFoundException(`Instructor profile with ID ${id} not found`);
    }
    
    return updated;
  }
  
  async getFullProfile(id: string): Promise<any> {
    // Trouver le profil instructeur
    const profile = await this.instructorProfileModel
      .findById(id)
      .populate('userId', 'firstName lastName email username')
      .exec();
      
    if (!profile) {
      throw new NotFoundException(`Instructor profile with ID ${id} not found`);
    }
    
    // Chercher les écoles associées à cet instructeur
    const schools = await this.schoolModel
      .find({ instructors: profile.userId })
      .select('name location contactInfo')
      .exec();
    
    return {
      ...profile.toObject(),
      schools
    };
  }
}

