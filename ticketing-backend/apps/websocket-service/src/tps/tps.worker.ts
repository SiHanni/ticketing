import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QueueService } from '../queue/queue.service';
import { RedisService } from '@libs/redis';

const TPS_LIMIT = 5; // 초당 입장 허용 인원 (테스트용)
const ACTIVE_TTL = 300; // 입장 후 5분간 유효

@Injectable()
export class TpsWorker implements OnModuleInit {
  private readonly logger = new Logger(TpsWorker.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    // 1초마다 TPS_LIMIT명씩 입장 처리
    setInterval(async () => {
      const eventId = 3; // 특정 이벤트 기준 (추후 멀티 이벤트 지원)
      for (let i = 0; i < TPS_LIMIT; i++) {
        const user = await this.queueService.dequeue(eventId);
        if (user) {
          await this.allowUser(user.userId);
          this.logger.log(`✅ User ${user.userId} allowed to reserve`);
        }
      }
    }, 1000);
  }

  private async allowUser(userId: number) {
    await this.redisService.set(`user:${userId}:status`, 'active', ACTIVE_TTL);
  }
}
