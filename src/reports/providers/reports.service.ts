import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportType, ReportPeriod } from '../schemas/report.schema';
import { CreateReportDto } from '../dto/create-report.dto';
import { AttendanceService } from '../../attendance/providers/attendance.service';
import { ProgressService } from '../../progress/providers/progress.service';
import { PaymentsService } from '../../finance/providers/payments.service';
import { ChartGeneratorService } from './chart-generator.service';
import { StatisticsService } from './statistics.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name) private readonly reportModel: Model<Report>,
    private readonly attendanceService: AttendanceService,
    private readonly progressService: ProgressService,
    private readonly paymentsService: PaymentsService,
    private readonly chartGenerator: ChartGeneratorService,
    private readonly statisticsService: StatisticsService
  ) {}

  async generateReport(createReportDto: CreateReportDto): Promise<Report> {
    const { type, period, schoolId, startDate, endDate } = createReportDto;
    
    let metrics = new Map();
    let chartData = [];
    let statistics = {
      totalCount: 0,
      averages: new Map(),
      distribution: new Map(),
      trends: []
    };

    switch (type) {
      case ReportType.ATTENDANCE:
        const attendanceData = await this.attendanceService.getAttendanceStats(
          schoolId,
          startDate,
          endDate
        );
        metrics = this.processAttendanceMetrics(attendanceData);
        chartData = this.chartGenerator.generateAttendanceCharts(attendanceData);
        statistics = this.statisticsService.calculateAttendanceStatistics(attendanceData);
        break;

      case ReportType.EXAM_RESULTS:
        const examData = await this.progressService.getExamResults(
          schoolId,
          startDate,
          endDate
        );
        metrics = this.processExamMetrics(examData);
        chartData = this.chartGenerator.generateExamCharts(examData);
        statistics = this.statisticsService.calculateExamStatistics(examData);
        break;

      case ReportType.REVENUE:
        const revenueData = await this.paymentsService.getRevenueStats(
          schoolId,
          startDate,
          endDate
        );
        metrics = this.processRevenueMetrics(revenueData);
        chartData = this.chartGenerator.generateRevenueCharts(revenueData);
        statistics = this.statisticsService.calculateRevenueStatistics(revenueData);
        break;
    }

    const report = new this.reportModel({
      ...createReportDto,
      metrics,
      chartData,
      statistics,
      insights: this.generateInsights(metrics, statistics)
    });

    return report.save();
  }

  private processAttendanceMetrics(data: any): Map<string, any> {
    const metrics = new Map();
    metrics.set('totalSessions', data.totalSessions);
    metrics.set('averageAttendance', data.averageAttendance);
    metrics.set('absenceRate', data.absenceRate);
    metrics.set('mostAttendedCourses', data.mostAttendedCourses);
    return metrics;
  }

  private processExamMetrics(data: any): Map<string, any> {
    const metrics = new Map();
    metrics.set('totalExams', data.totalExams);
    metrics.set('passRate', data.passRate);
    metrics.set('averageScore', data.averageScore);
    metrics.set('gradeDistribution', data.gradeDistribution);
    return metrics;
  }

  private processRevenueMetrics(data: any): Map<string, any> {
    const metrics = new Map();
    metrics.set('totalRevenue', data.totalRevenue);
    metrics.set('revenueBySource', data.revenueBySource);
    metrics.set('monthlyGrowth', data.monthlyGrowth);
    metrics.set('topPerformingCourses', data.topPerformingCourses);
    return metrics;
  }

  private generateInsights(metrics: Map<string, any>, statistics: any): string[] {
    const insights = [];
    // Logique pour générer des insights basés sur les métriques et statistiques
    return insights;
  }

  async findAll(filters: any = {}): Promise<Report[]> {
    return this.reportModel.find(filters)
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Report> {
    const report = await this.reportModel.findById(id).exec();
    if (!report) {
      throw new NotFoundException(`Report #${id} not found`);
    }
    return report;
  }

  async archiveReport(id: string): Promise<Report> {
    const report = await this.findOne(id);
    report.isArchived = true;
    return report.save();
  }
} 