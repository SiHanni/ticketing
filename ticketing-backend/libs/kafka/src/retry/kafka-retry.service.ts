import { Injectable } from '@nestjs/common';
import { KafkaService } from '../kafka.service';
import {
  MAX_RETRY_COUNT,
  RETRY_TOPICS,
  DLQ_TOPIC,
  ORIGINAL_RESERVATION_REQUESTED_TOPIC,
  RETRY_REQUESTED_TOPICS,
  ORIGINAL_RESERVATION_PAID_TOPIC,
  RETRY_PAID_TOPICS,
} from './retry.constants';
import { getRetryCount, createHeadersWithRetryCount } from './retry.utils';

@Injectable()
export class KafkaRetryService {
  constructor(private readonly kafkaService: KafkaService) {}

  /**
   * 서비스에서 kafka 메세지 소비 실패 케이스에서 호출
   * 1~3회차 까진 재시도 토픽으로 produce
   * 재시도 3회 초과시 DLQ 토픽으로 produce
   */
  async retryOrDlq(
    originalTopic: string,
    payload: Record<string, any>,
    headers: Record<string, any> = {},
    error?: any,
  ) {
    const currentRetryCount = getRetryCount(headers);
    const nextRetryCount = currentRetryCount + 1;

    if (nextRetryCount > MAX_RETRY_COUNT) {
      const dlqPayload = {
        originalTopic,
        payload,
        retryCount: currentRetryCount,
        error: error?.message || 'Unknown error',
        stack: error?.stack || null,
        timestamp: new Date().toISOString(),
      };
      await this.kafkaService.produce(DLQ_TOPIC, dlqPayload);
      return;
    }

    let retryTopics: string[];

    if (originalTopic === ORIGINAL_RESERVATION_REQUESTED_TOPIC) {
      retryTopics = RETRY_REQUESTED_TOPICS;
    } else if (originalTopic === ORIGINAL_RESERVATION_PAID_TOPIC) {
      retryTopics = RETRY_PAID_TOPICS;
    } else {
      throw new Error(
        `❌ retryOrDlq: 알 수 없는 originalTopic: ${originalTopic}`,
      );
    }

    const retryTopic = retryTopics[currentRetryCount];

    await this.kafkaService.produceWithHeaders(
      retryTopic,
      payload,
      createHeadersWithRetryCount(nextRetryCount),
    );
  }
}
