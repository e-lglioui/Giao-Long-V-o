import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/providers/user.service';
import { MailerService } from '../mailer/mailer.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('test-token'),
  };

  const mockUserService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    validateCredentials: jest.fn(),
  };

  const mockMailerService = {
    sendMail: jest.fn().mockImplementation(() => Promise.resolve()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      _id: 'userId',
      email: 'test@example.com',
    };

    it('should return token on successful login', async () => {
      mockUserService.validateCredentials.mockResolvedValue(mockUser);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token');
      expect(mockUserService.validateCredentials).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(mockJwtService.sign).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      _id: 'userId',
      email: 'test@example.com',
    };

    it('should register a new user and return token', async () => {
      mockUserService.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('access_token');
      expect(mockUserService.create).toHaveBeenCalledWith(registerDto);
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(mockMailerService.sendMail).toHaveBeenCalled();
    });
  });
});
