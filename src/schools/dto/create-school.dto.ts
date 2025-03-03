import { IsString, IsOptional, IsArray, IsNumber, IsObject, ValidateNested } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"

export class ScheduleDto {
  @ApiProperty()
  @IsString()
  openingTime: string

  @ApiProperty()
  @IsString()
  closingTime: string

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  operatingDays?: string[]
}

export class CreateSchoolDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  contactNumber?: string

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  images?: string[]

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  maxStudents?: number

  @ApiProperty({ required: false, type: ScheduleDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ScheduleDto)
  @IsOptional()
  schedule?: ScheduleDto

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  instructors?: string[]
}

