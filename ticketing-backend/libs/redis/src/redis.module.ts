import { Module, Global } from '@nestjs/common';
import { RedisModule as IORedisModule } from '@nestjs-modules/ioredis';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [
    IORedisModule.forRoot({
      type: 'single',
      url: 'redis://localhost:16380',
    }),
  ],
  providers: [RedisService],
  exports: [IORedisModule, RedisService],
})
export class RedisModule {}
