import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QueueService } from '../queue/queue.service';
import { RedisService } from '@libs/redis';
import {
  TPS_LIMIT,
  ACTIVE_TTL,
  BUCKET_CAPACITY,
  INTERVAL_MS,
} from '../constants';

@Injectable()
// Token Bucket 알고리즘 기반
export class TpsWorker implements OnModuleInit {
  private readonly logger = new Logger(TpsWorker.name);
  private tokens = 0;

  constructor(
    private readonly queueService: QueueService,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    // 1초마다 토큰을 리필 (최대 BUCKET_CAPACITY까지)
    setInterval(() => {
      this.tokens = Math.min(this.tokens + TPS_LIMIT, BUCKET_CAPACITY);
      this.logger.debug(`토큰 리필됨. 현재 토큰 수: ${this.tokens}`);
    }, INTERVAL_MS);

    // 300ms마다 토큰이 있으면 사용자 활성화 처리
    setInterval(async () => {
      if (this.tokens <= 0) return;

      const eventIds = await this.redisService.smembers('activeEvents');
      if (!eventIds || eventIds.length === 0) return;

      // 활성 이벤트를 순회하면서 토큰이 남아있을 때만 입장 처리
      for (const eventId of eventIds) {
        if (this.tokens <= 0) break;

        const eid = Number(eventId);
        if (isNaN(eid)) continue;

        // 토큰 사용 (1명 처리)
        const user = await this.queueService.dequeue(eid);
        if (user) {
          await this.allowUser(user.userId, eid);
          this.tokens--;
          this.logger.log(
            `✅ [Event ${eid}] User ${user.userId} 활성화 (남은 토큰: ${this.tokens})`,
          );
        }
      }
    }, 300); // 0.3초 단위로 순환 처리
  }

  private async allowUser(userId: number, eventId: number) {
    const key = `user:${eventId}:${userId}:status`;
    await this.redisService.set(key, 'active', 10); // TTL 10초 예시
  }
}
