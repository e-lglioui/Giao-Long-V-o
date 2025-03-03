import { IsMongoId, IsArray } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class EnrollStudentDto {
  @ApiProperty({ description: "Student ID to enroll in the class" })
  @IsMongoId()
  studentId: string
}

export class EnrollMultipleStudentsDto {
  @ApiProperty({ description: "Array of student IDs to enroll in the class" })
  @IsArray()
  @IsMongoId({ each: true })
  studentIds: string[]
}

