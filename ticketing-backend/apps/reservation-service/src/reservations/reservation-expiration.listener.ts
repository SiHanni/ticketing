import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { ReservationService } from './reservation.service';

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
