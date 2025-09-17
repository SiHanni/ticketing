// reservation-flow.ts
import { io } from 'socket.io-client';
import axios, { AxiosError } from 'axios';

const WS_URL = process.env.WS_URL || 'ws://localhost:3006';
const API_BASE = process.env.API_BASE || 'http://localhost:3002';

const QUEUE_TIMEOUT_MS = Number(process.env.QUEUE_TIMEOUT_MS || 180000);
const CONFIRM_TIMEOUT_MS = Number(process.env.CONFIRM_TIMEOUT_MS || 20000);
const HARD_SCENARIO_TIMEOUT_MS = Number(
  process.env.HARD_SCENARIO_TIMEOUT_MS || 210000,
); // VU 강제 종료 상한
const CONFIRM_POLL_INTERVAL_MS = 1000;

const TARGET_SEATS = Number(process.env.TARGET_SEATS || 1000);

const globalState = {
  startedPolling: false,
  stopFlag: false,
  lastConfirmedCount: 0,
};

// API: 이벤트별 Confirmed 개수 조회용 엔드포인트
async function fetchConfirmedCount(eventId: number): Promise<number> {
  try {
    const r = await axios.get(
      `${API_BASE}/metrics/reservations/confirmed-count`,
      {
        params: { eventId },
        timeout: 3000,
      },
    );
    return Number(r.data?.count ?? 0);
  } catch (error) {
    return 0;
  }
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

// 실행 중 한 번만 도는 전역 폴러: Confirmed==TARGET_SEATS 되면 stopFlag=true
async function ensureGlobalPoller(eventId: number) {
  if (globalState.startedPolling) return;
  globalState.startedPolling = true;

  (async () => {
    // 1초 간격으로 Confirmed 개수 감시
    while (!globalState.stopFlag) {
      try {
        const c = await fetchConfirmedCount(eventId);
        globalState.lastConfirmedCount = c;
        if (c >= TARGET_SEATS) {
          globalState.stopFlag = true;
          break;
        }
      } catch {
        // ignore
      }
      await sleep(1000);
    }
  })().catch(() => {});
}

// 에러가 400/409 같은 “중복 차단”인지 판단
function isExpectedConflict(err: any): boolean {
  const ax = err as AxiosError<any>;
  const code = ax?.response?.status;
  return code === 400 || code === 409;
}

export async function ticketingFullCycle(this: any, context: any) {
  const { userId, seatId, eventId } = context.vars;
  const eid = Number(eventId);

  // 전역 폴러 기동 (한 번만)
  await ensureGlobalPoller(eid);

  // 좌석 다 찼으면 즉시 종료 → 불필요한 부하/대기 줄이기
  if (globalState.stopFlag) {
    return true; // 정상 종료 취급
  }

  let socket: any;
  let reservationId: number | null = null;
  let finished = false;

  // 시나리오 강제 타임아웃: 어떤 경우든 종료 보장
  const hardTimeout = setTimeout(() => {
    try {
      socket?.disconnect();
    } catch {}
    finished = true;
  }, HARD_SCENARIO_TIMEOUT_MS);

  try {
    // 1) WebSocket 연결
    socket = io(WS_URL, {
      query: { userId, eventId },
      transports: ['websocket'],
      timeout: 10000,
    });

    // 2) active 대기 (QUEUE_TIMEOUT_MS)
    const gotActive: boolean = await new Promise<boolean>((resolve) => {
      let resolved = false;

      const t = setTimeout(() => {
        if (resolved) return;
        resolved = true;
        resolve(false); // 타임아웃 → active 못 받음
      }, QUEUE_TIMEOUT_MS);

      socket.on('user-active', () => {
        if (resolved) return;
        clearTimeout(t);
        resolved = true;
        resolve(true);
      });

      // 연결 오류 시 즉시 종료
      socket.on('error', () => {
        if (resolved) return;
        clearTimeout(t);
        resolved = true;
        resolve(false);
      });

      // 서버가 먼저 끊어도 종료
      socket.on('disconnect', () => {
        if (resolved) return;
        clearTimeout(t);
        resolved = true;
        resolve(false);
      });
    });

    if (!gotActive) {
      try {
        socket.disconnect();
      } catch {}
      return false; // 기회 못 받음(정상)
    }

    // 좌석이 이미 다 찼으면 HTTP 치지 않고 종료(폴링 간 타이밍 보정)
    if (globalState.stopFlag) {
      try {
        socket.disconnect();
      } catch {}
      return true;
    }

    // 3) 예약 시도
    try {
      const res = await axios.post(
        `${API_BASE}/reservations`,
        { userId, seatId, eventId },
        { timeout: 5000 },
      );
      reservationId = res.data?.reservationId ?? null;
      // 성공적으로 예약ID 확보
    } catch (err) {
      if (isExpectedConflict(err)) {
        // 중복/매진으로 정상 차단
        try {
          socket.disconnect();
        } catch {}
        return false;
      }
      // 기타 오류는 실패로 기록
      try {
        socket.disconnect();
      } catch {}
      return false;
    }

    // 4) Confirmed 대기 (최대 CONFIRM_TIMEOUT_MS)
    const started = Date.now();
    while (
      Date.now() - started < CONFIRM_TIMEOUT_MS &&
      reservationId &&
      !globalState.stopFlag
    ) {
      try {
        const r = await axios.get(`${API_BASE}/reservations/${reservationId}`, {
          timeout: 3000,
        });
        if (r.data?.status === 'Confirmed') {
          // 전역 확인 폴러가 집계해서 stopFlag를 올릴 테니 여기서는 바로 종료
          try {
            socket.disconnect();
          } catch {}
          return true;
        }
      } catch {
        // 폴링 실패는 무시하고 계속
      }
      await sleep(CONFIRM_POLL_INTERVAL_MS);
    }

    // Confirmed를 못 받았어도 여기서 종료
    try {
      socket.disconnect();
    } catch {}
    return false;
  } catch {
    try {
      socket?.disconnect();
    } catch {}
    return false;
  } finally {
    clearTimeout(hardTimeout);
  }
}
