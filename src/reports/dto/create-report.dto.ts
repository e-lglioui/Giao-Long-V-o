import { IsNotEmpty, IsEnum, IsDate, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ReportType, ReportPeriod } from '../schemas/report.schema';

export class CreateReportDto {
  @ApiProperty({ enum: ReportType })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({ enum: ReportPeriod })
  @IsEnum(ReportPeriod)
  period: ReportPeriod;

  @ApiProperty()
  @IsOptional()
  @IsString()
  schoolId?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty()
  @IsOptional()
  filters?: Record<string, any>;
} 