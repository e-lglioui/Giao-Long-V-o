import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16' as Stripe.LatestApiVersion
    });
  }

  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.create({
        email,
        name
      });
    } catch (error) {
      throw new InternalServerErrorException('Error creating Stripe customer');
    }
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    customerId: string,
    metadata: Record<string, any>
  ): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe utilise les centimes
        currency,
        customer: customerId,
        metadata,
        payment_method_types: ['card'],
        setup_future_usage: 'off_session'
      });
    } catch (error) {
      throw new InternalServerErrorException('Error creating payment intent');
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);
      const charges = await this.stripe.charges.list({
        payment_intent: paymentIntentId
      });
      
      return {
        ...paymentIntent,
        charges: charges
      } as Stripe.PaymentIntent;
    } catch (error) {
      throw new InternalServerErrorException('Error confirming payment');
    }
  }

  async refundPayment(
    paymentIntentId: string,
    reason?: string
  ): Promise<Stripe.Refund> {
    try {
      return await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        reason: reason as Stripe.RefundCreateParams.Reason
      });
    } catch (error) {
      throw new InternalServerErrorException('Error processing refund');
    }
  }

  async createSetupIntent(customerId: string): Promise<Stripe.SetupIntent> {
    try {
      return await this.stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card']
      });
    } catch (error) {
      throw new InternalServerErrorException('Error creating setup intent');
    }
  }

  async listPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const methods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      });
      return methods.data;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching payment methods');
    }
  }

  async constructEventFromPayload(
    payload: string,
    signature: string
  ): Promise<Stripe.Event> {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.configService.get('STRIPE_WEBHOOK_SECRET')
      );
    } catch (error) {
      throw new InternalServerErrorException('Error constructing Stripe event');
    }
  }

  async listCharges(paymentIntentId: string): Promise<Stripe.Response<Stripe.ApiList<Stripe.Charge>>> {
    return this.stripe.charges.list({
      payment_intent: paymentIntentId
    });
  }
} 