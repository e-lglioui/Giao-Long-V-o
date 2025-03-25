import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Pusher from 'pusher';
import { BatchEvent } from 'pusher';

@Injectable()
export class PusherService {
  private pusher: Pusher;

  constructor(private configService: ConfigService) {
    this.pusher = new Pusher({
      appId: this.configService.get('PUSHER_APP_ID'),
      key: this.configService.get('PUSHER_KEY'),
      secret: this.configService.get('PUSHER_SECRET'),
      cluster: this.configService.get('PUSHER_CLUSTER'),
      useTLS: true
    });
  }

  async trigger(
    channel: string,
    event: string,
    data: any
  ): Promise<boolean> {
    try {
      await this.pusher.trigger(channel, event, data);
      return true;
    } catch (error) {
      console.error('Pusher error:', error);
      return false;
    }
  }

  async triggerBatch(
    events: Array<{
      channel: string;
      event: string;
      data: any;
    }>
  ): Promise<boolean> {
    try {
      const batchEvents: BatchEvent[] = events.map(event => ({
        channel: event.channel,
        name: event.event,
        data: event.data
      }));
      
      await this.pusher.triggerBatch(batchEvents);
      return true;
    } catch (error) {
      console.error('Pusher batch error:', error);
      return false;
    }
  }

  async authenticateUser(socketId: string, userData: any): Promise<any> {
    try {
      return await this.pusher.authenticateUser(socketId, userData);
    } catch (error) {
      console.error('Pusher user authentication error:', error);
      throw error;
    }
  }

  async authorizeChannel(
    socketId: string, 
    channel: string, 
    presenceData?: any
  ): Promise<any> {
    try {
      return await this.pusher.authorizeChannel(socketId, channel, presenceData);
    } catch (error) {
      console.error('Pusher channel authorization error:', error);
      throw error;
    }
  }
} 