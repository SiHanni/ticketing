import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QueueService } from '../queue/queue.service';
import { RedisService } from '@libs/redis';
import { TPS_LIMIT, ACTIVE_TTL } from '../constants';

@Injectable()
export class TpsWorker implements OnModuleInit {
  private readonly logger = new Logger(TpsWorker.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    // 5초마다 TPS_LIMIT명씩 입장 처리 (서버 스펙에따라 조정 가능)
    setInterval(async () => {
      const eventIds = await this.redisService.smembers('activeEvents');
      if (!eventIds || eventIds.length === 0) return;

      for (const eventId of eventIds) {
        if (isNaN(Number(eventId))) continue;

        for (let i = 0; i < TPS_LIMIT; i++) {
          const user = await this.queueService.dequeue(Number(eventId));

          if (user) {
            await this.allowUser(user.userId);
            this.logger.log(
              `✅ [Event ${eventId}] User ${user.userId} allowed to reserve`,
            );
          }
        }
      }
    }, 5000);
  }

  private async allowUser(userId: number) {
    const key = `user:${userId}:status`;
    await this.redisService.set(key, 'active', ACTIVE_TTL);
  }
}
