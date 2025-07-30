import { Module } from '@nestjs/common';
import { TpsWorker } from './tps.worker';
import { QueueModule } from '../queue/queue.module';
import { RedisService } from '@libs/redis';

@Module({
  imports: [QueueModule],
  providers: [TpsWorker, RedisService],
})
export class TpsModule {}
