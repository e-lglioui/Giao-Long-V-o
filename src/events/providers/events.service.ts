import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventStatus } from '../schemas/event.schema';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { PaymentsService } from '../../finance/providers/payments.service';
import { NotificationsService } from '../../notifications/providers/notifications.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    private readonly paymentsService: PaymentsService,
    private readonly notificationsService: NotificationsService
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const event = new this.eventModel(createEventDto);
    return event.save();
  }

  async findAll(filters: any = {}): Promise<Event[]> {
    return this.eventModel.find(filters)
      .populate('organizingSchool')
      .populate('participants.user')
      .exec();
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventModel.findById(id)
      .populate('organizingSchool')
      .populate('participants.user')
      .exec();

    if (!event) {
      throw new NotFoundException(`Event #${id} not found`);
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .exec();

    if (!event) {
      throw new NotFoundException(`Event #${id} not found`);
    }

    return event;
  }

  async remove(id: string): Promise<void> {
    const result = await this.eventModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Event #${id} not found`);
    }
  }

  async registerParticipant(eventId: string, userId: string, role: string): Promise<Event> {
    const event = await this.findOne(eventId);

    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Event is not open for registration');
    }

    if (event.registrationDetails.currentParticipants >= event.registrationDetails.maxParticipants) {
      throw new BadRequestException('Event is full');
    }

    const existingParticipant = event.participants.find(
      p => p.user.toString() === userId
    );

    if (existingParticipant) {
      throw new BadRequestException('User already registered');
    }

    event.participants.push({
      user: new Types.ObjectId(userId),
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

  async updateParticipantResults(
    eventId: string,
    userId: string,
    results: any
  ): Promise<Event> {
    const event = await this.findOne(eventId);
    const participant = event.participants.find(
      p => p.user.toString() === userId
    );

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    participant.results = results;
    return event.save();
  }

  async getEventStatistics(eventId: string): Promise<any> {
    const event = await this.findOne(eventId);
    const stats = {
      totalParticipants: event.participants.length,
      attendanceRate: 0,
      paymentStatus: {
        paid: 0,
        pending: 0,
        refunded: 0
      },
      roleDistribution: {},
      results: {
        medalsAwarded: 0,
        certificatesIssued: 0
      }
    };

    event.participants.forEach(participant => {
      // Payment stats
      stats.paymentStatus[participant.paymentStatus]++;

      // Role distribution
      stats.roleDistribution[participant.role] = 
        (stats.roleDistribution[participant.role] || 0) + 1;

      // Attendance
      if (participant.attendance) {
        stats.attendanceRate++;
      }

      // Results
      if (participant.results) {
        if (participant.results.medals?.length) {
          stats.results.medalsAwarded += participant.results.medals.length;
        }
        if (participant.results.certificates?.length) {
          stats.results.certificatesIssued += participant.results.certificates.length;
        }
      }
    });

    stats.attendanceRate = (stats.attendanceRate / event.participants.length) * 100;

    return stats;
  }
} 