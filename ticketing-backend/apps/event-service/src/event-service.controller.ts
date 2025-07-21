import { Controller, Get } from '@nestjs/common';
import { EventServiceService } from './event-service.service';

@Controller()
export class EventServiceController {
  constructor(private readonly eventServiceService: EventServiceService) {}

  @Get()
  getHello(): string {
    return this.eventServiceService.getHello();
  }
}
