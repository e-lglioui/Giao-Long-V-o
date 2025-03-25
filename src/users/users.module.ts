import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserService } from './providers/user.service';
import { UserRoleManagementService } from './providers/user-role-management.service';
import { UserRoleManagementController } from './controllers/user-role-management.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }
    ]),
    forwardRef(() => AuthModule)
  ],
  controllers: [UserRoleManagementController],
  providers: [UserService, UserRoleManagementService],
  exports: [UserService, MongooseModule],
})
export class UserModule {}