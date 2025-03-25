import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({
  collection: 'school_staff',
  timestamps: true,
})
export class SchoolStaff extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'School',
    required: true,
  })
  school: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    default: 'General Staff'
  })
  position: string;

  @Prop({
    type: String,
    default: 'General'
  })
  department: string;

  @Prop({
    type: Boolean,
    default: true
  })
  isActive: boolean;

  @Prop({
    type: Date,
    default: Date.now
  })
  createdAt: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
  })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({
    type: Date,
    default: null
  })
  updatedAt: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    default: null
  })
  updatedBy: MongooseSchema.Types.ObjectId;

  @Prop({
    type: Date,
    default: null
  })
  deactivatedAt: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    default: null
  })
  deactivatedBy: MongooseSchema.Types.ObjectId;
}

export const SchoolStaffSchema = SchemaFactory.createForClass(SchoolStaff); 