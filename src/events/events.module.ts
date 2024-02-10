import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsController } from './controllers/events.controller';
import { EventsService } from './providers/events.service';
import { EventRegistrationService } from './providers/event-registration.service';
import { EventResultsService } from './providers/event-results.service';
import { Event, EventSchema } from './schemas/event.schema';
import { FinanceModule } from '../finance/finance.module';
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema }
    ]),
    FinanceModule,
    NotificationsModule
  ],
  controllers: [EventsController],
  providers: [
    EventsService,
    EventRegistrationService,
    EventResultsService
  ],
  exports: [EventsService]
})
export class EventsModule {} 