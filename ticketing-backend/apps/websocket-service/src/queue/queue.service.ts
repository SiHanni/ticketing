import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@libs/redis';
import { QueueUser } from './queue.interface';
import { QUEUE_RESERVATION_PREFIX } from '../constants';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(private readonly redisService: RedisService) {}

  private getQueueKey(eventId: number) {
    return `${QUEUE_RESERVATION_PREFIX}:${eventId}`;
  }

  // 유저를 대기열에 추가
  async enqueue(user: QueueUser): Promise<number> {
    const key = this.getQueueKey(user.eventId);
    await this.redisService.lpush(key, JSON.stringify(user));
    const position = await this.redisService.llen(key);
    this.logger.debug(
      `User ${user.userId} 가 이벤트: ${user.eventId} 대기열에 추가됨`,
    );
    return position;
  }

  // TPS 워커가 큐에서 유저를 추출
  async dequeue(eventId: number): Promise<QueueUser | null> {
    const key = this.getQueueKey(eventId);
    const data = await this.redisService.rpop(key);
    return data ? JSON.parse(data) : null;
  }

  // 현재 대기열 길이 조회
  async getQueueLength(eventId: number): Promise<number> {
    const key = this.getQueueKey(eventId);
    return this.redisService.llen(key);
  }

  async removeUser(userId: number, eventId: number): Promise<void> {
    const key = this.getQueueKey(eventId);
    const queue = await this.redisService.lrange(key, 0, -1);
    const target = queue.find((item) => JSON.parse(item).userId === userId);
    if (target) {
      await this.redisService.lrem(key, 0, target);
      this.logger.debug(`User ${userId} 대기열에서 제거됨`);
    }
  }
}
