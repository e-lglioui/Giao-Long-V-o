import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  CMI = 'cmi'
}

export enum PaymentType {
  COURSE = 'course',
  EVENT = 'event',
  MEMBERSHIP = 'membership',
  OTHER = 'other'
}

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING
  })
  status: PaymentStatus;

  @Prop({
    type: String,
    enum: Object.values(PaymentMethod),
    required: true
  })
  method: PaymentMethod;

  @Prop({
    type: String,
    enum: Object.values(PaymentType),
    required: true
  })
  type: PaymentType;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, any>;

  @Prop()
  stripePaymentIntentId?: string;

  @Prop()
  stripeCustomerId?: string;

  @Prop()
  invoiceUrl?: string;

  @Prop()
  receiptUrl?: string;

  @Prop()
  description?: string;

  @Prop()
  failureReason?: string;

  @Prop()
  refundReason?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Indexes
PaymentSchema.index({ userId: 1, status: 1 });
PaymentSchema.index({ createdAt: 1 });
PaymentSchema.index({ stripePaymentIntentId: 1 }, { unique: true, sparse: true }); 