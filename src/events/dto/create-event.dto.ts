import { IsNotEmpty, IsString, IsDate, IsEnum, IsOptional, ValidateNested, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EventType, EventStatus } from '../schemas/event.schema';

export class EventFeesDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  earlyBirdDeadline?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  earlyBirdAmount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  refundPolicy?: string;
}

export class EventCategoryDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  ageMin?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  ageMax?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxParticipants?: number;
}

export class EventRegistrationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  maxParticipants: number;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  registrationDeadline: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @ApiProperty({ required: false, type: [EventCategoryDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EventCategoryDto)
  categories?: EventCategoryDto[];
}

export class EventScheduleItemDto {
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  time: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;
}

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
  startDate: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty()
  @IsNotEmpty()
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
  @IsString()
  organizingSchool: string;

  @ApiProperty({ required: false, type: EventFeesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EventFeesDto)
  fees?: EventFeesDto;

  @ApiProperty({ required: false, type: EventRegistrationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EventRegistrationDto)
  registration?: EventRegistrationDto;

  @ApiProperty({ required: false, type: [EventScheduleItemDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EventScheduleItemDto)
  schedule?: EventScheduleItemDto[];
} 