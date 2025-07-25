import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Venue } from '../venues/venue.entity';

export enum SeatGrade {
  VIP = 'VIP',
  R = 'R',
  S = 'S',
  A = 'A',
  B = 'B',
  C = 'C',
}

@Entity('seats')
export class Seat {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  section: string; // 구역 (예: W7)

  @Column()
  row: number; // 열

  @Column()
  number: number; // 번호

  @Column({ type: 'enum', enum: SeatGrade })
  grade: SeatGrade;

  @Column({ type: 'int', nullable: true })
  floor: number;

  @ManyToOne(() => Venue, (venue) => venue.seats, { onDelete: 'CASCADE' })
  venue: Venue;
}
