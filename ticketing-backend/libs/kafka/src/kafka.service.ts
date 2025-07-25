import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'reservation-service',
      brokers: ['localhost:10001', 'localhost:10002', 'localhost:10003'],
    });

    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    console.log('✅ Kafka Producer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async produce(topic: string, payload: Record<string, any>) {
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(payload) }],
    });
  }
}
