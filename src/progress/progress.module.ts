import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgressController } from './controllers/progress.controller';
import { ProgressService } from './providers/progress.service';
import { Progress, ProgressSchema } from './schemas/progress.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProgressEvaluationService } from './providers/progress-evaluation.service';
import { CertificateGeneratorService } from './providers/certificate-generator.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Progress.name, schema: ProgressSchema }
    ]),
    NotificationsModule
  ],
  controllers: [ProgressController],
  providers: [
    ProgressService,
    ProgressEvaluationService,
    CertificateGeneratorService
  ],
  exports: [ProgressService]
})
export class ProgressModule {} 