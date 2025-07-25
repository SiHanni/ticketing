import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum PaymentMethod {
  CARD = 'CARD',
  ACCOUNT = 'ACCOUNT',
  KAKAO_PAY = 'KAKAO_PAY',
  NAVER_PAY = 'NAVER_PAY',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  reservationId: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @CreateDateColumn()
  paidAt: Date;
}
