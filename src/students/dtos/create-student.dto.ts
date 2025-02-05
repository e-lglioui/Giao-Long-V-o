import { IsString, IsDate, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty()
  @IsDate()
  dateOfBirth: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  class: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  courses?: string[];
} 