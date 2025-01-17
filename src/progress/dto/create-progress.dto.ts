import { IsNotEmpty, IsString, IsEnum, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { GradeLevel } from '../schemas/progress.schema';
export class CreateProgressDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  studentId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiProperty({ enum: GradeLevel })
  @IsEnum(GradeLevel)
  currentGrade: GradeLevel;

  @ApiProperty({ enum: GradeLevel })
  @IsOptional()
  @IsEnum(GradeLevel)
  targetGrade?: GradeLevel;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillEvaluationDto)
  skills?: SkillEvaluationDto[];

  @ApiProperty()
  @IsOptional()
  notes?: string;
}

export class SkillEvaluationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  skill: string;

  @ApiProperty()
  @IsNotEmpty()
  level: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  evaluatedBy: string;
} 