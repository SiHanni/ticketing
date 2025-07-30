import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { RedisService } from '@libs/redis';

@Module({
  providers: [QueueService, RedisService],
  exports: [QueueService],
})
export class QueueModule {}
