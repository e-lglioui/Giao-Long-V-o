import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchoolsController } from './controllers/schools.controller';
import { SchoolsService } from './providers/schools.service';
import { SchoolValidatorService } from './providers/school-validator.service';
import { School, SchoolSchema } from './schemas/school.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: School.name, schema: SchoolSchema }
    ])
  ],
  controllers: [SchoolsController],
  providers: [SchoolsService, SchoolValidatorService],
  exports: [SchoolsService]
})
export class SchoolsModule {}
