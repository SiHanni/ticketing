### event-activation.worker 의 역할

- event 서버가 실행될 때 onModuleInit으로 같이 실행됨
- 5초에 한번 현재 활성화된 공연, 이벤트 정보를 redis에 갱신 시킴
- 예약, 대기열 시스템에서 유저가 예약 또는 대기열 입장에 사용되어짐
