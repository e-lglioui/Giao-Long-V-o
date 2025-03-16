import { IsString, IsDate, IsNotEmpty, IsArray, IsOptional, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
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

  @ApiProperty({ type: String, format: 'date-time' }) // Swagger format
  @IsNotEmpty()
  @Type(() => Date) // Transforme en instance de Date
  @IsDate()
  dateOfBirth: Date;

  @ApiProperty()
  @IsMongoId() // Validation pour ObjectId
  @IsNotEmpty()
  school: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  class: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  @IsString({ each: true }) // Chaque élément doit être une chaîne
  courses?: string[];
}
