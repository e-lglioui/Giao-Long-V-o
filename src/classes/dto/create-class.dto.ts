import { IsString, IsMongoId, IsDate, IsEnum, IsOptional, IsNumber, IsArray, Min, Matches } from "class-validator"
import { Type } from "class-transformer"
import { ApiProperty } from "@nestjs/swagger"
import { ClassStatus } from "../schemas/class.schema"

export class CreateClassDto {
  @ApiProperty({ description: "School ID where the class will be held" })
  @IsMongoId()
  schoolId: string

  @ApiProperty({ description: "Course ID associated with this class" })
  @IsMongoId()
  courseId: string

  @ApiProperty({ description: "Instructor ID who will teach the class" })
  @IsMongoId()
  instructorId: string

  @ApiProperty({ description: "Title of the class" })
  @IsString()
  title: string

  @ApiProperty({ description: "Description of the class", required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ description: "Date when the class will be held" })
  @IsDate()
  @Type(() => Date)
  date: Date

  @ApiProperty({ description: "Start time of the class in 24-hour format (HH:MM)" })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Start time must be in 24-hour format (HH:MM)" })
  startTime: string

  @ApiProperty({ description: "End time of the class in 24-hour format (HH:MM)" })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "End time must be in 24-hour format (HH:MM)" })
  endTime: string

  @ApiProperty({ description: "Status of the class", enum: ClassStatus, required: false })
  @IsEnum(ClassStatus)
  @IsOptional()
  status?: ClassStatus

  @ApiProperty({ description: "Maximum number of students allowed in the class", required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxCapacity?: number

  @ApiProperty({ description: "Skill level required for the class", required: false })
  @IsString()
  @IsOptional()
  level?: string

  @ApiProperty({ description: "List of requirements for the class", required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requirements?: string[]
}

