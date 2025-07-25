## 에러일지

```
ERROR in ../../node_modules/@nestjs/microservices/client/client-grpc.js 32:104-128
Module not found: Error: Can't resolve '@grpc/grpc-js' in '/Users/sihwanlee/node_modules/@nestjs/microservices/client'
 @ ../../node_modules/@nestjs/microservices/client/index.js 5:21-45
 @ ../../node_modules/@nestjs/microservices/index.js 11:21-40
 @ ./apps/reservation-service/src/main.ts 7:24-56

ERROR in ../../node_modules/@nestjs/microservices/client/client-grpc.js 34:14-43
Module not found: Error: Can't resolve '@grpc/proto-loader' in '/Users/sihwanlee/node_modules/@nestjs/microservices/client'
 @ ../../node_modules/@nestjs/microservices/client/index.js 5:21-45
 @ ../../node_modules/@nestjs/microservices/index.js 11:21-40
 @ ./apps/reservation-service/src/main.ts 7:24-56

ERROR in ../../node_modules/@nestjs/microservices/client/client-mqtt.js 30:90-105
Module not found: Error: Can't resolve 'mqtt' in '/Users/sihwanlee/node_modules/@nestjs/microservices/client'
 @ ../../node_modules/@nestjs/microservices/client/index.js 7:21-45
 @ ../../node_modules/@nestjs/microservices/index.js 11:21-40
 @ ./apps/reservation-service/src/main.ts 7:24-56

ERROR in ../../node_modules/@nestjs/microservices/client/client-nats.js 25:90-105
Module not found: Error: Can't resolve 'nats' in '/Users/sihwanlee/node_modules/@nestjs/microservices/client'
 @ ../../node_modules/@nestjs/microservices/client/index.js 8:21-45
 @ ../../node_modules/@nestjs/microservices/index.js 11:21-40
 @ ./apps/reservation-service/src/main.ts 7:24-56

ERROR in ../../node_modules/@nestjs/microservices/client/client-rmq.js 36:78-96
Module not found: Error: Can't resolve 'amqplib' in '/Users/sihwanlee/node_modules/@nestjs/microservices/client'
 @ ../../node_modules/@nestjs/microservices/client/index.js 13:21-44
 @ ../../node_modules/@nestjs/microservices/index.js 11:21-40
 @ ./apps/reservation-service/src/main.ts 7:24-56

ERROR in ../../node_modules/@nestjs/microservices/client/client-rmq.js 37:107-141
Module not found: Error: Can't resolve 'amqp-connection-manager' in '/Users/sihwanlee/node_modules/@nestjs/microservices/client'
 @ ../../node_modules/@nestjs/microservices/client/index.js 13:21-44
 @ ../../node_modules/@nestjs/microservices/index.js 11:21-40
 @ ./apps/reservation-service/src/main.ts 7:24-56

ERROR in ../../node_modules/@nestjs/microservices/deserializers/nats-request-json.deserializer.js 13:107-122
Module not found: Error: Can't resolve 'nats' in '/Users/sihwanlee/node_modules/@nestjs/microservices/deserializers'
 @ ../../node_modules/@nestjs/microservices/server/server-nats.js 8:41-99
 @ ../../node_modules/@nestjs/microservices/server/index.js 8:21-45
 @ ../../node_modules/@nestjs/microservices/index.js 22:21-40
 @ ./apps/reservation-service/src/main.ts 7:24-56

ERROR in ../../node_modules/@nestjs/microservices/deserializers/nats-response-json.deserializer.js 14:140-155
Module not found: Error: Can't resolve 'nats' in '/Users/sihwanlee/node_modules/@nestjs/microservices/deserializers'
 @ ../../node_modules/@nestjs/microservices/client/client-nats.js 9:42-101
 @ ../../node_modules/@nestjs/microservices/client/index.js 8:21-45
 @ ../../node_modules/@nestjs/microservices/index.js 11:21-40
 @ ./apps/reservation-service/src/main.ts 7:24-56

ERROR in ../../node_modules/@nestjs/microservices/serializers/nats-record.serializer.js 10:100-115
Module not found: Error: Can't resolve 'nats' in '/Users/sihwanlee/node_modules/@nestjs/microservices/serializers'
 @ ../../node_modules/@nestjs/microservices/client/client-nats.js 11:33-81
 @ ../../node_modules/@nestjs/microservices/client/index.js 8:21-45
 @ ../../node_modules/@nestjs/microservices/index.js 11:21-40
 @ ./apps/reservation-service/src/main.ts 7:24-56

ERROR in ../../node_modules/@nestjs/microservices/server/server-grpc.js 30:79-103
Module not found: Error: Can't resolve '@grpc/grpc-js' in '/Users/sihwanlee/node_modules/@nestjs/microservices/server'
 @ ../../node_modules/@nestjs/microservices/server/index.js 5:21-45
 @ ../../node_modules/@nestjs/microservices/index.js 22:21-40
 @ ./apps/reservation-service/src/main.ts 7:24-56

ERROR in ../../node_modules/@nestjs/microservices/server/server-grpc.js 32:14-43
Module not found: Error: Can't resolve '@grpc/proto-loader' in '/Users/sihwanlee/node_modules/@nestjs/microservices/server'
 @ ../../node_modules/@nestjs/microservices/server/index.js 5:21-45
 @ ../../node_modules/@nestjs/microservices/index.js 22:21-40
 @ ./apps/reservation-service/src/main.ts 7:24-56

ERROR in ../../node_modules/@nestjs/microservices/server/server-mqtt.js 22:70-85
Module not found: Error: Can't resolve 'mqtt' in '/Users/sihwanlee/node_modules/@nestjs/microservices/server'
 @ ../../node_modules/@nestjs/microservices/server/index.js 7:21-45
 @ ../../node_modules/@nestjs/microservices/index.js 22:21-40
 @ ./apps/reservation-service/src/main.ts 7:24-56

ERROR in ../../node_modules/@nestjs/microservices/server/server-nats.js 23:70-85
Module not found: Error: Can't resolve 'nats' in '/Users/sihwanlee/node_modules/@nestjs/microservices/server'
 @ ../../node_modules/@nestjs/microservices/server/index.js 8:21-45
 @ ../../node_modules/@nestjs/microservices/index.js 22:21-40
 @ ./apps/reservation-service/src/main.ts 7:24-56

ERROR in ../../node_modules/@nestjs/microservices/server/server-rmq.js 33:58-76
Module not found: Error: Can't resolve 'amqplib' in '/Users/sihwanlee/node_modules/@nestjs/microservices/server'
 @ ../../node_modules/@nestjs/microservices/server/index.js 10:21-44
 @ ../../node_modules/@nestjs/microservices/index.js 22:21-40
 @ ./apps/reservation-service/src/main.ts 7:24-56

ERROR in ../../node_modules/@nestjs/microservices/server/server-rmq.js 34:87-121
Module not found: Error: Can't resolve 'amqp-connection-manager' in '/Users/sihwanlee/node_modules/@nestjs/microservices/server'
 @ ../../node_modules/@nestjs/microservices/server/index.js 10:21-44
 @ ../../node_modules/@nestjs/microservices/index.js 22:21-40
 @ ./apps/reservation-service/src/main.ts 7:24-56

15 errors have detailed information that is not shown.
Use 'stats.errorDetails: true' resp. '--stats-error-details' to show it.
```

```
npm install @grpc/grpc-js @grpc/proto-loader mqtt nats amqplib amqp-connection-manager --legacy-peer-deps
```

NestJS @nestjs/microservices는 다양한 메시지 브로커를 지원

우리는 Kafka만 사용하지만, 다른 트랜스포트도 내부 코드에서 참조되므로 해당 의존성이 없으면 빌드 실패

따라서 최소한으로 빈껍데기라도 설치만 해주면 해결됨
