import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Role } from '../../auth/enums/role.enum';

@Schema({
  collection: 'users',
  timestamps: true,
})
export class User extends Document {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  })
  username: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  })
  email: string;

  @Prop({
    required: true,
    select: false,
  })
  password: string;

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
    default: false
  })
  isConfirmed: boolean;

  @Prop({
    type: String,
    default: null
  })
  confirmationToken: string;

  @Prop({
    type: String,
    default: null
  })
  resetToken: string;

  @Prop({
    type: Date,
    default: null
  })
  resetTokenExpiresAt: Date;

  @Prop({
    type: String,
    enum: Role,
    default: Role.USER
  })
  role: Role;
  
  @Prop({
    type: String,
    default: null
  })
  stripeCustomerId?: string;

  // Profile reference
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Profile',
    default: null
  })
  profile?: MongooseSchema.Types.ObjectId;

  // Student reference
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Student',
    default: null
  })
  studentProfile?: MongooseSchema.Types.ObjectId;

  // Getter for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add virtuals to schema
UserSchema.virtual('fullName').get(function(this: User) {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in serialization
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });