import { PartialType } from '@nestjs/swagger';
import { CreateProgressDto } from './create-progress.dto';
import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GradeLevel } from '../schemas/progress.schema';

export class UpdateProgressDto extends PartialType(CreateProgressDto) {
  @ApiProperty({ enum: GradeLevel })
  @IsOptional()
  @IsEnum(GradeLevel)
  currentGrade?: GradeLevel;

  @ApiProperty({ enum: GradeLevel })
  @IsOptional()
  @IsEnum(GradeLevel)
  targetGrade?: GradeLevel;

  @ApiProperty()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ExamResultDto {
  @ApiProperty({ enum: GradeLevel })
  @IsEnum(GradeLevel)
  grade: GradeLevel;

  @ApiProperty()
  @IsString()
  examiner: string;

  @ApiProperty({ enum: ['pass', 'fail'] })
  @IsEnum(['pass', 'fail'])
  result: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SkillEvaluationDto {
  @ApiProperty()
  @IsString()
  skill: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNumber()
  level: number;

  @ApiProperty()
  @IsString()
  evaluatedBy: string;
} 