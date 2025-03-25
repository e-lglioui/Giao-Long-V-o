import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentsService } from './providers/payments.service';
import { StripeService } from './providers/stripe.service';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { UserModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema }
    ]),
    UserModule
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    StripeService
  ],
  exports: [PaymentsService]
})
export class FinanceModule {}
