import { Module } from '@nestjs/common';
import { EventServiceController } from './event-service.controller';
import { EventServiceService } from './event-service.service';

@Module({
  imports: [],
  controllers: [EventServiceController],
  providers: [EventServiceService],
})
export class EventServiceModule {}
