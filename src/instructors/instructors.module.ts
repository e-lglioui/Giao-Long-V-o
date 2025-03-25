import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InstructorManagementController } from './controllers/instructor-management.controller';
import { InstructorManagementService } from './providers/instructor-management.service';
import { SchoolInstructor, SchoolInstructorSchema } from './schemas/school-instructor.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';
import { School, SchoolSchema } from '../schools/schemas/school.schema';
import { InstructorsService } from './providers/instructors.service';
import { InstructorEmailService } from './providers/instructor-email.service';
import { InstructorProfile, InstructorProfileSchema } from './schemas/instructor-profile.schema';
import { SchoolsModule } from '../schools/schools.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SchoolInstructor.name, schema: SchoolInstructorSchema },
      { name: InstructorProfile.name, schema: InstructorProfileSchema },
      { name: User.name, schema: UserSchema },
      { name: School.name, schema: SchoolSchema },
    ]),
    AuthModule,
    forwardRef(() => SchoolsModule),
  ],
  controllers: [InstructorManagementController],
  providers: [
    InstructorManagementService,
    InstructorsService,
    InstructorEmailService
  ],
  exports: [
    InstructorManagementService,
    InstructorsService
  ],
})
export class InstructorsModule {}

