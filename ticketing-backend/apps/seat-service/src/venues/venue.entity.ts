import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Seat } from '../seats/seat.entity';

@Entity('venues')
export class Venue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @OneToMany(() => Seat, (seat) => seat.venue)
  seats: Seat[];
}
