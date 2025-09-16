# RedisService

NestJS에서 Redis 기능을 활용하기 위한 서비스 클래스입니다.  
다음 메서드들을 포함하고 있으며, Redis의 key-value 저장 및 Pub/Sub 기능을 제공합니다.

---

## 📦 메서드 설명

### 🟩 `onModuleInit(): Promise<void>`

- NestJS의 **라이프사이클 훅 인터페이스인 `OnModuleInit`**을 구현한 메서드입니다.
- 이 메서드는 NestJS가 해당 서비스를 **인스턴스화하고 의존성을 모두 주입한 직후 자동으로 호출됩니다.**
- 내부에서 Redis 클라이언트를 생성하고 `redis://localhost:16380`에 연결합니다.

---

### 🟩 `get(key: string): Promise<string | null>`

- 주어진 key에 해당하는 값을 Redis에서 조회합니다
- 값이 없으면 `null`을 반환합니다

---

### 🟩 `set(key: string, value: string, ttlInSeconds?: number): Promise<void>`

- key-value 데이터를 Redis에 저장합니다
- `ttlInSeconds`가 주어지면 해당 key에 TTL(Time-To-Live)을 설정하여 지정 시간(초) 후 자동 만료되도록 합니다

---

### 🟩 `publish(channel: string, message: string): Promise<number>`

- Redis Pub/Sub 시스템에서 지정한 채널로 메시지를 발행(publish)합니다
- 이 채널을 구독 중인 클라이언트들에게 메시지가 전송됩니다
- 반환값은 메시지를 받은 구독자 수입니다

---

### 🟩 `subscribe(channel: string, callback: (message: string) => void): Promise<void>`

- Redis Pub/Sub 시스템에서 지정한 채널을 구독(subscribe)합니다
- 해당 채널로 메시지가 도착하면 전달된 콜백 함수가 실행됩니다
- `this.client.duplicate()`을 사용하여 **Pub/Sub 전용의 독립된 Redis 연결**을 생성하여 사용합니다
- 이는 Redis의 제약 사항(한 클라이언트가 Pub/Sub에 진입하면 일반 명령어 사용 불가)을 회피하기 위한 구조입니다

#### 📌 왜 `duplicate()`이 필요한가?

Redis는 하나의 연결에서 `subscribe()`를 호출하면 그 클라이언트는 **Pub/Sub 전용 모드**로 진입합니다.

이 상태에서는 `get`, `set`, `del` 등의 일반 명령어를 더 이상 사용할 수 없습니다.

따라서 **Pub/Sub 처리 전용의 별도 Redis 연결이 필요하며**,  
이를 위해 `duplicate()`으로 새로운 클라이언트를 생성합니다.

duplicate()는 Redis에서 **Pub/Sub과 일반 명령어(get/set 등)**을 분리된 연결에서 동시에 사용하기 위해 필요하기 때문인데, Redis는 한 클라이언트가 subscribe()를 호출하면 Pub/Sub 전용 모드로 들어가고 이때 get, set, publish 등의 명령어를 사용하지 못하므로 별도의 클라이언트를 생성하는 것입니다.

---

## Redis 설정 변경 (notify-keyspace-events)

notify-keyspace-events는 Redis의 Pub/Sub 기반 Keyspace Notification을 활성화하는 설정입니다.

Ex는 다음을 의미합니다:

E: Keyevent notifications (이벤트 기반, expired 등)

x: 만료 이벤트 (expired)를 구독

Keyspace Notifications가 동작하려면 Redis 설정에서 다음 항목이 필요합니다

```
notify-keyspace-events Ex

```

로컬 redis에서는

```
redis-cli config set notify-keyspace-events Ex
```

배포 시에는 새로 도커 컴포즈 작성을 하는 것이 좋아보입니다.

빌드

pnpm run build:libs
