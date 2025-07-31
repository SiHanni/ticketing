# TPS Worker

## 📌 목적

TPS Worker는 **대기열(Queue)에 쌓여 있는 사용자들을 일정한 속도(TPS)로 예약 서비스로 입장**시켜주는 역할을 합니다.

### 왜 필요한가?

- 티켓 오픈 시 수만 명이 동시에 접속 → API 서버 과부하
- 모든 사용자가 동시에 예약 시도 → DB 락 경쟁, 장애 발생
- TPS Worker는 **대기열에서 일정량씩만 꺼내 입장**시켜 안정적인 트래픽 처리를 보장

---

## ⚙️ 동작 방식

1. 사용자가 WebSocket으로 접속 → 대기열(`queue:reservation:{eventId}`)에 등록
2. 해당 `eventId`는 Redis `activeEvents` Set에 기록
3. TPS Worker가 3초마다 `activeEvents`를 조회
4. 각 이벤트별로 `TPS_LIMIT` 명씩 dequeue
5. dequeue된 유저는 `user:{userId}:status = active` 키를 발급받아 예약 가능 상태로 변경
6. TTL(`ACTIVE_TTL`) 내에 예약하지 않으면 키 만료 → 대기열 다음 사용자에게 기회 제공

---

## 🔑 주요 Redis 키

| 키                            | 타입   | 설명                               |
| ----------------------------- | ------ | ---------------------------------- |
| `activeEvents`                | Set    | 대기열이 존재하는 이벤트 ID 리스트 |
| `queue:reservation:{eventId}` | List   | 해당 이벤트의 대기열 FIFO 큐       |
| `user:{userId}:status`        | String | 활성화 상태 (`active`) TTL 적용    |

---

## 🛠 향후 확장 포인트

- 이벤트별 다른 TPS_LIMIT 설정
- TPS 동적 변경 (운영 중 실시간 조정)
- Kafka 기반으로 TPS Worker 분산 처리

---

## 💡 결론

TPS Worker는 **대기열 → 예약 API 진입까지의 트래픽을 제어하는 핵심 모듈**입니다.  
이를 통해 시스템 안정성을 높이고, 선착순 정책을 공정하게 유지할 수 있습니다.
