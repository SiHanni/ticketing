import { forwardRef, Module } from '@nestjs/common';
import { TpsWorker } from './tps.worker';
import { QueueModule } from '../queue/queue.module';
import { RedisService } from '@libs/redis';

@Module({
  imports: [forwardRef(() => QueueModule)], // ✅ 순환 참조 방지
  providers: [TpsWorker, RedisService],
})
export class TpsModule {}
