import { PartialType } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {}

// Les classes suivantes sont nécessaires pour la mise à jour partielle

export class UpdateEventFeesDto {
  amount?: number;
  currency?: string;
  earlyBirdDeadline?: Date;
  earlyBirdAmount?: number;
  refundPolicy?: string;
}

export class UpdateEventRegistrationDto {
  maxParticipants?: number;
  registrationDeadline?: Date;
  requirements?: string[];
  categories?: UpdateEventCategoryDto[];
}

export class UpdateEventCategoryDto {
  name?: string;
  ageMin?: number;
  ageMax?: number;
  maxParticipants?: number;
}

export class UpdateEventScheduleItemDto {
  time?: Date;
  title?: string;
  description?: string;
  location?: string;
}

export class UpdateParticipantDto {
  role?: string;
  paymentStatus?: string;
  attendance?: boolean;
  results?: {
    rank?: number;
    score?: number;
    medals?: string[];
    certificates?: string[];
  };
} 