import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { School } from '../../schools/schemas/school.schema';

export enum EventType {
  INTENSIVE_TRAINING = 'intensive_training',
  COMPETITION = 'competition',
  DEMONSTRATION = 'demonstration',
  SEMINAR = 'seminar',
  WORKSHOP = 'workshop'
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Schema({ timestamps: true })
export class Event extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    type: String,
    enum: EventType,
    required: true
  })
  type: EventType;

  @Prop({
    type: String,
    enum: EventStatus,
    default: EventStatus.DRAFT
  })
  status: EventStatus;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({
    type: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      city: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    required: true
  })
  location: {
    name: string;
    address: string;
    city?: string;
    country?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  @Prop({
    type: {
      maxParticipants: { type: Number, required: true },
      currentParticipants: { type: Number, default: 0 },
      registrationDeadline: Date,
      requirements: [String],
      categories: [{
        name: String,
        ageMin: Number,
        ageMax: Number,
        maxParticipants: Number
      }]
    },
    required: true
  })
  registrationDetails: {
    maxParticipants: number;
    currentParticipants: number;
    registrationDeadline?: Date;
    requirements?: string[];
    categories?: Array<{
      name: string;
      ageMin?: number;
      ageMax?: number;
      maxParticipants?: number;
    }>;
  };

  @Prop([{
    user: { type: MongooseSchema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    registrationDate: { type: Date, required: true },
    paymentStatus: { type: String, default: 'pending' },
    attendance: { type: Boolean, default: false },
    results: MongooseSchema.Types.Mixed
  }])
  participants: Array<{
    user: Types.ObjectId;
    role: string;
    registrationDate: Date;
    paymentStatus: string;
    attendance: boolean;
    results?: any;
  }>;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  organizer: User;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'User' }])
  instructors?: User[];

  @Prop()
  image?: string;

  @Prop([String])
  tags?: string[];

  @Prop({
    type: [{
      time: Date,
      title: String,
      description: String,
      location: String
    }]
  })
  scheduleDetails: Array<{
    time: Date;
    title: string;
    description?: string;
    location?: string;
  }>;

  @Prop({
    type: {
      amount: { type: Number, required: true },
      currency: { type: String, default: 'EUR' },
      earlyBirdDeadline: Date,
      earlyBirdAmount: Number,
      refundPolicy: String
    }
  })
  fees?: {
    amount: number;
    currency: string;
    earlyBirdDeadline?: Date;
    earlyBirdAmount?: number;
    refundPolicy?: string;
  };

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'School', required: true })
  organizingSchool: School;

  @Prop({
    type: Map,
    of: {
      type: Number,
      default: 0
    }
  })
  statistics: Map<string, number>;
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Indexes
EventSchema.index({ startDate: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ type: 1 });
EventSchema.index({ 'location.city': 1 });
EventSchema.index({ tags: 1 });
EventSchema.index({ isPublic: 1 });
