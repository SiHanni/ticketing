import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { randomUUID } from 'crypto';

const SEAT_LOCK_EXPIRE_SECONDS = 180;

@Injectable()
export class SeatLockService {
  private readonly logger = new Logger(SeatLockService.name);

  constructor(@InjectRedis() private readonly redis: Redis) {}

  async tryLock(seatId: string): Promise<string | null> {
    const lockKey = `seat:locked:${seatId}`;
    const ttl = await this.redis.ttl(lockKey);
    this.logger.debug(`🔐 락 설정됨: ${lockKey}, TTL=${ttl}s`);
    const lockId = randomUUID();

    const result = await this.redis.eval(
      `
      if redis.call("SETNX", KEYS[1], ARGV[1]) == 1 then
        redis.call("EXPIRE", KEYS[1], ARGV[2])
        return ARGV[1]
      else
        return nil
      end
    `,
      1,
      lockKey,
      lockId,
      SEAT_LOCK_EXPIRE_SECONDS,
    );

    return result ? lockId : null;
  }

  async unlock(seatId: string, lockId: string): Promise<boolean> {
    const lockKey = `seat:locked:${seatId}`;
    const currentLockId = await this.redis.get(lockKey);

    if (currentLockId === lockId) {
      await this.redis.del(lockKey);
      return true;
    }

    this.logger.warn(`Unlock failed: lockId mismatch`);
    return false;
  }
}
