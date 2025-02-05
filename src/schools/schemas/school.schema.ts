import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

@Schema({ timestamps: true })
export class School extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  address: string;

  @Prop()
  contactNumber: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  instructors: User[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  students: User[];

  @Prop({
    type: {
      studentCount: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      performanceStats: { type: Map, of: Number },
    },
  })
  dashboard: {
    studentCount: number;
    revenue: number;
    performanceStats: Map<string, number>;
  };
}

export const SchoolSchema = SchemaFactory.createForClass(School); 