import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RedisService } from '@libs/redis';
import { KafkaService } from '../kafka.service';
import { KAFKA_RETRY_QUEUE_KEY } from './retry.constants';

@Injectable()
export class RetryWorker implements OnModuleInit {
  private readonly logger = new Logger(RetryWorker.name);
  private readonly queueKey = KAFKA_RETRY_QUEUE_KEY;

  constructor(
    private readonly redisService: RedisService,
    private readonly kafkaService: KafkaService,
  ) {}

  async onModuleInit() {
    setInterval(() => this.processQueue(), 1000); // 1초 주기
  }

  private async processQueue() {
    const now = Date.now();

    const items = await this.redisService.zrangeByScore(this.queueKey, 0, now);

    for (const raw of items) {
      try {
        const { topic, payload, headers } = JSON.parse(raw);

        await this.kafkaService.produceWithHeaders(topic, payload, headers);
        await this.redisService.zrem(this.queueKey, raw);

        this.logger.log(`✅ 재전송 완료: ${topic}`);
      } catch (err) {
        this.logger.error('❌ 재전송 실패:', err);
      }
    }
  }
}
