import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { School } from '../../schools/schemas/school.schema';
import { Course } from '../../courses/schemas/courses.schema';

export enum ReportType {
  ATTENDANCE = 'attendance',
  EXAM_RESULTS = 'exam_results',
  REVENUE = 'revenue',
  PERFORMANCE = 'performance',
  STUDENT_PROGRESS = 'student_progress'
}

export enum ReportPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

@Schema({ timestamps: true })
export class Report extends Document {
  @Prop({
    type: String,
    enum: Object.values(ReportType),
    required: true
  })
  type: ReportType;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'School' })
  schoolId?: School;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course' })
  courseId?: Course;

  @Prop({
    type: String,
    enum: Object.values(ReportPeriod),
    required: true
  })
  period: ReportPeriod;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({
    type: Map,
    of: MongooseSchema.Types.Mixed,
    required: true
  })
  metrics: Map<string, any>;

  @Prop({
    type: [{
      label: String,
      value: Number,
      category: String,
      date: Date
    }]
  })
  chartData: Array<{
    label: string;
    value: number;
    category?: string;
    date?: Date;
  }>;

  @Prop({
    type: {
      totalCount: Number,
      averages: Map,
      distribution: Map,
      trends: [{
        date: Date,
        value: Number
      }]
    }
  })
  statistics: {
    totalCount: number;
    averages: Map<string, number>;
    distribution: Map<string, number>;
    trends: Array<{
      date: Date;
      value: number;
    }>;
  };

  @Prop({ type: Object })
  filters?: Record<string, any>;

  @Prop()
  summary?: string;

  @Prop([String])
  insights: string[];

  @Prop({ default: false })
  isArchived: boolean;
}

export const ReportSchema = SchemaFactory.createForClass(Report);

// Indexes
ReportSchema.index({ type: 1, schoolId: 1, period: 1 });
ReportSchema.index({ startDate: 1, endDate: 1 });
ReportSchema.index({ 'statistics.totalCount': 1 }); 