import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({
  collection: 'students',
  timestamps: true,
})
export class Student extends Document {
  @Prop({
    required: true,
    trim: true,
  })
  firstName: string;

  @Prop({
    required: true,
    trim: true,
  })
  lastName: string;

  @Prop({
    required: true,
    unique: true,
  })
  studentId: string;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'User'
  })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
  })
  dateOfBirth: Date;

  @Prop({
    required: true,
  })
  class: string;

  @Prop({
    default: true,
  })
  isActive: boolean;

  @Prop({
    type: [String],
    default: [],
  })
  courses: string[];

  @Prop({
    type: Map,
    of: Number,
    default: {},
  })
  grades: Map<string, number>;
}

export const StudentSchema = SchemaFactory.createForClass(Student); 