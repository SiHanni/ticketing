import { Injectable } from '@nestjs/common';
import { RedisService } from '@libs/redis';
import { KAFKA_RETRY_QUEUE_KEY } from './retry.constants';

@Injectable()
export class RetryQueueService {
  private readonly queueKey = KAFKA_RETRY_QUEUE_KEY;

  constructor(private readonly redisService: RedisService) {}

  /**
   * 지연 큐에 retry 메시지를 등록 (ZSET)
   * @param delayMs 지연 시간(ms)
   * @param topic 재전송할 토픽
   * @param payload Kafka 메시지 본문
   * @param headers Kafka 헤더 (retry-count 등)
   */
  async enqueueRetry(
    delayMs: number,
    topic: string,
    payload: any,
    headers: Record<string, any>,
  ) {
    const runAt = Date.now() + delayMs;

    const data = JSON.stringify({
      topic,
      payload,
      headers,
    });

    await this.redisService.zadd(this.queueKey, runAt, data);
  }
}
