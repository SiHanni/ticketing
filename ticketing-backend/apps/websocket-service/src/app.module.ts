import { Module } from '@nestjs/common';
import { QueueModule } from './queue/queue.module';
import { TpsModule } from './tps/tps.module';

@Module({
  imports: [QueueModule, TpsModule],
})
export class AppModule {}
