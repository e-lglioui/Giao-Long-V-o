import { Injectable } from '@nestjs/common';

@Injectable()
export class StatisticsService {
  calculateAttendanceStatistics(data: any): any {
    return {
      totalCount: this.calculateTotalAttendance(data),
      averages: this.calculateAttendanceAverages(data),
      distribution: this.calculateAttendanceDistribution(data),
      trends: this.calculateAttendanceTrends(data)
    };
  }

  calculateExamStatistics(data: any): any {
    return {
      totalCount: this.calculateTotalExams(data),
      averages: this.calculateExamAverages(data),
      distribution: this.calculateGradeDistribution(data),
      trends: this.calculateExamTrends(data)
    };
  }

  calculateRevenueStatistics(data: any): any {
    return {
      totalCount: this.calculateTotalRevenue(data),
      averages: this.calculateRevenueAverages(data),
      distribution: this.calculateRevenueDistribution(data),
      trends: this.calculateRevenueTrends(data)
    };
  }

  private calculateTotalAttendance(data: any): number {
    return data.totalSessions * data.averageAttendance;
  }

  private calculateAttendanceAverages(data: any): Map<string, number> {
    const averages = new Map();
    averages.set('daily', data.dailyAverage);
    averages.set('weekly', data.weeklyAverage);
    averages.set('monthly', data.monthlyAverage);
    return averages;
  }

  private calculateAttendanceDistribution(data: any): Map<string, number> {
    const distribution = new Map();
    distribution.set('present', data.presentPercentage);
    distribution.set('absent', data.absentPercentage);
    distribution.set('late', data.latePercentage);
    distribution.set('excused', data.excusedPercentage);
    return distribution;
  }

  private calculateAttendanceTrends(data: any): any[] {
    return data.attendanceTrends.map(trend => ({
      date: trend.date,
      value: trend.attendanceRate
    }));
  }

  // Méthodes similaires pour les examens et les revenus...
  private calculateTotalExams(data: any): number {
    return data.totalExams;
  }

  private calculateExamAverages(data: any): Map<string, number> {
    const averages = new Map();
    averages.set('score', data.averageScore);
    averages.set('passRate', data.passRate);
    return averages;
  }

  private calculateGradeDistribution(data: any): Map<string, number> {
    return new Map(Object.entries(data.gradeDistribution));
  }

  private calculateExamTrends(data: any): any[] {
    return data.examTrends;
  }

  private calculateTotalRevenue(data: any): number {
    return data.totalRevenue;
  }

  private calculateRevenueAverages(data: any): Map<string, number> {
    const averages = new Map();
    averages.set('daily', data.dailyAverage);
    averages.set('monthly', data.monthlyAverage);
    averages.set('yearly', data.yearlyAverage);
    return averages;
  }

  private calculateRevenueDistribution(data: any): Map<string, number> {
    return new Map(Object.entries(data.revenueBySource));
  }

  private calculateRevenueTrends(data: any): any[] {
    return data.revenueTrends;
  }
} 