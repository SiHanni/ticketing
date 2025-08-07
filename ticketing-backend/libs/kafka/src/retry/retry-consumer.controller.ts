import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  KafkaContext,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { RetryQueueService } from './retry-queue.service';
import {
  RETRY_DELAYS_MS,
  RETRY_HEADER_KEY,
  RETRY_PAID_TOPICS,
  RETRY_REQUESTED_TOPICS,
  RETRY_TOPICS,
} from './retry.constants';

const ALL_RETRY_TOPICS = [...RETRY_REQUESTED_TOPICS, ...RETRY_PAID_TOPICS];

@Controller()
export class RetryConsumerController {
  private readonly logger = new Logger(RetryConsumerController.name);

  constructor(private readonly retryQueueService: RetryQueueService) {}

  // 예약 요청, 결제 관련 재처리 토픽 전부 처리
  @MessagePattern(ALL_RETRY_TOPICS)
  async handleRetryTopic(
    @Payload() payload: any,
    @Ctx() context: KafkaContext,
  ) {
    const topic = context.getTopic();
    const headers = context.getMessage().headers ?? {};

    const retryIndex =
      RETRY_REQUESTED_TOPICS.indexOf(topic) !== -1
        ? RETRY_REQUESTED_TOPICS.indexOf(topic)
        : RETRY_PAID_TOPICS.indexOf(topic);

    if (retryIndex === -1) {
      this.logger.error(`처리 불가능한 retry 토픽: ${topic}`);
      return;
    }

    let originalTopic: string;
    if (RETRY_REQUESTED_TOPICS.includes(topic)) {
      originalTopic = 'reservation.requested';
    } else if (RETRY_PAID_TOPICS.includes(topic)) {
      originalTopic = 'reservation.paid';
    } else {
      throw new Error(`❌ 알 수 없는 retry topic: ${topic}`);
    }

    const delayMs = RETRY_DELAYS_MS[retryIndex];

    this.logger.warn(
      `[RetryConsumer] ${topic} 메시지 → ${delayMs}ms 후 ${originalTopic}으로 재시도 예약`,
    );

    await this.retryQueueService.enqueueRetry(
      delayMs,
      originalTopic,
      payload,
      headers,
    );
  }
}
