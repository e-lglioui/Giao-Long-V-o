import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '../schemas/event.schema';

@Injectable()
export class EventResultsService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>
  ) {}

  async updateParticipantResults(
    eventId: string,
    userId: string,
    results: any
  ): Promise<Event> {
    const event = await this.eventModel.findById(eventId);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const participant = event.participants.find(
      p => p.user.toString() === userId
    );

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    participant.results = results;
    return event.save();
  }

  async getEventResults(eventId: string): Promise<any> {
    const event = await this.eventModel.findById(eventId)
      .populate('participants.user', 'firstName lastName')
      .exec();

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event.participants.map(participant => ({
      user: participant.user,
      results: participant.results,
      role: participant.role
    }));
  }

  async generateCertificates(eventId: string): Promise<void> {
    // Logique pour générer les certificats
  }
} 