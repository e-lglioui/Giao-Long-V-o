import { IsString, IsEmail, IsOptional, IsArray, ValidateNested, IsNumber, Min, IsNotEmpty, MinLength } from "class-validator"
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
  @IsNotEmpty()
  @IsString()
  username: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string

  @IsNotEmpty()
  @IsString()
  firstName: string

  @IsNotEmpty()
  @IsString()
  lastName: string

  @IsOptional()
  @IsString()
  rank?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[]

  @IsOptional()
  @IsString()
  biography?: string

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

