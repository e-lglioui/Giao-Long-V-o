import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  RawBodyRequest
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from '../providers/payments.service';
import { StripeService } from '../providers/stripe.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly stripeService: StripeService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create payment intent' })
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @Req() req: any
  ) {
    return this.paymentsService.createPayment(createPaymentDto, req.user);
  }

  @Post('webhook')
  async handleWebhook(@Req() req: RawBodyRequest<any>) {
    const signature = req.headers['stripe-signature'];
    const event = await this.stripeService.constructEventFromPayload(
      req.rawBody,
      signature
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.paymentsService.confirmPayment(event.data.object.id);
        break;
      // Gérer d'autres événements Stripe si nécessaire
    }

    return { received: true };
  }

  @Get()
  @Roles(Role.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get all payments' })
  async findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by id' })
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get payments by user' })
  async findByUser(@Param('userId') userId: string) {
    return this.paymentsService.findByUser(userId);
  }

  @Post(':id/refund')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Refund payment' })
  async refundPayment(
    @Param('id') id: string,
    @Body('reason') reason?: string
  ) {
    return this.paymentsService.refundPayment(id, reason);
  }
} 