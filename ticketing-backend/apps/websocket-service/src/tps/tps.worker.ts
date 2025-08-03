import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QueueService } from '../queue/queue.service';
import { RedisService } from '@libs/redis';
import {
  TPS_LIMIT,
  ACTIVE_TTL,
  BUCKET_CAPACITY,
  INTERVAL_MS,
  ACTIVE_EVENTS_KEY,
} from '../constants';
import { QueueGateway } from '../gateway/queue.gateway';

@Injectable()
// Token Bucket 알고리즘 기반
export class TpsWorker implements OnModuleInit {
  private readonly logger = new Logger(TpsWorker.name);
  private tokens = 0;

  constructor(
    private readonly queueService: QueueService,
    private readonly redisService: RedisService,
    private readonly gateway: QueueGateway,
  ) {}

  async onModuleInit() {
    this.logger.log('✅ TpsWorker 초기화 완료');
    // 1초마다 토큰을 리필 (최대 BUCKET_CAPACITY까지)
    setInterval(() => {
      this.tokens = Math.min(this.tokens + TPS_LIMIT, BUCKET_CAPACITY);
      this.logger.debug(`토큰 리필됨. 현재 토큰 수: ${this.tokens}`);
    }, 1000);

    setInterval(async () => {
      if (this.tokens <= 0) return;

      const eventIds = await this.redisService.smembers(ACTIVE_EVENTS_KEY);
      if (!eventIds || eventIds.length === 0) return;
      // 활성 이벤트를 순회하면서 토큰이 남아있을 때만 입장 처리
      for (const eventId of eventIds) {
        if (this.tokens <= 0) break;

        const eid = Number(eventId);
        if (isNaN(eid)) continue;

        const users: { userId: number; eventId: number }[] = [];

        for (let i = 0; i < TPS_LIMIT && this.tokens > 0; i++) {
          const user = await this.queueService.dequeue(eid);
          if (user) {
            users.push(user);
            this.tokens--; // ✅ 실제로 dequeue 성공 시에만 토큰 차감
          }
        }

        if (users.length > 0) {
          await Promise.all(
            users.map(async (u) => {
              await this.allowUser(u.userId, eid);
              this.gateway.sendActiveSignal(u.userId, eid);
            }),
          );
          this.logger.log(`✅ [Event ${eid}] ${users.length}명 활성화됨`);
        }
      }
    }, 300); // 0.3초 단위로 순환 처리
  }

  private async allowUser(userId: number, eventId: number) {
    const key = `user:${eventId}:${userId}:status`;
    await this.redisService.set(key, 'active', ACTIVE_TTL); // (key, 'active', TTL(s))
  }
}
