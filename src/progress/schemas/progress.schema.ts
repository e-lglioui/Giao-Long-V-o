import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Course } from '../../courses/schemas/courses.schema';

export enum GradeLevel {
  WHITE = 'white',
  YELLOW = 'yellow',
  ORANGE = 'orange',
  GREEN = 'green',
  BLUE = 'blue',
  BROWN = 'brown',
  BLACK = 'black'
}

@Schema({ _id: false })
class ExamResult {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, enum: GradeLevel })
  grade: GradeLevel;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  examiner: Types.ObjectId;

  @Prop({ required: true })
  result: string;

  @Prop()
  notes?: string;

  @Prop()
  certificateUrl?: string;
}

@Schema({ _id: false })
class SkillEvaluation {
  @Prop({ required: true })
  skill: string;

  @Prop({ required: true })
  level: number;

  @Prop({ required: true })
  evaluatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  evaluatedBy: Types.ObjectId;
}

@Schema({ _id: false })
class Performance {
  @Prop({ default: 0 })
  skillsAverage: number;

  @Prop()
  lastEvaluation?: Date;

  @Prop()
  nextEvaluationDue?: Date;
}

@Schema({ timestamps: true })
export class Progress extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ type: String, enum: GradeLevel, required: true })
  currentGrade: GradeLevel;

  @Prop({ type: String, enum: GradeLevel })
  targetGrade?: GradeLevel;

  @Prop({ type: [ExamResult], default: [] })
  examHistory: ExamResult[];

  @Prop({ type: [SkillEvaluation], default: [] })
  skills: SkillEvaluation[];

  @Prop({ type: Performance, default: {} })
  performance: Performance;
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);

// Indexes
ProgressSchema.index({ studentId: 1, courseId: 1 });
ProgressSchema.index({ currentGrade: 1 });
ProgressSchema.index({ 'examHistory.date': 1 });
ProgressSchema.index({ 'performance.nextEvaluationDue': 1 }); 