import { Injectable } from '@nestjs/common';

@Injectable()
export class ChartGeneratorService {
  generateAttendanceCharts(data: any): any[] {
    return [
      {
        type: 'line',
        data: this.processAttendanceTrends(data),
        options: {
          title: 'Tendances de présence',
          xAxis: 'Date',
          yAxis: 'Nombre d\'élèves'
        }
      },
      {
        type: 'pie',
        data: this.processAttendanceDistribution(data),
        options: {
          title: 'Distribution des présences'
        }
      }
    ];
  }

  generateExamCharts(data: any): any[] {
    return [
      {
        type: 'bar',
        data: this.processGradeDistribution(data),
        options: {
          title: 'Distribution des notes',
          xAxis: 'Grade',
          yAxis: 'Nombre d\'élèves'
        }
      },
      {
        type: 'line',
        data: this.processPassRateTrends(data),
        options: {
          title: 'Évolution du taux de réussite',
          xAxis: 'Date',
          yAxis: 'Taux de réussite (%)'
        }
      }
    ];
  }

  generateRevenueCharts(data: any): any[] {
    return [
      {
        type: 'line',
        data: this.processRevenueTrends(data),
        options: {
          title: 'Évolution des revenus',
          xAxis: 'Date',
          yAxis: 'Revenus'
        }
      },
      {
        type: 'doughnut',
        data: this.processRevenueBySource(data),
        options: {
          title: 'Répartition des revenus par source'
        }
      }
    ];
  }

  private processAttendanceTrends(data: any): any {
    // Logique de traitement des tendances de présence
    return {
      labels: data.dates,
      datasets: [{
        label: 'Présences',
        data: data.attendanceCounts
      }]
    };
  }

  private processAttendanceDistribution(data: any): any {
    // Logique de traitement de la distribution des présences
    return {
      labels: ['Présent', 'Absent', 'Retard', 'Excusé'],
      datasets: [{
        data: [
          data.presentCount,
          data.absentCount,
          data.lateCount,
          data.excusedCount
        ]
      }]
    };
  }

  private processGradeDistribution(data: any): any {
    // Logique de traitement de la distribution des notes
    return {
      labels: Object.keys(data.gradeDistribution),
      datasets: [{
        data: Object.values(data.gradeDistribution)
      }]
    };
  }

  private processPassRateTrends(data: any): any {
    // Logique de traitement des tendances de taux de réussite
    return {
      labels: data.examDates,
      datasets: [{
        label: 'Taux de réussite',
        data: data.passRates
      }]
    };
  }

  private processRevenueTrends(data: any): any {
    // Logique de traitement des tendances de revenus
    return {
      labels: data.months,
      datasets: [{
        label: 'Revenus',
        data: data.monthlyRevenue
      }]
    };
  }

  private processRevenueBySource(data: any): any {
    // Logique de traitement des revenus par source
    return {
      labels: Object.keys(data.revenueBySource),
      datasets: [{
        data: Object.values(data.revenueBySource)
      }]
    };
  }
} 