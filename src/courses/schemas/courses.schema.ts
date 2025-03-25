import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { School } from '../../schools/schemas/school.schema';

@Schema({ timestamps: true })
export class Course extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'School', required: true })
  schoolId: School;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  instructorId: User;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop([{
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  }])
  schedule: Array<{
    date: Date;
    startTime: string;
    endTime: string;
  }>;

  @Prop({ min: 1 })
  capacity?: number;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  participants: User[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Map, of: Number })
  stats: Map<string, number>;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

// Ajouter des index pour améliorer les performances
CourseSchema.index({ schoolId: 1, title: 1 });
CourseSchema.index({ instructorId: 1 }); 