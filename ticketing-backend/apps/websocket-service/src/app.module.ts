import { Module } from '@nestjs/common';
import { QueueModule } from './queue/queue.module';
import { QueueGateway } from './gateway/queue.gateway';
import { TpsModule } from './tps/tps.module';

@Module({
  imports: [QueueModule, TpsModule],
  providers: [QueueGateway],
})
export class AppModule {}
