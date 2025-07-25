import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: RedisClientType;

  async onModuleInit() {
    this.client = createClient({
      url: 'redis://localhost:6379',
    });
    await this.client.connect();
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlInSeconds?: number) {
    await this.client.set(key, value);
    if (ttlInSeconds) {
      await this.client.expire(key, ttlInSeconds); // TTL이 주어졌다면 해당 key에 유효시간 설정
    }
  }

  async publish(channel: string, message: string) {
    await this.client.publish(channel, message);
  }

  async subscribe(channel: string, callback: (message: string) => void) {
    const subscriber = this.client.duplicate(); // 독립된 Redis 연결 생성 (Pub/Sub 전용)
    await subscriber.connect();
    await subscriber.subscribe(channel, (message: any) => callback(message));
  }
}
