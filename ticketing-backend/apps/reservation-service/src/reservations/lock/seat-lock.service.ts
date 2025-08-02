import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { randomUUID } from 'crypto';
import { SEAT_LOCK_PREFIX } from '../constants';

const SEAT_LOCK_EXPIRE_SECONDS = 180;

@Injectable()
export class SeatLockService {
  private readonly logger = new Logger(SeatLockService.name);

  constructor(@InjectRedis() private readonly redis: Redis) {}

  async tryLock(
    lockKey: string,
    ttl = SEAT_LOCK_EXPIRE_SECONDS,
  ): Promise<string | null> {
    const lockId = randomUUID();

    try {
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
        `${SEAT_LOCK_PREFIX}:${lockKey}`,
        lockId,
        ttl,
      );
      this.logger.debug(`🔍 tryLock result:`, result); // 이거 추가!!

      if (result) {
        this.logger.log(
          `✅ 좌석 락 획득: ${SEAT_LOCK_PREFIX}:${lockKey} | TTL: ${ttl}s`,
        );
        return lockId;
      }

      return null;
    } catch (err) {
      this.logger.error(`🚨 락 시도 실패: ${err}`);
      return null;
    }
  }

  async unlock(lockKey: string, lockId: string): Promise<boolean> {
    try {
      const result = await this.redis.eval(
        `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
          return redis.call("DEL", KEYS[1])
        else
          return 0
        end
        `,
        1,
        `${SEAT_LOCK_PREFIX}:${lockKey}`,
        lockId,
      );
      console.log('RERE', result);
      return result === 1;
    } catch (err) {
      this.logger.error(`🚨 락 해제 실패: ${err}`);
      return false;
    }
  }
}
