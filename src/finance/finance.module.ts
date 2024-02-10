import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentsService } from './providers/payments.service';
import { StripeService } from './providers/stripe.service';
import { Payment, PaymentSchema } from './schemas/payment.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema }
    ])
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    StripeService
  ],
  exports: [PaymentsService]
})
export class FinanceModule {}
