import { IsMongoId, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentType } from '../../finance/schemas/payment.schema';

export class EnrollmentPaymentDto {
  @ApiProperty({ description: 'School ID where student is enrolling' })
  @IsMongoId()
  @IsNotEmpty()
  schoolId: string;

  @ApiProperty({ description: 'Classes to enroll in (optional)', required: false })
  @IsMongoId({ each: true })
  @IsOptional()
  classes?: string[];

  @ApiProperty({ description: 'Payment type', enum: PaymentType, default: PaymentType.COURSE })
  @IsEnum(PaymentType)
  @IsOptional()
  paymentType?: PaymentType = PaymentType.COURSE;
} 