import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
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
    type: [String],
    enum: Role,
    default: [Role.STUDENT]
  })
  roles: Role[];

  @Prop({
    type: String,
    default: null
  })
  stripeCustomerId?: string;

  // Getter virtuel pour le nom complet
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

// Ajouter les virtuals au schéma
UserSchema.virtual('fullName').get(function(this: User) {
  return `${this.firstName} ${this.lastName}`;
});

// S'assurer que les virtuals sont inclus dans la sérialisation
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });