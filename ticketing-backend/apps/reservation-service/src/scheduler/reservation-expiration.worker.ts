import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  Reservation,
  ReservationStatus,
} from '../reservations/reservation.entity';
import { RedisService } from '@libs/redis';
import { SEAT_LOCK_PREFIX } from '../reservations/constants';

@Injectable()
export class ReservationExpirationWorker implements OnModuleInit {
  private readonly logger = new Logger(ReservationExpirationWorker.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    setInterval(async () => {
      await this.expirePendingReservations();
    }, 5000); // 5초마다 만료 확인
  }

  private async expirePendingReservations() {
    const now = new Date();
    const expiredReservations = await this.dataSource
      .getRepository(Reservation)
      .createQueryBuilder()
      .where('status = :status', { status: 'Pending' })
      .andWhere('expiredAt < :now', { now })
      .getMany();

    for (const reservation of expiredReservations) {
      try {
        reservation.status = ReservationStatus.Expired;
        await this.dataSource.getRepository(Reservation).save(reservation);

        const lockKey = `${SEAT_LOCK_PREFIX}:${reservation.eventId}:${reservation.seatId}`;
        await this.redisService.del(lockKey);

        this.logger.log(
          `⏰ Reservation ${reservation.id} 만료 → 락 해제 완료 (${lockKey})`,
        );
      } catch (err) {
        this.logger.error(`❌ 예약 ${reservation.id} 만료 처리 실패:`, err);
      }

      this.logger.log(`Reservation ${reservation.id} expired and slot freed`);
    }
  }
}
