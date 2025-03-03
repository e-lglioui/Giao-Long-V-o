import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { EnrollmentController } from "./controllers/enrollment.controller"
import { EnrollmentService } from "./providers/enrollment.service"
import { Enrollment, EnrollmentSchema } from "./schemas/enrollment.schema"
import { SchoolsModule } from "../schools/schools.module"
import { ClassesModule } from "../classes/classes.module"

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Enrollment.name, schema: EnrollmentSchema }]),
    SchoolsModule,
    ClassesModule,
  ],
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}

