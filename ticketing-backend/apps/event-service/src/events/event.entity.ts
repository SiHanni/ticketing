// apps/event-service/src/events/event.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
//import { Venue } from 'apps/seat-service/src/venues/venue.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  openAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  //@ManyToOne(() => Venue, { eager: true, onDelete: 'SET NULL' }) // 공연장 삭제시 null로 설정
  //@JoinColumn({ name: 'venueId' })
  //venue: Venue;
  // msa 구조에서는 위처럼 다른 데이터베이스의 테이블에 외래키 설정을 하지 못하기 때문에 아래처럼 저장한 뒤 fetch한다.

  @Column()
  venueId: string; // 공연장 UUID
}
