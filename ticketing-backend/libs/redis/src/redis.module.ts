import { Module, Global } from '@nestjs/common';
import { RedisModule as IORedisModule } from '@nestjs-modules/ioredis';

@Global()
@Module({
  imports: [
    IORedisModule.forRoot({
      type: 'single',
      url: 'redis://localhost:6379',
    }),
  ],
  exports: [IORedisModule],
})
export class RedisModule {}
