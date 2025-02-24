import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../users/providers/user.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';

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
            confirmUser: jest.fn()
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
      jest.spyOn(userService, 'createUserWithToken').mockResolvedValue({} as any);
      jest.spyOn(mailerService, 'sendMail').mockResolvedValue({} as any);

      const result = await service.register(dto);
      expect(result).toEqual({
        message: 'Registration successful. Please check your email to confirm your account.',
      });
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
});
