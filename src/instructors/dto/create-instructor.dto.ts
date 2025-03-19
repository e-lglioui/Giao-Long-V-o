import { IsString, IsEmail, IsOptional, IsArray, ValidateNested, IsNumber, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"

export class CertificationDto {
  @ApiProperty({ required: true })
  @IsString()
  name: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  issuingOrganization?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  issueDate?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  expiryDate?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  certificateFile?: string
}

export class CreateInstructorDto {
  @ApiProperty({ required: true })
  @IsString()
  firstName: string

  @ApiProperty({ required: true })
  @IsString()
  lastName: string

  @ApiProperty({ required: true })
  @IsEmail()
  email: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bio?: string

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  specialties?: string[]

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  yearsOfExperience?: number

  @ApiProperty({ required: false, type: [CertificationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificationDto)
  @IsOptional()
  certifications?: CertificationDto[]

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  sportsPassport?: string

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  profileImages?: string[]
}

