import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
}

export const UserSchema = SchemaFactory.createForClass(User);