import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
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

  async reservation(dto: CreateReservationDto) {
    const { userId, seatId, eventId } = dto;

    // 이미 예약 확정인 좌석인지 체크
    const existingConfirmed = await this.reservationRepository.findOne({
      where: {
        seatId,
        eventId,
        status: ReservationStatus.Confirmed,
      },
    });
    if (existingConfirmed) {
      throw new ConflictException('이미 예약 완료된 좌석입니다.');
    }

    // 좌석 락 시도
    const lockKey = `${eventId}:${seatId}`;
    const lockId = await this.seatLockService.tryLock(lockKey);

    if (!lockId) {
      throw new ConflictException('이미 다른 사용자가 선점 중인 좌석입니다.');
    }

    let saved: Reservation;

    try {
      const expiredAt = new Date(Date.now() + RESERVATION_TTL_SECONDS * 1000);

      const reservation = this.reservationRepository.create({
        userId,
        seatId,
        eventId,
        status: ReservationStatus.Pending,
        expiredAt,
      });
      saved = await this.reservationRepository.save(reservation);

      // Redis TTL 예약 데이터
      const redisKey = `reservation:ttl:${saved.id}`;
      await this.redis.set(
        redisKey,
        JSON.stringify({
          status: ReservationStatus.Pending,
          reservationId: saved.id,
          userId: saved.userId,
          seatId: saved.seatId,
          eventId: saved.eventId,
          lockId,
        }),
        'EX',
        RESERVATION_TTL_SECONDS,
      );

      // 예약 성공 시 활성화 대기열에서 제거 → 재예약 방지
      await this.redis.del(`user:${eventId}:${userId}:status`);

      // 카프카 이벤트 발행
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

    const redisReservationKey = `reservation:ttl:${reservationId}`;
    const redisValue = await this.redis.get(redisReservationKey);

    let lockId: string | undefined;

    if (redisValue) {
      try {
        const parsed = JSON.parse(redisValue);
        parsed.status = ReservationStatus.Confirmed;
        lockId = parsed.lockId;

        await this.redis.set(
          redisReservationKey,
          JSON.stringify(parsed),
          'EX',
          await this.redis.ttl(redisReservationKey), // 남은 TTL 유지
        );
      } catch (err) {
        this.logger.error(
          `Redis 예약 키 갱신 실패: reservationId=${reservationId}`,
          err,
        );
      }
    }

    if (lockId) {
      const lockKey = `${reservation.eventId}:${reservation.seatId}`;
      const unlockResult = await this.seatLockService.unlock(lockKey, lockId);
      if (!unlockResult) {
        this.logger.warn(
          `좌석 락 해제 실패: reservationId=${reservationId}, lockKey=${lockKey}`,
        );
      }
    } else {
      this.logger.warn(
        `락 해제를 위한 lockId 없음: reservationId=${reservationId}`,
      );
    }
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
    const redisReservationKey = `reservation:ttl:${reservationId}`;
    const redisValue = await this.redis.get(redisReservationKey);

    const lockKey = `${reservation.eventId}:${reservation.seatId}`;

    let lockId: string | undefined;

    try {
      if (redisValue) {
        const parsed = JSON.parse(redisValue);
        lockId = parsed.lockId;
      }
    } catch (e) {
      this.logger.error(`TTL 키 파싱 실패: ${e}`);
    }

    // TTL Key 삭제
    await this.redis.del(redisReservationKey);

    // 좌석 락 해제
    if (lockId) {
      await this.seatLockService.unlock(
        `${reservation.eventId}:${reservation.seatId}`,
        lockId,
      );
    }

    // 만료된 사용자도 상태 제거
    await this.redis.del(`user:${reservation.userId}:status`);

    this.logger.warn(`예약 만료 처리 완료: ${reservationId}`);
  }

  /** ✅ 예약 상태 조회 */
  async getReservationStatus(reservationId: number) {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      select: ['id', 'status', 'userId', 'seatId', 'eventId', 'expiredAt'],
    });

    if (!reservation) {
      throw new NotFoundException('해당 예약을 찾을 수 없습니다.');
    }

    return reservation;
  }
}
