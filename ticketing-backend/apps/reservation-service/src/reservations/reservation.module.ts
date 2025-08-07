import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './reservation.entity';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { ReservationConsumerController } from './reservation-consumer.controller';
import { KafkaModule, KafkaRetryService } from '@libs/kafka';
import { ReservationExpirationListener } from './reservation-expiration.listener';
import { SeatLockService } from './lock/seat-lock.service';
import { RedisModule } from '@libs/redis';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation]), KafkaModule, RedisModule],
  controllers: [ReservationController, ReservationConsumerController],
  providers: [
    ReservationService,
    ReservationExpirationListener,
    SeatLockService,
    KafkaRetryService,
  ],
})
export class ReservationModule {}
