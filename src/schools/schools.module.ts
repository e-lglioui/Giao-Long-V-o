import { Module, forwardRef } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { SchoolsController } from "./controllers/schools.controller"
import { SchoolsService } from "./providers/schools.service"
import { SchoolValidatorService } from "./providers/school-validator.service"
import { School, SchoolSchema } from "./schemas/school.schema"
import { UserModule } from "../users/users.module"
import { ParseObjectIdPipe } from "./pipes/mongodb-id.pipe"
import { Student, StudentSchema } from "../students/schemas/student.schema"
import { CoursesModule } from "../courses/courses.module"
import { User, UserSchema } from "../users/schemas/user.schema"
import { StudentsModule } from "../students/students.module"
import { UploadModule } from "../upload/upload.module"
import { InstructorsModule } from "../instructors/instructors.module"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: School.name, schema: SchoolSchema },
      { name: Student.name, schema: StudentSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UserModule,
    CoursesModule,
    StudentsModule,
    UploadModule,
    forwardRef(() => InstructorsModule),
  ],
  controllers: [SchoolsController],
  providers: [SchoolsService, SchoolValidatorService, ParseObjectIdPipe],
  exports: [SchoolsService, SchoolValidatorService],
})
export class SchoolsModule {}

