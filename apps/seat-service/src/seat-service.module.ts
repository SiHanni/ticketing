import { Module } from '@nestjs/common';
import { SeatServiceController } from './seat-service.controller';
import { SeatServiceService } from './seat-service.service';

@Module({
  imports: [],
  controllers: [SeatServiceController],
  providers: [SeatServiceService],
})
export class SeatServiceModule {}
