import { Controller, Get } from '@nestjs/common';
import { WebsocketServiceService } from './websocket-service.service';

@Controller()
export class WebsocketServiceController {
  constructor(private readonly websocketServiceService: WebsocketServiceService) {}

  @Get()
  getHello(): string {
    return this.websocketServiceService.getHello();
  }
}
