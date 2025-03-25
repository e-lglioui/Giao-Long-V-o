import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StaffManagementController } from './controllers/staff-management.controller';
import { StaffManagementService } from './providers/staff-management.service';
import { SchoolStaff, SchoolStaffSchema } from './schemas/school-staff.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';
import { School, SchoolSchema } from '../schools/schemas/school.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SchoolStaff.name, schema: SchoolStaffSchema },
      { name: User.name, schema: UserSchema },
      { name: School.name, schema: SchoolSchema },
    ]),
    AuthModule,
  ],
  controllers: [StaffManagementController],
  providers: [StaffManagementService],
  exports: [StaffManagementService],
})
export class StaffModule {} 