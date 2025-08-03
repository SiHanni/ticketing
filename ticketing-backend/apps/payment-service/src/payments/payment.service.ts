import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment, PaymentMethod } from './payment.entity';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { KafkaService } from '@libs/kafka';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly kafkaService: KafkaService,
  ) {}

  async createAutoPayment(
    userId: number,
    reservationId: number,
  ): Promise<Payment> {
    this.logger.log(
      `자동 결제 처리: userId=${userId}, reservationId=${reservationId}`,
    );

    const payment = this.paymentRepository.create({
      userId,
      reservationId,
      paymentMethod: PaymentMethod.CARD, // 기본 카드 결제
      paidAt: new Date(),
    });

    const saved = await this.paymentRepository.save(payment);

    await this.kafkaService.produce('reservation.paid', {
      reservationId: saved.reservationId,
      userId: saved.userId,
      paymentId: saved.id,
      paidAt: saved.paidAt,
    });

    return saved;
  }
}
