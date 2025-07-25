import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { ClientKafka } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Reservation, ReservationStatus } from './reservation.entity';
import { RESERVATION_TTL_SECONDS } from './constants';
import { SeatLockService } from './lock/seat-lock.service';

@Injectable()
export class ReservationService {
  private readonly logger = new Logger(ReservationService.name);

  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,

    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,

    @InjectRedis() private readonly redis: Redis,

    private readonly seatLockService: SeatLockService,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect(); // producer 연결
  }

  async reserve(dto: CreateReservationDto) {
    const { userId, seatId, eventId } = dto;

    // 1. 좌석 락 시도
    const lockId = await this.seatLockService.tryLock(seatId);

    this.logger.log(`LOCK ID:${lockId}`);
    if (!lockId) {
      throw new ConflictException('이미 다른 사용자가 선점한 좌석입니다.');
    }

    let saved: Reservation;

    try {
      const reservation = this.reservationRepository.create({
        userId,
        seatId,
        eventId,
        status: ReservationStatus.Pending,
        expiredAt: new Date(Date.now() + 2 * 60 * 1000),
      });
      saved = await this.reservationRepository.save(reservation);

      await this.redis.set(
        `reservation:ttl:${saved.id}`,
        JSON.stringify({
          status: ReservationStatus.Pending,
          reservationId: saved.id,
          userId: saved.userId,
          seatId: saved.seatId,
        }),
        'EX',
        RESERVATION_TTL_SECONDS,
      );
      // 로그용
      const value = await this.redis.get(`reservation:ttl:${saved.id}`);
      this.logger.log('value:', value);

      this.kafkaClient.emit('reservation.requested', {
        reservationId: saved.id,
        userId,
        seatId,
        eventId,
      });
      return {
        message: '예약 요청 완료',
        reservationId: saved.id,
      };
    } catch (error) {
      this.logger.error('예약 생성 중 오류:', error);
      throw new InternalServerErrorException('예약 생성 실패');
    } finally {
      await this.seatLockService.unlock(seatId, lockId); // 4. 락 해제
    }
  }

  async confirmReservation(reservationId: number) {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
    });

    if (!reservation || reservation.status !== ReservationStatus.Pending) {
      return;
    }

    reservation.status = ReservationStatus.Confirmed;
    await this.reservationRepository.save(reservation);
  }

  async expireReservation(reservationId: number) {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
    });

    if (!reservation || reservation.status !== ReservationStatus.Pending)
      return;

    reservation.status = ReservationStatus.Expired;
    await this.reservationRepository.save(reservation);

    // Redis 좌석 락 해제
    await this.redis.del(`seat:locked:${reservation.seatId}`);

    this.logger.warn(`예약 만료 처리 완료: ${reservationId}`);
  }
}
