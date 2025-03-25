import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationType, NotificationStatus } from '../schemas/notification.schema';
import { PusherService } from './pusher.service';
import { Event } from '../../events/schemas/event.schema';
import { Payment } from '../../finance/schemas/payment.schema';
import { GradeLevel } from '../../progress/schemas/progress.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    private pusherService: PusherService
  ) {}

  async create(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    metadata?: any,
    options: {
      link?: string;
      image?: string;
      isUrgent?: boolean;
      expiresAt?: Date;
    } = {}
  ): Promise<Notification> {
    const notification = new this.notificationModel({
      userId,
      title,
      message,
      type,
      metadata,
      ...options
    });

    await notification.save();

    // Envoyer la notification en temps réel via Pusher
    await this.pusherService.trigger(
      `private-user-${userId}`,
      'new-notification',
      notification
    );

    return notification;
  }

  async markAsRead(userId: string, notificationId: string): Promise<Notification> {
    const notification = await this.notificationModel.findOneAndUpdate(
      {
        _id: notificationId,
        userId
      },
      {
        status: NotificationStatus.READ
      },
      { new: true }
    );

    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      {
        userId,
        status: NotificationStatus.UNREAD
      },
      {
        status: NotificationStatus.READ
      }
    );
  }

  async getUserNotifications(
    userId: string,
    status?: NotificationStatus,
    limit = 20,
    offset = 0
  ): Promise<{ notifications: Notification[]; total: number }> {
    const query = { userId };
    if (status) {
      query['status'] = status;
    }

    const [notifications, total] = await Promise.all([
      this.notificationModel.find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments(query)
    ]);

    return { notifications, total };
  }

  async sendEventRegistrationNotification(userId: string, event: Event): Promise<void> {
    await this.create(
      userId,
      'Event Registration Confirmed',
      `You have successfully registered for ${event.title}`,
      NotificationType.EVENT,
      { eventId: event._id },
      {
        link: `/events/${event._id}`,
        image: event.image
      }
    );
  }

  async sendPaymentNotification(userId: string, payment: Payment): Promise<void> {
    await this.create(
      userId,
      'Payment Processed',
      `Your payment of ${payment.amount} ${payment.currency} has been processed`,
      NotificationType.PAYMENT,
      { paymentId: payment._id },
      {
        link: `/payments/${payment._id}`,
        isUrgent: payment.status === 'failed'
      }
    );
  }

  async deleteOldNotifications(daysOld: number = 30): Promise<void> {
    const date = new Date();
    date.setDate(date.getDate() - daysOld);

    await this.notificationModel.deleteMany({
      createdAt: { $lt: date },
      status: NotificationStatus.READ
    });
  }

  async sendGradePromotionNotification(
    userId: string,
    grade: GradeLevel
  ): Promise<void> {
    await this.create(
      userId,
      'Grade Promotion',
      `Congratulations! You have been promoted to ${grade} level.`,
      NotificationType.GRADE,
      { grade },
      { isUrgent: true }
    );
  }
} 