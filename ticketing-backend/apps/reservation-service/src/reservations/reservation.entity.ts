import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ReservationStatus {
  Pending = 'PENDING', // 예약 대기 (Kafka consumer 처리 전)
  Confirmed = 'CONFIRMED', // 예약 확정
  Cancelled = 'CANCELLED', // 예약 취소
  Expired = 'EXPIRED', // 선점 시간 초과 등으로 만료
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  userId: number;

  @Column()
  @Index()
  eventId: number;

  @Column('uuid')
  @Index()
  seatId: string;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.Pending,
  })
  status: ReservationStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiredAt: Date | null;
}
