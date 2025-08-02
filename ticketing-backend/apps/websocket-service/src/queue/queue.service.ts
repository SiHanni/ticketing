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

  /** 대기열 추가 (timestamp를 score로) */
  async enqueue(user: QueueUser): Promise<number> {
    const key = this.getQueueKey(user.eventId);
    const score = Date.now();
    await this.redisService.zadd(key, score, String(user.userId));
    return (await this.getPosition(user.userId, user.eventId)) + 1;
  }

  /** 큐에서 추출 (가장 오래 기다린 사용자) */
  async dequeue(eventId: number): Promise<QueueUser | null> {
    const key = this.getQueueKey(eventId);
    const [userId] = await this.redisService.zpopmin(key);
    return userId ? { userId: Number(userId), eventId } : null;
  }

  /** 대기열 길이 */
  async getQueueLength(eventId: number): Promise<number> {
    return this.redisService.zcard(this.getQueueKey(eventId));
  }

  /** 특정 유저 제거 */
  async removeUser(userId: number, eventId: number): Promise<void> {
    await this.redisService.zrem(this.getQueueKey(eventId), String(userId));
  }

  /** 유저 순번 조회 */
  async getPosition(userId: number, eventId: number): Promise<number> {
    const rank = await this.redisService.zrank(
      this.getQueueKey(eventId),
      String(userId),
    );
    return rank !== null ? rank : -1;
  }
}
