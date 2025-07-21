import { Module } from '@nestjs/common';
import { WebsocketServiceController } from './websocket-service.controller';
import { WebsocketServiceService } from './websocket-service.service';

@Module({
  imports: [],
  controllers: [WebsocketServiceController],
  providers: [WebsocketServiceService],
})
export class WebsocketServiceModule {}
