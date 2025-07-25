import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { KafkaService } from '@libs/kafka';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    private readonly kafkaService: KafkaService,
  ) {}

  async create(dto: CreatePaymentDto): Promise<Payment> {
    const { userId, reservationId, name, paymentMethod } = dto;

    const payment = this.paymentRepository.create({
      userId,
      reservationId,
      name,
      paymentMethod,
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
