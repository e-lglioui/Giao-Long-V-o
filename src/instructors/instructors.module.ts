import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { InstructorsController } from "./controllers/instructors.controller"
import { InstructorsService } from "./providers/instructors.service"
import { InstructorProfile, InstructorProfileSchema } from "./schemas/instructor-profile.schema"
import { User, UserSchema } from "../users/schemas/user.schema"
import { InstructorEmailService } from "./providers/instructor-email.service"
import { School, SchoolSchema } from "../schools/schemas/school.schema"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InstructorProfile.name, schema: InstructorProfileSchema },
      { name: User.name, schema: UserSchema },
      { name: School.name, schema: SchoolSchema },
    ]),
  ],
  controllers: [InstructorsController],
  providers: [InstructorsService, InstructorEmailService],
  exports: [InstructorsService],
})
export class InstructorsModule {}

