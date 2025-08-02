import { io } from 'socket.io-client';
import axios from 'axios';
import { createClient } from 'redis';

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const redisClient = createClient({ url: 'redis://localhost:6379' });
redisClient.on('error', (err) => console.error('Redis Error:', err));

(async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('✅ Redis connected (Test Script)');
  }
})();

/**
 * 1) WebSocket 접속 → 대기열 등록
 */
export async function connectWebSocket(this: any, context: any) {
  const { userId, eventId } = context.vars;

  return new Promise((resolve) => {
    const socket = io('ws://localhost:3006', {
      query: { userId, eventId },
      transports: ['websocket'],
      timeout: 5000,
    });

    socket.on('open', () => {
      console.log(`🔌 [WS 연결 성공] userId=${userId}`);
      resolve(true);
      //setTimeout(() => {
      //  socket.disconnect();
      //  resolve(true);
      //}, 350000);
    });

    socket.on('error', (err) => {
      console.error(`❌ [WS 연결 실패] userId=${userId} (${err.message})`);
      resolve(false);
    });
  });
}

/**
 * 2) Redis에서 active 상태까지 대기
 */
export async function waitForActiveStatus(
  this: any,
  context: any,
  events: any,
  done: any,
) {
  const { userId, eventId } = context.vars;

  return new Promise(async (resolve) => {
    let attempts = 0;
    const maxAttempts = 50; // 최대 10초(0.2초 x 50)

    while (attempts < maxAttempts) {
      const status = await redisClient.get(`user:${eventId}:${userId}:status`);
      if (status === 'active') {
        console.log(`✅ [ACTIVE 감지] userId=${userId}`);
        return resolve(true);
      }
      attempts++;
      await new Promise((res) => setTimeout(res, 200));
    }

    console.warn(`⚠️ [타임아웃] userId=${userId} 활성화 못 받음`);
    resolve(false);
  });
}

/**
 * 3) 예약 요청 API 호출
 */
export async function simulateReservation(
  this: any,
  context: any,
  events: any,
  done: any,
) {
  const { userId, seatId, eventId } = context.vars;

  console.log(`⏳ [대기열 대기 시작] userId=${userId}`);

  // active 상태가 될 때까지 무한 대기
  while (true) {
    try {
      const res = await axios
        .get(`http://localhost:3002/status/${userId}`)
        .catch(() => null);
      if (res?.data?.status === 'active') {
        console.log(`✅ [대기열 통과] userId=${userId} → 예약 요청 진행`);
        break;
      }
    } catch {}
    await wait(1000); // 1초마다 상태 확인
  }

  // active 상태 후 예약 요청
  try {
    const res = await axios.post('http://localhost:3002/reservations', {
      userId,
      seatId,
      eventId,
    });
    console.log(`🎟️ [예약 성공] userId=${userId}, status=${res.status}`);
  } catch (err: any) {
    console.warn(
      `⚠️ [예약 실패] userId=${userId}, status=${err?.response?.status}, msg=${err?.response?.data?.message}`,
    );
  }

  return done();
}

/**
 * 4) 결제 시뮬레이션 (70% 성공)
 */
export async function simulatePayment(
  this: any,
  context: any,
  events: any,
  done: any,
) {
  const { userId } = context.vars;

  if (Math.random() < 0.8) {
    try {
      await axios.post('http://localhost:3005/payments', {
        userId,
        method: 'credit-card',
      });
      console.log(`💰 [결제 성공] userId=${userId}`);
    } catch {
      console.warn(`⚠️ [결제 요청 실패] userId=${userId}`);
    }
  } else {
    console.log(`🚫 [결제 스킵] userId=${userId}`);
  }

  return done();
}
