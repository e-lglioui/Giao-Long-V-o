import { IsString, IsMongoId, IsArray, IsNumber, IsOptional } from 'class-validator';

export class CreateCourseDto {
  @IsMongoId()
  schoolId: string;

  @IsMongoId()
  instructorId: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  schedule?: Array<{
    date: Date;
    startTime: string;
    endTime: string;
  }>;

  @IsNumber()
  @IsOptional()
  capacity?: number;
} 