import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './providers/reports.service';
import { Report, ReportSchema } from './schemas/report.schema';
import { AttendanceModule } from '../attendance/attendance.module';
import { ProgressModule } from '../progress/progress.module';
import { FinanceModule } from '../finance/finance.module';
import { ChartGeneratorService } from './providers/chart-generator.service';
import { StatisticsService } from './providers/statistics.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Report.name, schema: ReportSchema }
    ]),
    AttendanceModule,
    ProgressModule,
    FinanceModule
  ],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    ChartGeneratorService,
    StatisticsService
  ],
  exports: [ReportsService]
})
export class ReportsModule {}
