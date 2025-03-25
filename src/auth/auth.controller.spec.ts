import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    confirmEmail: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with registerDto', async () => {
      const registerDto: RegisterDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };
      const expectedResult = {
        message: 'Registration successful',
        access_token: 'test-token',
        user: { id: '1', email: 'test@example.com' },
      };
      
      mockAuthService.register.mockResolvedValue(expectedResult);
      
      const result = await controller.register(registerDto);
      
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('confirmEmail', () => {
    it('should call authService.confirmEmail with token', async () => {
      const token = 'valid-token';
      const expectedResult = { message: 'Email confirmed successfully' };
      
      mockAuthService.confirmEmail.mockResolvedValue(expectedResult);
      
      const result = await controller.confirmEmail(token);
      
      expect(authService.confirmEmail).toHaveBeenCalledWith(token);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgotPassword with email', async () => {
      const email = 'test@example.com';
      const expectedResult = { message: 'If the email exists, a reset link has been sent.' };
      
      mockAuthService.forgotPassword.mockResolvedValue(expectedResult);
      
      const result = await controller.forgotPassword(email);
      
      expect(authService.forgotPassword).toHaveBeenCalledWith(email);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword with token and newPassword', async () => {
      const token = 'valid-token';
      const newPassword = 'newPassword123';
      const expectedResult = { message: 'Password reset successful' };
      
      mockAuthService.resetPassword.mockResolvedValue(expectedResult);
      
      const result = await controller.resetPassword(token, newPassword);
      
      expect(authService.resetPassword).toHaveBeenCalledWith(token, newPassword);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should call authService.login with loginDto', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = {
        access_token: 'test-token',
        user: { id: '1', email: 'test@example.com' },
      };
      
      mockAuthService.login.mockResolvedValue(expectedResult);
      
      const result = await controller.login(loginDto);
      
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('logout', () => {
    it('should call authService.logout with user from request', async () => {
      const req = { user: { id: '1', email: 'test@example.com' } };
      const expectedResult = { message: 'Logout successful' };
      
      mockAuthService.logout.mockResolvedValue(expectedResult);
      
      const result = await controller.logout(req);
      
      expect(authService.logout).toHaveBeenCalledWith(req.user);
      expect(result).toEqual(expectedResult);
    });
  });
});