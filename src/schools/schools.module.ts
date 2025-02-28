import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { SchoolsController } from "./controllers/schools.controller"
import { SchoolsService } from "./providers/schools.service"
import { SchoolValidatorService } from "./providers/school-validator.service"
import { School, SchoolSchema } from "./schemas/school.schema"
import { UserModule } from "../users/users.module"
import { ParseObjectIdPipe } from "./pipes/mongodb-id.pipe"

@Module({
  imports: [MongooseModule.forFeature([{ name: School.name, schema: SchoolSchema }]), UserModule],
  controllers: [SchoolsController],
  providers: [SchoolsService, SchoolValidatorService, ParseObjectIdPipe],
  exports: [SchoolsService],
})
export class SchoolsModule {}

