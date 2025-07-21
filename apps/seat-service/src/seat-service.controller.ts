import { Controller, Get } from '@nestjs/common';
import { SeatServiceService } from './seat-service.service';

@Controller()
export class SeatServiceController {
  constructor(private readonly seatServiceService: SeatServiceService) {}

  @Get()
  getHello(): string {
    return this.seatServiceService.getHello();
  }
}
