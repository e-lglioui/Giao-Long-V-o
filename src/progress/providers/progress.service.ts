import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Progress, GradeLevel } from '../schemas/progress.schema';
import { CreateProgressDto } from '../dto/create-progress.dto';
import { UpdateProgressDto } from '../dto/update-progress.dto';
import { NotificationsService } from '../../notifications/providers/notifications.service';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(Progress.name) private readonly progressModel: Model<Progress>,
    private readonly notificationsService: NotificationsService
  ) {}

  async create(createProgressDto: CreateProgressDto): Promise<Progress> {
    const progress = new this.progressModel(createProgressDto);
    return progress.save();
  }

  async findAll(): Promise<Progress[]> {
    return this.progressModel.find()
      .populate('studentId')
      .populate('courseId')
      .exec();
  }

  async findOne(id: string): Promise<Progress> {
    const progress = await this.progressModel.findById(id)
      .populate('studentId')
      .populate('courseId')
      .exec();

    if (!progress) {
      throw new NotFoundException(`Progress record #${id} not found`);
    }

    return progress;
  }

  async findByStudent(studentId: string): Promise<Progress[]> {
    return this.progressModel.find({ studentId })
      .populate('courseId')
      .populate('examHistory.examiner')
      .exec();
  }

  async update(id: string, updateProgressDto: UpdateProgressDto): Promise<Progress> {
    const progress = await this.progressModel
      .findByIdAndUpdate(id, updateProgressDto, { new: true })
      .exec();

    if (!progress) {
      throw new NotFoundException(`Progress record #${id} not found`);
    }

    return progress;
  }

  async addExamResult(
    id: string,
    examResult: {
      grade: GradeLevel;
      examiner: string;
      result: string;
      notes?: string;
    }
  ): Promise<Progress> {
    const progress = await this.findOne(id);
    
    const examinerObjectId = new Types.ObjectId(examResult.examiner);
    
    progress.examHistory.push({
      grade: examResult.grade,
      examiner: examinerObjectId,
      result: examResult.result,
      notes: examResult.notes,
      date: new Date(),
      certificateUrl: examResult.result === 'pass' ? 
        await this.generateCertificate(progress.studentId.toString(), examResult.grade) : 
        undefined
    });

    if (examResult.result === 'pass') {
      progress.currentGrade = examResult.grade;
      await this.notificationsService.sendGradePromotionNotification(
        progress.studentId.toString(),
        examResult.grade
      );
    }

    return progress.save();
  }

  async evaluateSkill(
    id: string,
    evaluation: {
      skill: string;
      level: number;
      evaluatedBy: string;
    }
  ): Promise<Progress> {
    const progress = await this.findOne(id);
    
    const evaluatorObjectId = new Types.ObjectId(evaluation.evaluatedBy);
    
    progress.skills.push({
      skill: evaluation.skill,
      level: evaluation.level,
      evaluatedBy: evaluatorObjectId,
      evaluatedAt: new Date()
    });

    // Mettre à jour la moyenne des compétences
    const skillsAverage = progress.skills.reduce((acc, curr) => acc + curr.level, 0) / 
      progress.skills.length;
    
    progress.performance.skillsAverage = skillsAverage;
    progress.performance.lastEvaluation = new Date();
    progress.performance.nextEvaluationDue = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ); // +30 jours

    return progress.save();
  }

  private async generateCertificate(studentId: string, grade: GradeLevel): Promise<string> {
    // Logique de génération de certificat
    // Retourne l'URL du certificat généré
    return `https://example.com/certificates/${studentId}/${grade}`;
  }

  async getStudentDashboard(studentId: string): Promise<any> {
    const progress = await this.findByStudent(studentId);
    
    return {
      currentGrades: progress.map(p => ({
        course: p.courseId,
        grade: p.currentGrade,
        nextGrade: p.targetGrade
      })),
      recentEvaluations: progress.flatMap(p => p.skills
        .sort((a, b) => b.evaluatedAt.getTime() - a.evaluatedAt.getTime())
        .slice(0, 5)
      ),
      examHistory: progress.flatMap(p => p.examHistory),
      performance: progress.map(p => p.performance)
    };
  }

  async getExamResults(
    schoolId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const examResults = await this.progressModel.aggregate([
      {
        $match: {
          schoolId,
          'examHistory.date': {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $unwind: '$examHistory'
      },
      {
        $match: {
          'examHistory.date': {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: null,
          totalExams: { $sum: 1 },
          passedExams: {
            $sum: {
              $cond: [{ $eq: ['$examHistory.result', 'pass'] }, 1, 0]
            }
          },
          gradeDistribution: {
            $push: '$examHistory.grade'
          },
          examScores: {
            $push: '$examHistory.score'
          },
          examDates: {
            $push: '$examHistory.date'
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalExams: 1,
          passRate: {
            $multiply: [
              { $divide: ['$passedExams', '$totalExams'] },
              100
            ]
          },
          gradeDistribution: 1,
          averageScore: { $avg: '$examScores' },
          examDates: 1,
          examTrends: {
            $map: {
              input: { $range: [0, { $size: '$examDates' }] },
              as: 'idx',
              in: {
                date: { $arrayElemAt: ['$examDates', '$$idx'] },
                score: { $arrayElemAt: ['$examScores', '$$idx'] }
              }
            }
          }
        }
      }
    ]);

    const result = examResults[0] || {
      totalExams: 0,
      passRate: 0,
      gradeDistribution: [],
      averageScore: 0,
      examTrends: []
    };

    // Calculer la distribution des grades
    result.gradeDistribution = this.calculateGradeDistribution(
      result.gradeDistribution
    );

    return result;
  }

  private calculateGradeDistribution(grades: GradeLevel[]): Record<string, number> {
    const distribution = {};
    const totalGrades = grades.length;

    grades.forEach(grade => {
      distribution[grade] = (distribution[grade] || 0) + 1;
    });

    // Convertir en pourcentages
    Object.keys(distribution).forEach(grade => {
      distribution[grade] = (distribution[grade] / totalGrades) * 100;
    });

    return distribution;
  }
} 