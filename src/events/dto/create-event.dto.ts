import { IsNotEmpty, IsString, IsDate, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EventType, EventStatus } from '../schemas/event.schema';

export class CreateEventDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty({ enum: EventType })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({ enum: EventStatus })
  @IsEnum(EventStatus)
  status: EventStatus;

  @ApiProperty()
  @IsNotEmpty()
  organizingSchool: string;

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => EventFeesDto)
  fees?: EventFeesDto;

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => EventRegistrationDto)
  registration?: EventRegistrationDto;

  @ApiProperty()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EventScheduleItemDto)
  schedule?: EventScheduleItemDto[];
}

export class EventFeesDto {
  @ApiProperty()
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsOptional()
  currency?: string;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  earlyBirdDeadline?: Date;

  @ApiProperty()
  @IsOptional()
  earlyBirdAmount?: number;

  @ApiProperty()
  @IsOptional()
  refundPolicy?: string;
}

export class EventRegistrationDto {
  @ApiProperty()
  @IsNotEmpty()
  maxParticipants: number;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  registrationDeadline: Date;

  @ApiProperty()
  @IsOptional()
  requirements?: string[];

  @ApiProperty()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EventCategoryDto)
  categories?: EventCategoryDto[];
}

export class EventCategoryDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsOptional()
  ageMin?: number;

  @ApiProperty()
  @IsOptional()
  ageMax?: number;

  @ApiProperty()
  @IsOptional()
  maxParticipants?: number;
}

export class EventScheduleItemDto {
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  time: Date;

  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsOptional()
  location?: string;
} 