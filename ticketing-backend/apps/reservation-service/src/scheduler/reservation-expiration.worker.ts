import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  Reservation,
  ReservationStatus,
} from '../reservations/reservation.entity';

@Injectable()
export class ReservationExpirationWorker implements OnModuleInit {
  private readonly logger = new Logger(ReservationExpirationWorker.name);

  constructor(private readonly dataSource: DataSource) {}

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
      reservation.status = ReservationStatus.Expired;
      await this.dataSource.getRepository(Reservation).save(reservation);
      this.logger.log(`Reservation ${reservation.id} expired and slot freed`);
    }
  }
}
