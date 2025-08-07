import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaService } from './kafka.service';
import { KafkaRetryService } from '../src/retry/kafka-retry.service';
import { RedisService } from '@libs/redis';
import { RetryQueueService } from './retry/retry-queue.service';
import { RetryWorker } from './retry/retry-worker.service';
import { RetryConsumerController } from './retry/retry-consumer.controller';
@Module({
  providers: [
    KafkaService,
    KafkaRetryService,
    RedisService,
    RetryQueueService,
    RetryWorker,
  ],
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'ticketing-client',
            brokers: ['localhost:10001', 'localhost:10002', 'localhost:10003'],
          },
          consumer: {
            groupId: 'ticketing-consumer-group', // 서비스마다 override 가능
            allowAutoTopicCreation: false,
          },
        },
      },
    ]),
  ],
  controllers: [RetryConsumerController],
  exports: [ClientsModule, KafkaService, KafkaRetryService, RetryQueueService],
})
export class KafkaModule {}
