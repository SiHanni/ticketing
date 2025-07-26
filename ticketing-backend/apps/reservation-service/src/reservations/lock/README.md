# 🎟️ 좌석 락 처리 모듈 (Seat Lock Service)

이 디렉터리는 예약 시스템에서 **좌석 선점**을 위한 락 처리 로직을 담당합니다.

---

## ✅ 왜 락이 필요한가?

티켓팅 시스템에서는 여러 사용자가 **동시에 같은 좌석을 예약하려는 상황**이 발생할 수 있습니다.  
이런 경쟁 상태(Race Condition)를 방지하기 위해, **좌석을 선점한 사용자가 있는 경우 다른 사용자가 접근하지 못하도록 락 처리**가 필요합니다.

---

## 🛠️ 현재 사용 중인 방식: Redis + Lua 스크립트

NestJS 기반 예약 서비스에서는 **단일 Redis 인스턴스 환경**을 고려하여 **Lua 스크립트를 통한 락 처리 방식**을 사용합니다.

### ✨ Lua 스크립트 방식의 장점

- Redis 내에서 **원자적(atomic)** 으로 실행됨
- 빠르고 간단하며, 외부 패키지나 분산 환경 설정이 불필요
- 단일 Redis 환경에서도 안정적인 락 구현 가능

---

## 🔁 동작 방식 요약

`seat-lock.service.ts`에서 다음과 같은 흐름으로 동작합니다:

### 1. `tryLock(seatId)`

- Redis Lua 스크립트를 통해 `seat:locked:{seatId}` 키를 `SETNX + EXPIRE` 방식으로 설정
- 해당 키가 이미 존재하면 **락 획득 실패**

### 2. `unlock(seatId, lockId)`

- 락 해제 시, lockId를 비교하여 **자신이 획득한 락만 해제 가능**하도록 안전성 보장

---

## 🔄 Redlock vs Lua 방식 비교

| 항목              | Redlock 방식                       | Lua 스크립트 방식                       |
| ----------------- | ---------------------------------- | --------------------------------------- |
| Redis 인스턴스 수 | 3개 이상 클러스터 필요 (Quorum)    | 단일 인스턴스 사용 가능                 |
| 복잡도            | 비교적 복잡, 네트워크 지연 민감    | 단순하고 성능 우수                      |
| 신뢰성            | 장애에 강함 (Quorum 기반)          | 단일 Redis 장애 시 취약                 |
| 적합한 환경       | 대규모 분산 시스템, 멀티 리전 운영 | 로컬 개발, 단일 서버 또는 소규모 시스템 |

---

## 🤔 현재 Lua 스크립트를 선택한 이유

- 현재 시스템은 **Redis 단일 인스턴스**로 운영 중입니다.
- Redlock은 **다수 Redis 노드가 필요**하고 설정이 복잡하며, 현재 시스템 규모에 과합니다.
- Lua는 **간단하고 고성능이며, 단일 Redis 환경에 적합**합니다.

향후 트래픽이 증가하거나 Redis 클러스터를 구성하게 될 경우, Redlock 방식으로 전환할 수 있습니다.

---

## 📁 구성 파일

| 파일명                 | 설명                                    |
| ---------------------- | --------------------------------------- |
| `seat-lock.service.ts` | Lua 스크립트를 사용한 좌석 락 처리 로직 |
| `README.md`            | 현재 문서, 설계 및 선택 이유 정리       |

---

## 🔮 향후 계획

- 트래픽 테스트 결과 및 인프라 구성 변경에 따라 **Redis 클러스터 도입 + Redlock 전환 고려**

## 명령어 정리

SETNX (SET if Not Exists)

- 문법: SETNX key value

- 역할: key가 없을 때만 값을 설정함

결과:

- key가 없어서 성공적으로 설정하면 1

- key가 이미 있으면 아무 것도 하지 않고 0

SET with NX option

- 문법: SET key value NX EX 60

- 역할: NX = key가 없을 때만 set (SETNX와 동일한 조건)

- 추가 기능: EX나 PX 옵션으로 TTL 설정 가능

결과:

- 성공 시 "OK"

- 실패 시 nil

```
if redis.call("SETNX", KEYS[1], ARGV[1]) == 1 then
          redis.call("EXPIRE", KEYS[1], ARGV[2])
          return ARGV[1]
        else
          return nil
        end
        `,
        1,
        `seat:locked:${lockKey}`,
        lockId,
        ttl,
```

- 좌석 락을 잡으려고 시도 : 이미 다른 사용자가 잡고 있는 경우 실패, 락을 잡았다면 TTL과 함께 설정
- eval() : EVAL 명령으로 Lua 스크립트를 실행할 수 있음
- KEYS[1] 에 매핑된 값 : seat:locked:${lockKey}
- ARGV[1] 에 매핑된 값 : lockId (랜덤 UUID) ( ARGV : ARGument Vector )
- ARGV[1] 에 매핑된 값 : ttl (초 단위 TTL)
- if redis.call("SETNX", KEYS[1], ARGV[1]) == 1 then : SETNX는 key가 없으면 값을 ARGV[1]로 설정 후 1을 반환
- 이미 key가 있으면 아무것도 안 하고 0을 반환
- 즉, 다른 사용자가 먼저 락을 걸지 않았다면 락을 획득 가능
- redis.call("EXPIRE", KEYS[1], ARGV[2]) : 락을 잡았다면 TTL을 설정한다.
