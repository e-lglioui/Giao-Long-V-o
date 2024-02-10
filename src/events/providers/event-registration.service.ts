import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventStatus } from '../schemas/event.schema';
import { PaymentsService } from '../../finance/providers/payments.service';
import { NotificationsService } from '../../notifications/providers/notifications.service';

@Injectable()
export class EventRegistrationService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    private readonly paymentsService: PaymentsService,
    private readonly notificationsService: NotificationsService
  ) {}

  async registerParticipant(eventId: string, userId: string, role: string): Promise<Event> {
    const event = await this.eventModel.findById(eventId)
      .populate('participants.user')
      .exec();

    if (!event) {
      throw new BadRequestException('Event not found');
    }

    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Event is not open for registration');
    }

    if (event.registrationDetails.currentParticipants >= event.registrationDetails.maxParticipants) {
      throw new BadRequestException('Event is full');
    }

    const existingParticipant = event.participants.find(
      p => p.user._id.toString() === userId
    );

    if (existingParticipant) {
      throw new BadRequestException('User already registered');
    }

    const userObjectId = new Types.ObjectId(userId);

    event.participants.push({
      user: userObjectId,
      role,
      registrationDate: new Date(),
      paymentStatus: event.fees ? 'pending' : 'paid',
      attendance: false
    });

    event.registrationDetails.currentParticipants += 1;

    const updatedEvent = await event.save();
    await this.notificationsService.sendEventRegistrationNotification(userId, event);

    return updatedEvent;
  }

  async cancelRegistration(eventId: string, userId: string): Promise<Event> {
    const event = await this.eventModel.findById(eventId)
      .populate('participants.user')
      .exec();

    if (!event) {
      throw new BadRequestException('Event not found');
    }

    const participantIndex = event.participants.findIndex(
      p => p.user._id.toString() === userId
    );

    if (participantIndex === -1) {
      throw new BadRequestException('User not registered for this event');
    }

    event.participants.splice(participantIndex, 1);
    event.registrationDetails.currentParticipants -= 1;

    return event.save();
  }
} 