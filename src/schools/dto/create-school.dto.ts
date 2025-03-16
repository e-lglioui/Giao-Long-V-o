import { IsString, IsOptional, IsArray, IsNumber, IsObject, ValidateNested, Min, Max } from "class-validator"
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

// Enhance the LocationDto to better support map functionality
export class LocationDto {
  @ApiProperty({ required: true, description: "Latitude coordinate", example: 48.8566 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number

  @ApiProperty({ required: true, description: "Longitude coordinate", example: 2.3522 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number

  @ApiProperty({ required: false, description: "Address description" })
  @IsString()
  @IsOptional()
  address?: string
}

export class CreateSchoolDto {
  @ApiProperty({ required: true })
  @IsString()
  name: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string

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

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  instructors?: string[]

  @ApiProperty({ required: false, type: LocationDto })
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  location?: LocationDto
}

