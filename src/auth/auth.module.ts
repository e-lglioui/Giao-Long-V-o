import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { ConfigModule } from '@nestjs/config';
import { RolePermissionService } from './services/role-permission.service';
import { RolesGuard } from './guards/roles.guard';

import { PermissionsGuard } from './guards/permissions.guard';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    forwardRef(() => UserModule),
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy, 
    LocalStrategy, 
    RolePermissionService,
    RolesGuard,
    PermissionsGuard
  ],
  exports: [
    AuthService, 
    RolePermissionService,
    RolesGuard,
    PermissionsGuard
  ],
})
export class AuthModule {}