import { createClient } from 'redis';

const redis = createClient({ url: 'redis://localhost:6379' });

const EVENT_ID = '6'; // 테스트할 공연 ID
const QUEUE_KEY = `queue:reservation:${EVENT_ID}`;
const ACTIVE_PATTERN = `user:${EVENT_ID}:*:status`; // 이벤트별 활성 유저

async function monitor() {
  await redis.connect();
  console.log('✅ Redis 모니터링 시작');

  setInterval(async () => {
    try {
      // ✅ ZSET 길이 조회는 ZCARD
      const queueLength = await redis.zCard(QUEUE_KEY);

      // ✅ 활성 유저 상태 키 조회
      const activeKeys = await redis.keys(ACTIVE_PATTERN);
      const activeCount = activeKeys.length;

      console.log(`[모니터링] Queue=${queueLength} / Active=${activeCount}`);
    } catch (err) {
      console.error('Redis 모니터링 오류:', err.message);
    }
  }, 2000);
}

monitor().catch(console.error);

// 실행: ts-node script/test1/redis-monitoring.ts
