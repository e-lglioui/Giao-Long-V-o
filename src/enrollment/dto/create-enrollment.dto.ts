import { IsMongoId, IsEnum, IsOptional, IsArray, IsDate, IsObject } from "class-validator"
import { Type } from "class-transformer"
import { ApiProperty } from "@nestjs/swagger"
import { EnrollmentStatus } from "../schemas/enrollment.schema"

export class CreateEnrollmentDto {
  @ApiProperty({ description: "Student ID to enroll" })
  @IsMongoId()
  studentId: string

  @ApiProperty({ description: "School ID where student is enrolling" })
  @IsMongoId()
  schoolId: string

  @ApiProperty({ description: "Classes to enroll in", required: false })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  classes?: string[]

  @ApiProperty({ description: "Enrollment date", required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  enrollmentDate?: Date

  @ApiProperty({ description: "Enrollment status", enum: EnrollmentStatus, required: false })
  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus

  @ApiProperty({ description: "Payment details", required: false })
  @IsObject()
  @IsOptional()
  paymentDetails?: Record<string, any>

  @ApiProperty({ description: "Notes about the enrollment", required: false })
  @IsArray()
  @IsOptional()
  notes?: string[]
}

