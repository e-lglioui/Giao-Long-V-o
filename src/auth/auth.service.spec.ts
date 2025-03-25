import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../users/providers/user.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let mailerService: MailerService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    isConfirmed: true,
    toObject: () => ({
      id: '1',
      email: 'test@example.com',
      isConfirmed: true
    })
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            createUserWithToken: jest.fn(),
            findByConfirmationToken: jest.fn(),
            confirmUser: jest.fn(),
            setResetToken: jest.fn(),
            findByResetToken: jest.fn(),
            updatePassword: jest.fn()
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    mailerService = module.get<MailerService>(MailerService);

    // Mock bcrypt
    jest.spyOn(bcrypt, 'compare').mockImplementation((password, hash) => {
      return Promise.resolve(password === 'password123');
    });
    jest.spyOn(bcrypt, 'hash').mockImplementation((password, salt) => {
      return Promise.resolve('hashedPassword');
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return token on successful login', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser as any);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token');
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is not confirmed', async () => {
      const unconfirmedUser = { ...mockUser, isConfirmed: false };
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(unconfirmedUser as any);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

      await expect(service.login({
        email: 'test@example.com',
        password: 'wrongpassword'
      })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto = new RegisterDto();
      dto.email = 'test@example.com';
      dto.password = 'password';
      dto.username = 'testuser';
      dto.firstName = 'Test';
      dto.lastName = 'User';

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'createUserWithToken').mockResolvedValue({
        id: '1',
        email: dto.email,
        username: dto.username
      } as any);
      jest.spyOn(mailerService, 'sendMail').mockResolvedValue({} as any);

      const result = await service.register(dto);
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(userService.createUserWithToken).toHaveBeenCalled();
      expect(mailerService.sendMail).toHaveBeenCalled();
    });

    it('should throw ConflictException when email exists', async () => {
      const dto = new RegisterDto();
      dto.email = 'existing@example.com';

      jest.spyOn(userService, 'findByEmail').mockResolvedValue({} as any);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('confirmEmail', () => {
    it('should confirm user email', async () => {
      const token = 'valid-token';
      jest.spyOn(userService, 'findByConfirmationToken').mockResolvedValue(mockUser as any);
      jest.spyOn(userService, 'confirmUser').mockResolvedValue({} as any);

      const result = await service.confirmEmail(token);
      expect(result).toEqual({ message: 'Email confirmed successfully' });
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const token = 'invalid-token';
      jest.spyOn(userService, 'findByConfirmationToken').mockResolvedValue(null);

      await expect(service.confirmEmail(token)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

      const result = await service.validateUser('test@example.com', 'password123');
      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
    });

    it('should return null when user is not found', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password123');
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');
      expect(result).toBeNull();
    });
  });

  describe('forgotPassword', () => {
    it('should set reset token and send email when user exists', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(userService, 'setResetToken').mockResolvedValue({} as any);

      const result = await service.forgotPassword('test@example.com');
      expect(result).toEqual({ message: 'If the email exists, a reset link has been sent.' });
      expect(userService.setResetToken).toHaveBeenCalled();
      expect(mailerService.sendMail).toHaveBeenCalled();
    });

    it('should return same message when user does not exist', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

      const result = await service.forgotPassword('nonexistent@example.com');
      expect(result).toEqual({ message: 'If the email exists, a reset link has been sent.' });
      expect(userService.setResetToken).not.toHaveBeenCalled();
      expect(mailerService.sendMail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should update password when token is valid', async () => {
      jest.spyOn(userService, 'findByResetToken').mockResolvedValue(mockUser as any);
      jest.spyOn(userService, 'updatePassword').mockResolvedValue({} as any);

      const result = await service.resetPassword('valid-token', 'newPassword123');
      expect(result).toEqual({ message: 'Password reset successful' });
      expect(userService.updatePassword).toHaveBeenCalledWith(mockUser.id, 'hashedPassword');
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      jest.spyOn(userService, 'findByResetToken').mockResolvedValue(null);

      await expect(service.resetPassword('invalid-token', 'newPassword123')).rejects.toThrow(UnauthorizedException);
      expect(userService.updatePassword).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should return success message', async () => {
      const user = { id: '1', email: 'test@example.com' };
      
      const result = await service.logout(user);
      expect(result).toEqual({ message: 'Logout successful' });
    });
  });
});