import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './providers/notifications.service';
import { NotificationsController } from './controllers/notifications.controller';
import { PusherService } from './providers/pusher.service';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema }
    ])
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, PusherService],
  exports: [NotificationsService]
})
export class NotificationsModule {} 