# 🎟️ Ticketing System

## 🧾 0. 개요

> **목표**: 고성능의 티켓팅 시스템을 설계하고 구현하여 실시간 대규모 트래픽을 안정적으로 처리하는 구조 경험하기  
> **활용 기술**: NestJS, Kafka, Redis, Docker, MySQL, Kubernetes, AWS

👉 상세 설명: [티켓팅 시스템 개요](https://sihanni.tistory.com/166)

---

## 🧩 1. 시스템 설계

### 아키텍처 구성

- **Frontend**: React 기반 예약 페이지
- **Backend (Monorepo)**:
  - `user-service`: 회원 가입 / 로그인
  - `ticket-service`: 공연 티켓 생성 / 상세 조회
  - `reservation-service`: 티켓 예약 및 취소 로직
- **Infra 구성 요소**:
  - **Redis**: 대기열 관리 및 세션 관리
  - **Kafka**: 예약 이벤트 비동기 처리
  - **MySQL**: 정형화된 데이터 저장 (RDS)
  - **Kubernetes**: MSA 환경 배포
  - **AWS**: 전체 클라우드 인프라 구성

👉 상세 설명: [티켓팅 시스템 설계](https://sihanni.tistory.com/167)

---

## 🗃️ 2. DB 설계

### 주요 테이블

- `users` (회원)
- `tickets` (공연 티켓)
- `reservations` (예약 내역)
- `reservation_logs` (예약 시도 로그)
- `admins` (관리자 - 티켓 등록 가능)

### 설계 고려사항

- 정합성 보장을 위한 트랜잭션 처리
- 동시성 제어를 위한 **락(lock)** 기반 예약 처리
- 예약 시 `status` 플래그를 통한 상태 관리
- 인덱스를 활용한 고속 조회 (특히 `tickets`, `reservations`)

👉 상세 설명: [DB 스키마 설계](https://sihanni.tistory.com/168)

---

## 📌 기술 요약

| 기술 스택        | 내용                                               |
| ---------------- | -------------------------------------------------- |
| **Backend**      | NestJS, TypeScript, Kafka, Redis, MySQL            |
| **Infra**        | Docker, Kubernetes, AWS (ECS, RDS, ECR, ALB)       |
| **DevOps**       | GitHub Actions, E2E 테스트, Unit 테스트            |
| **Database**     | 정규화, 트랜잭션, 인덱싱 전략 설계                 |
| **Architecture** | Kafka 기반 이벤트 기반 아키텍처, Redis 대기열 관리 |

---

## ✅ 목표

- 대기열 시스템 구현 (Redis)
- 동시 예약 처리 로직 (트랜잭션 & 락)
- Kafka 기반 MSA 설계
- 실제 클라우드 환경에서의 무중단 배포 경험
- 실시간 부하 테스트 (Artillery, k6 등)

---

## 📚 참고

- [티켓팅 시스템 개요](https://sihanni.tistory.com/166)
- [티켓팅 시스템 설계](https://sihanni.tistory.com/167)
- [DB 설계 정리](https://sihanni.tistory.com/168)

---
