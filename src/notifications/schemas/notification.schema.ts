import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export enum NotificationType {
  SYSTEM = 'system',
  EVENT = 'event',
  PAYMENT = 'payment',
  COURSE = 'course',
  GRADE = 'grade',
  MESSAGE = 'message'
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived'
}

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({
    type: String,
    enum: NotificationType,
    default: NotificationType.SYSTEM
  })
  type: NotificationType;

  @Prop({
    type: String,
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD
  })
  status: NotificationStatus;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, any>;

  @Prop()
  link?: string;

  @Prop()
  image?: string;

  @Prop({ default: false })
  isUrgent: boolean;

  @Prop({ default: null })
  expiresAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes
NotificationSchema.index({ userId: 1, status: 1 });
NotificationSchema.index({ createdAt: 1 });
NotificationSchema.index({ type: 1 }); 