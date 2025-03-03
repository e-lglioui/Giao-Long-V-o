import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { ClassesController } from "./controllers/classes.controller"
import { ClassesService } from "./providers/classes.service"
import { Class, ClassSchema } from "./schemas/class.schema"
import { SchoolsModule } from "../schools/schools.module"

@Module({
  imports: [MongooseModule.forFeature([{ name: Class.name, schema: ClassSchema }]), SchoolsModule],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}

