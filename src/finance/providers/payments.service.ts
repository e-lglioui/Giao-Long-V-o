import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentStatus, PaymentMethod } from '../schemas/payment.schema';
import { StripeService } from './stripe.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { User } from '../../users/schemas/user.schema';
import { UserService } from '../../users/providers/user.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    private stripeService: StripeService,
    private usersService:UserService
  ) {}

  async createPayment(
    createPaymentDto: CreatePaymentDto,
    user: User
  ): Promise<any> {
    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await this.stripeService.createCustomer(
        user.email,
        user.fullName
      );
      stripeCustomerId = customer.id;
      
      // Mettre à jour l'utilisateur avec son Stripe Customer ID
      await this.usersService.update(user.id, { stripeCustomerId });
    }

    const paymentIntent = await this.stripeService.createPaymentIntent(
      createPaymentDto.amount,
      createPaymentDto.currency || 'eur',
      stripeCustomerId,
      {
        paymentType: createPaymentDto.type,
        userId: user.id
      }
    );

    const payment = new this.paymentModel({
      userId: user.id,
      amount: createPaymentDto.amount,
      currency: createPaymentDto.currency || 'eur',
      method: PaymentMethod.STRIPE,
      type: createPaymentDto.type,
      status: PaymentStatus.PENDING,
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId,
      metadata: createPaymentDto.metadata
    });

    await payment.save();
    
    // Return both the payment document and the client secret
    return {
      ...payment.toObject(),
      stripeClientSecret: paymentIntent.client_secret
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<Payment> {
    const payment = await this.paymentModel.findOne({
      stripePaymentIntentId: paymentIntentId
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const paymentIntent = await this.stripeService.confirmPayment(paymentIntentId);
    const charges = await this.stripeService.listCharges(paymentIntentId);
    const charge = charges.data[0];

    payment.status = PaymentStatus.COMPLETED;
    payment.receiptUrl = charge?.receipt_url;
    
    return payment.save();
  }

  async refundPayment(paymentId: string, reason?: string): Promise<Payment> {
    const payment = await this.paymentModel.findById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment cannot be refunded');
    }

    await this.stripeService.refundPayment(payment.stripePaymentIntentId, reason);

    payment.status = PaymentStatus.REFUNDED;
    payment.refundReason = reason;

    return payment.save();
  }

  async findAll(filters: any = {}): Promise<Payment[]> {
    return this.paymentModel.find(filters)
      .populate('userId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentModel.findById(id)
      .populate('userId')
      .exec();

    if (!payment) {
      throw new NotFoundException(`Payment #${id} not found`);
    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
    return payment;
  }

  async findByUser(userId: string): Promise<Payment[]> {
    return this.paymentModel.find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getRevenueStats(
    schoolId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const revenueData = await this.paymentModel.aggregate([
      {
        $match: {
          schoolId,
          status: PaymentStatus.COMPLETED,
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          paymentCounts: { $sum: 1 },
          revenueBySource: {
            $push: {
              type: '$type',
              amount: '$amount'
            }
          },
          monthlyRevenue: {
            $push: {
              date: '$createdAt',
              amount: '$amount'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          paymentCounts: 1,
          revenueBySource: 1,
          monthlyRevenue: 1
        }
      }
    ]);

    const result = revenueData[0] || {
      totalRevenue: 0,
      paymentCounts: 0,
      revenueBySource: [],
      monthlyRevenue: []
    };

    // Traiter les revenus par source
    result.revenueBySource = this.processRevenueBySource(
      result.revenueBySource
    );

    // Traiter les revenus mensuels
    result.monthlyGrowth = this.calculateMonthlyGrowth(
      result.monthlyRevenue
    );

    // Ajouter les cours les plus rentables
    result.topPerformingCourses = await this.getTopPerformingCourses(
      schoolId,
      startDate,
      endDate
    );

    return result;
  }

  private processRevenueBySource(data: any[]): Record<string, number> {
    const revenueBySource = {};
    
    data.forEach(item => {
      revenueBySource[item.type] = (revenueBySource[item.type] || 0) + item.amount;
    });

    return revenueBySource;
  }

  private calculateMonthlyGrowth(data: any[]): any[] {
    const monthlyRevenue = {};

    data.forEach(item => {
      const monthYear = new Date(item.date).toISOString().slice(0, 7);
      monthlyRevenue[monthYear] = (monthlyRevenue[monthYear] || 0) + item.amount;
    });

    const sortedMonths = Object.keys(monthlyRevenue).sort();
    const growth = [];

    for (let i = 1; i < sortedMonths.length; i++) {
      const currentMonth = monthlyRevenue[sortedMonths[i]];
      const previousMonth = monthlyRevenue[sortedMonths[i - 1]];
      const growthRate = ((currentMonth - previousMonth) / previousMonth) * 100;

      growth.push({
        month: sortedMonths[i],
        revenue: currentMonth,
        growthRate: growthRate
      });
    }

    return growth;
  }

  private async getTopPerformingCourses(
    schoolId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    return this.paymentModel.aggregate([
      {
        $match: {
          schoolId,
          status: PaymentStatus.COMPLETED,
          type: 'course',
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: '$metadata.courseId',
          totalRevenue: { $sum: '$amount' },
          studentCount: { $addToSet: '$userId' }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $unwind: '$course'
      },
      {
        $project: {
          courseName: '$course.name',
          totalRevenue: 1,
          studentCount: { $size: '$studentCount' },
          averageRevenuePerStudent: {
            $divide: ['$totalRevenue', { $size: '$studentCount' }]
          }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      },
      {
        $limit: 5
      }
    ]);
  }
} 