# 🎟️ 대규모 티켓 예매 시뮬레이션 테스트

본 테스트는 실제 티켓팅 서비스와 유사한 대규모 트래픽 환경을 재현하여
티켓 예약 시스템의 **대기열, 좌석 락, TTL 만료, 결제 성공/실패 플로우**를 검증하기 위한 부하 테스트입니다.

---

## ✅ 테스트 목적

- **공정성 검증**

  - 동일한 좌석에 수십, 수백명의 요청이 몰려도 최초 1명만 예약에 성공하는지 검증

- **TTL 만료 및 좌석 회수 검증**

  - 예약 후 결제하지 않으면 TTL 만료로 Expired 처리되고, 좌석이 다른 유저에게 재할당되는지 확인

- **대기열 동작 검증**

  - WebSocket을 통한 대기열 순번 관리 및 다중 접속 중복 방지 기능 확인

- **결제 성공/실패 처리**

  - 성공 케이스는 Confirmed로 정상 확정되는지
  - 실패(결제 취소/TTL 만료/연결 종료) 케이스가 올바르게 Expired 처리되는지

- **대규모 트래픽 처리 성능 측정**
  - 5만~10만 명이 동시에 접속했을 때 시스템의 안정성과 TPS 처리량 확인

---

## ✅ 테스트 시나리오

1. **정상 예약 케이스**

   - 대기열(WebSocket) → TPS Worker 입장 허용 → `/reservations` → `/payments`
   - 좌석이 Confirmed 상태로 정확히 반영되는지 확인

2. **중복 예약 충돌 케이스**

   - 동일 좌석을 여러 명이 동시에 요청 → 하나만 성공, 나머지는 Conflict 발생

3. **결제 실패 및 TTL 만료 케이스**

   - 일부 유저는 결제 API 호출을 하지 않음 → TTL 만료 후 Expired 처리
   - 좌석 락 해제 → 대기열 다음 유저에게 재할당되는지 확인

4. **브라우저 종료(WebSocket disconnect) 케이스**
   - 대기열에서 연결 종료 시 정상적으로 제거되는지 검증

---

## ✅ 테스트 데이터

- 공연장:
  - 100석 (Event ID: 5)
  - 1000석 (Event ID: 6)
- 유저 데이터: 약 58,000명
- 좌석 데이터: DB에서 자동 조회

---

## ✅ 테스트 구성 파일

- `scripts/load-test/generate-payload.ts`  
  → DB에서 유저·좌석 정보를 읽어 JSON payload 생성

- `scripts/load-test/artillery.yml`  
  → Artillery 부하 테스트 설정 (WebSocket + REST API 호출)

- `scripts/load-test/reservation-flow.ts`  
  → WebSocket 접속 및 결제 성공/실패 비율 제어

---

## ✅ 실행 방법

1. Payload 생성

   ```bash
   ts-node script/test1/generate-payload.ts
   ```

2. 부하 테스트 실행 (cd artillery/script/test1에서 실행)

   ```
   NODE_OPTIONS='-r ts-node/register' \
   npx artillery run artillery.yml --output ../../result.json

   ```

3. 모니터링

- Redis

  ```
  redis-cli KEYS "seat:locked:*"
  redis-cli KEYS "queue:*"
  redis-cli KEYS "user:*:status"

  ```

- DB

  ```
  SELECT status, COUNT(*) FROM reservations GROUP BY status;

  ```
