import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/users/schemas/user.schema';
import { UserService } from 'src/users/providers/user.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private mailerService: MailerService,
    private userService: UserService,
  ) {}
   async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

// In auth.service.ts
async register(registerDto: RegisterDto) {
  // Check if user exists code remains the same...
  const existingUser = await this.userService.findByEmail(registerDto.email);
  if (existingUser) {
    throw new ConflictException('Email already exists');
  }

  const confirmationToken = uuidv4();
  const hashedPassword = await bcrypt.hash(registerDto.password, 10);
  
  // Only pass the properties that createUserWithToken expects
  const user = await this.userService.createUserWithToken({
    username: registerDto.username,
    email: registerDto.email,
    password: hashedPassword,
    confirmationToken
  });

  await this.sendConfirmationEmail(user.email, confirmationToken);

  return {
    message: 'Registration successful. Please check your email to confirm your account.',
  };
}

  async confirmEmail(token: string) {
    const user = await this.userService.findByConfirmationToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid confirmation token');
    }

    await this.userService.confirmUser(user.id);
    return { message: 'Email confirmed successfully' };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user || !user.isConfirmed) {
      throw new UnauthorizedException('Invalid credentials or unconfirmed email');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    const resetToken = uuidv4();
    await this.userService.setResetToken(user.id, resetToken);
    
    await this.sendPasswordResetEmail(email, resetToken);
    return { message: 'If the email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userService.findByResetToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userService.updatePassword(user.id, hashedPassword);
    
    return { message: 'Password reset successful' };
  }

  private async sendConfirmationEmail(email: string, token: string) {
    const confirmationUrl = `${process.env.FRONTEND_URL}/auth/confirm-email?token=${token}`;
    
    await this.mailerService.sendMail({
      to: email,
      subject: 'Confirm your email',
      template: 'confirmation', 
      context: {
        confirmationUrl,
      },
    });
  }

  private async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
    
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset your password',
      template: 'reset-password',
      context: {
        resetUrl,
      },
    });
  }
}
