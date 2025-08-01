import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: RedisClientType;

  async onModuleInit() {
    if (!this.client) {
      this.client = createClient({ url: 'redis://localhost:6379' });
      this.client.on('error', (err) => console.error('Redis Error:', err));
      await this.client.connect();
      console.log('✅ Redis connected');
    }
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

  // LPUSH: 리스트 왼쪽에 데이터 삽입
  async lpush(key: string, value: string) {
    return this.client.lPush(key, value);
  }

  // RPOP: 리스트 오른쪽에서 데이터 하나 꺼내기, 그리고 삭제
  async rpop(key: string) {
    return this.client.rPop(key);
  }

  // LLEN: 리스트 길이 조회
  async llen(key: string) {
    return this.client.lLen(key);
  }

  // List Range
  async lrange(key: string, start: number, stop: number) {
    return this.client.lRange(key, start, stop);
  }

  async del(key: string) {
    return this.client.del(key);
  }

  // 특정 Set(key)에 저장된 모든 멤버(값)을 조회하는 메서드
  async smembers(key: string): Promise<string[]> {
    return this.client.sMembers(key);
  }

  async sadd(key: string, member: string) {
    return this.client.sAdd(key, member);
  }

  // set 자료구조 : 지정한 멤버를 삭제, 중복이 없으므로 해당 멤버만 바로 제거
  async srem(key: string, member: string): Promise<number> {
    return await this.client.sRem(key, member);
  }

  async lrem(key: string, count: number, value: string): Promise<number> {
    return this.client.lRem(key, count, value);
  }
}
