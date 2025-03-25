import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Course } from '../../courses/schemas/courses.schema';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused'
}

@Schema({ timestamps: true })
export class Attendance extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  courseId: Course;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  studentId: User;

  @Prop({ required: true })
  date: Date;

  @Prop({
    type: String,
    enum: Object.values(AttendanceStatus),
    default: AttendanceStatus.ABSENT
  })
  status: AttendanceStatus;

  @Prop()
  notes?: string;

  @Prop()
  lateMinutes?: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  markedBy: User;

  @Prop({ default: false })
  wasModified: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  modifiedBy?: User;

  @Prop()
  modifiedAt?: Date;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

// Ajouter des index pour améliorer les performances
AttendanceSchema.index({ courseId: 1, date: 1 });
AttendanceSchema.index({ studentId: 1, date: 1 });
AttendanceSchema.index({ courseId: 1, studentId: 1, date: 1 }, { unique: true });

// Middleware pour mettre à jour automatiquement les champs de modification
AttendanceSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.wasModified = true;
    this.modifiedAt = new Date();
  }
  next();
}); 