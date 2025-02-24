// users/services/user.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import * as bcrypt from 'bcrypt';
import { InvalidCredentialsException } from '../../common/exceptions/invalid-credentials.exception';

interface CreateUserWithTokenData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  confirmationToken: string;
  isConfirmed: boolean;
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  async getAllUsers(): Promise<User[]> {
    return await this.userModel.find().select('-password').exec();
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const newUser = new this.userModel({
      username: createUserDto.username,
      email: createUserDto.email,
      password: hashedPassword,
      isConfirmed: false,
      confirmationToken: null,
      resetToken: null,
      resetTokenExpiresAt: null
    });
    
    const savedUser = await newUser.save();
    const { password, ...result } = savedUser.toObject();
    return result as User;
  }

  async createUserWithToken(userData: CreateUserWithTokenData): Promise<User> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userModel
      .findOne({ username })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel
      .findOne({ email })
      .select('+password')
      .exec();
  }

  async findByConfirmationToken(token: string): Promise<User | null> {
    return await this.userModel
      .findOne({ confirmationToken: token })
      .exec();
  }

  async findByResetToken(token: string): Promise<User | null> {
    return await this.userModel.findOne({
      resetToken: token,
      resetTokenExpiresAt: { $gt: new Date() }
    }).exec();
  }

  async confirmUser(userId: string): Promise<void> {
    const updateResult = await this.userModel.updateOne(
      { _id: userId },
      { 
        $set: { 
          isConfirmed: true,
          confirmationToken: null 
        } 
      }
    ).exec();

    if (updateResult.matchedCount === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async setResetToken(userId: string, resetToken: string): Promise<void> {
    const resetTokenExpiresAt = new Date();
    resetTokenExpiresAt.setHours(resetTokenExpiresAt.getHours() + 24);

    const updateResult = await this.userModel.updateOne(
      { _id: userId },
      { 
        $set: { 
          resetToken: resetToken,
          resetTokenExpiresAt: resetTokenExpiresAt 
        } 
      }
    ).exec();

    if (updateResult.matchedCount === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const updateResult = await this.userModel.updateOne(
      { _id: userId },
      { 
        $set: { 
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiresAt: null 
        } 
      }
    ).exec();

    if (updateResult.matchedCount === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async validateCredentials(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    return user;
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).exec();

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }
}