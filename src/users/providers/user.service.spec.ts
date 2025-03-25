import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dtos/create-user.dto';

describe('UserService', () => {
  let service: UserService;
  let userModelMock: any;

  // Mock user object
  const mockUser = {
    _id: 'user-id-1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    isConfirmed: true,
    confirmationToken: null,
    resetToken: null,
    resetTokenExpiresAt: null,
    role: 'user',
    isOnline: false,
    toObject: () => ({
      _id: 'user-id-1',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      isConfirmed: true,
      role: 'user'
    }),
    save: jest.fn()
  };

  beforeEach(async () => {
    // Create a mock Mongoose model that behaves like a constructor
    const createMock = jest.fn().mockImplementation((data) => ({
      ...mockUser,
      ...data,
      save: jest.fn().mockResolvedValue({
        ...mockUser,
        ...data,
        toObject: () => ({
          _id: 'user-id-1',
          username: data.username,
          email: data.email,
          firstName: 'Test',
          lastName: 'User'
        })
      })
    }));

    userModelMock = {
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      findByIdAndUpdate: jest.fn().mockReturnThis(),
      updateOne: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockUser),
      new: createMock,
      create: jest.fn().mockResolvedValue(mockUser)
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: userModelMock
        }
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    // Mock bcrypt
    jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedPassword'));
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
  });

  describe('createUser', () => {
    // it('should create a new user', async () => {
    //   const createUserDto: CreateUserDto = {
    //     username: 'newuser',
    //     email: 'new@example.com',
    //     password: 'password123'
    //   };

    //   // Mock findByEmail to return null (user doesn't exist)
    //   jest.spyOn(service, 'findByEmail').mockResolvedValueOnce(null);

    //   const result = await service.createUser(createUserDto);
      
    //   expect(service.findByEmail).toHaveBeenCalledWith(createUserDto.email);
    //   expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    //   expect(result).toBeDefined();
    //   expect(result.email).toEqual(createUserDto.email);
    // });

    it('should throw ConflictException if user with email already exists', async () => {
      const createUserDto: CreateUserDto = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123'
      };

      // Mock findByEmail to return a user (user exists)
      jest.spyOn(service, 'findByEmail').mockResolvedValueOnce(mockUser as any);

      await expect(service.createUser(createUserDto)).rejects.toThrow(ConflictException);
    });
  });
});