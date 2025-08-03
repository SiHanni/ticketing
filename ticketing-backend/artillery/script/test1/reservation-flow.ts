import { io } from 'socket.io-client';
import axios from 'axios';

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function ticketingFullCycle(
  this: any,
  context: any,
  events: any,
  done: any,
) {
  const { userId, seatId, eventId } = context.vars;

  let socket: any;
  let reservationId: number | null = null;

  return new Promise((resolve) => {
    socket = io('ws://localhost:3006', {
      query: { userId, eventId },
      transports: ['websocket'],
      timeout: 10000,
    });

    socket.on('connect', () => {
      //console.log(`🔌 [WS 연결 성공] userId=${userId}`);
    });

    // ✅ 입장 허용(active) 수신 시 예약 요청
    socket.on('user-active', async () => {
      console.log(`✅ [ACTIVE] userId=${userId} → 예약 요청 시작`);

      try {
        // 예약 요청
        const res = await axios.post('http://localhost:3002/reservations', {
          userId,
          seatId,
          eventId,
        });
        reservationId = res.data.reservationId;
        console.log(
          `🎟️ [예약 성공] userId=${userId}, reservationId=${reservationId}`,
        );
      } catch (err: any) {
        console.warn(
          `⚠️ [예약 요청 실패] userId=${userId}`,
          err?.response?.data,
        );
        socket.disconnect();
        return resolve(false);
      }

      // ✅ Kafka를 통한 결제/확정 대기 (최대 10초 대기)
      let attempts = 0;
      const maxAttempts = 10;
      while (attempts < maxAttempts && reservationId) {
        const confirmCheck = await axios
          .get(`http://localhost:3002/reservations/${reservationId}`)
          .catch(() => null);
        if (confirmCheck?.data?.status === 'Confirmed') {
          console.log(`✅ [Confirmed 상태 확인] userId=${userId}`);
          break;
        }
        attempts++;
        await wait(1000);
      }

      socket.disconnect();
      resolve(true);

      // HTTP 테스트 용
      //// ✅ 90% 확률로 결제 시도
      //if (Math.random() < 0.9 && reservationId) {
      //  try {
      //    const payRes = await axios.post('http://localhost:3005/payments', {
      //      userId,
      //      reservationId,
      //      name: userId + 'name',
      //      paymentMethod: 'CARD',
      //    });
      //    console.log(
      //      `💰 [결제 성공] userId=${userId}, status=${payRes.status}`,
      //    );
      //
      //    // Confirmed 상태 검증
      //    await wait(1000);
      //    const confirmCheck = await axios
      //      .get(`http://localhost:3002/reservations/${reservationId}`)
      //      .catch(() => null);
      //    if (confirmCheck?.data?.status === 'Confirmed') {
      //      console.log(`✅ [Confirmed 상태 확인] userId=${userId}`);
      //    } else {
      //      console.warn(`⚠️ [Confirmed 상태 미반영] userId=${userId}`);
      //    }
      //  } catch (err) {
      //    console.warn(`⚠️ [결제 요청 실패] userId=${userId}`);
      //  }
      //} else if (reservationId) {
      //  console.log(`🚫 [결제 스킵 or 실패 예정] userId=${userId}`);
      //  // TTL 만료 확인 (예약 좌석 회수 확인)
      //  await wait(10000);
      //  const ttlCheck = await axios
      //    .get(`http://localhost:3002/reservations/${reservationId}`)
      //    .catch(() => null);
      //  if (!ttlCheck || ttlCheck.data?.status !== 'Confirmed') {
      //    console.log(`♻️ [좌석 회수 완료 확인] userId=${userId}`);
      //  } else {
      //    console.warn(`⚠️ [좌석 회수 실패] userId=${userId}`);
      //  }
      //}
      //
      //socket.disconnect();
      //resolve(true);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [WS 연결 종료] userId=${userId}`);
    });

    socket.on('error', (err) => {
      console.error(`❌ [WS 오류] userId=${userId}`, err.message);
      resolve(false);
    });
  });
}
