import { User } from '../schemas/user.schema';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { Document } from 'mongoose';

export interface IUserService {
  getAllUsers(): Promise<User[]>;
  findById(id: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  findByUsername(username: string): Promise<User>;
  createUser(createUserDto: CreateUserDto): Promise<User>;
  updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User>;
  validateCredentials(email: string, password: string): Promise<User>;
  exists(email: string, username: string): Promise<boolean>;
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  isVerified?: boolean;
  verificationToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
