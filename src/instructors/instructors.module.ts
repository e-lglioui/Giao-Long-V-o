import { Module, forwardRef } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { MulterModule } from '@nestjs/platform-express'
import { InstructorsController } from "./controllers/instructors.controller"
import { InstructorsService } from "./providers/instructors.service"
import { InstructorProfile, InstructorProfileSchema } from "./schemas/instructor-profile.schema"
import { User, UserSchema } from "../users/schemas/user.schema"
import { InstructorEmailService } from "./providers/instructor-email.service"
import { School, SchoolSchema } from "../schools/schemas/school.schema"
import { SchoolsModule } from "../schools/schools.module"
import { UploadModule } from "../upload/upload.module"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InstructorProfile.name, schema: InstructorProfileSchema },
      { name: User.name, schema: UserSchema },
      { name: School.name, schema: SchoolSchema },
    ]),
    forwardRef(() => SchoolsModule),
    UploadModule,
  ],
  controllers: [InstructorsController],
  providers: [InstructorsService, InstructorEmailService],
  exports: [InstructorsService],
})
export class InstructorsModule {}

