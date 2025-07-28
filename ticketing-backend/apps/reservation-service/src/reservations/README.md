### reservation-expiration.listener 설명

```
@Injectable()
export class ReservationExpirationListener implements OnModuleInit {
  private readonly logger = new Logger(ReservationExpirationListener.name);

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly reservationService: ReservationService,
  ) {}

  async onModuleInit() {
    const subscriber = this.redis.duplicate();

    // 🔧 이벤트 수신을 위해 notify-keyspace-events 설정 (Ex = Expired events)
    await this.redis.config('SET', 'notify-keyspace-events', 'Ex');

    // 🔧 만료 이벤트 구독
    await subscriber.psubscribe('__keyevent@0__:expired');
    // 🔔 만료 이벤트 핸들러
    subscriber.on('pmessage', (_pattern, _channel, message) => {
      if (!message.startsWith('reservation:ttl:')) return;

      const reservationId = message.replace('reservation:ttl:', '');
      this.logger.warn(`⏰ 예약 만료 감지: ${reservationId}`);

      // ❗ async 콜백 사용 시 void 처리로 경고 제거
      void this.reservationService.expireReservation(+reservationId);
    });
  }
}
```

1. onModuleInit()

- NestJS 라이프 사이클 훅으로, 애플리케이션 부팅 시 자동 호출

2. redis.duplicated()

- Pub/Sub 전용 클라이언트를 별도로 생성
- (Redis 클라이언트는 한 인스턴스에서 명령어와 Pub/Sub를 동시에 수행하면 충돌이 발생할 수 있음)

3. await this.redis.config('SET', 'notify-keyspace-events', 'Ex');

- Redis에 notify-keyspace-events 설정을 변경하는 명령
- Redis가 어떤 이벤트에 대해 Pub/Sub 알림을 보낼지 결정함.
- E : Keyevent 알림을 보냄 (이벤트 발생 시점 기준)
- x : 만료된 키(expired)
- 즉, 특정 키가 만료되었을 때 "**keyevent@0**:expired" 채널로 메시지가 발행

4. await subscriber.psubscribe('**keyevent@0**:expired');

- psubscribe는 Redis의 패턴 기반 구독 명령어입니다.
- "**keyevent@0**:expired"는 DB 인덱스 0번에서 발생한 만료 이벤트를 의미함
- 이걸 구독하면 TTL 로 만료된 키들의 이름이 메시지로 날아오게 됨.

5. subscriber.on('pmessage', (\_pattern, \_channel, message) => {

- Redis Pub/Sub 구독 시, 메시지가 오면 이 핸들러가 호출
- pmessage는 psubscribe로 구독한 패턴에 대한 이벤트
- \_pattern: 패턴 문자열 ('**keyevent@0**:expired')
- \_channel: 실제 발행된 채널 (동일하게 '**keyevent@0**:expired')
- message: 만료된 키의 이름

6. reservationId만 추출 후 + 를 통해 문자열을 숫자로 바꾸어, expireReservation 메서드를 호출

**notify-keyspace-events**

- notify-keyspace-events는 여러 알파벳으로 조합된 문자열이고, 어떤 이벤트를 보낼지를 제어한다
- K Keyspace 이벤트 (키 이름 기준, 예: **keyspace@0**:mykey)
- E Keyevent 이벤트 (이벤트 이름 기준, 예: **keyevent@0**:expired) ✅
- g generic command (del, expire 등)
- x expired (TTL로 인해 만료됨) ✅
- e evicted (메모리 부족으로 제거됨)
- A All (모든 이벤트를 켬)

****keyevent@0**:expired는 Redis의 이벤트 채널명**

```
__keyevent@<DB번호>__:<이벤트명>
```
