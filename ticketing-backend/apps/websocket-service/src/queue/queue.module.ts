import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { RedisService } from '@libs/redis';
import { QueueGateway } from '../gateway/queue.gateway';

@Module({
  providers: [QueueService, RedisService, QueueGateway],
  exports: [QueueService, QueueGateway],
})
export class QueueModule {}
