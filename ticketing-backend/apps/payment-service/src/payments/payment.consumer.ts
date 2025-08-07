import { Controller } from '@nestjs/common';
import {
  Ctx,
  KafkaContext,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { Logger } from '@nestjs/common';
import { KafkaRetryService } from '@libs/kafka';

@Controller()
export class PaymentConsumer {
  private readonly logger = new Logger(PaymentConsumer.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly kafkaRetryService: KafkaRetryService,
  ) {}

  @MessagePattern('reservation.requested')
  async handleReservationRequested(
    @Payload() data: CreatePaymentDto,
    @Ctx() context: KafkaContext,
  ) {
    this.logger.log(
      '[payment-service] Consumed reservation.requested:',
      JSON.stringify(data),
    );

    const headers = context.getMessage().headers;

    try {
      const { userId, reservationId } = data;
      return this.paymentService.createAutoPayment(userId, reservationId);
    } catch (error) {
      this.logger.error('❌ 결제 처리 실패:', error);
      await this.kafkaRetryService.retryOrDlq(
        'reservation.requested',
        data,
        headers,
        error,
      );
    }
  }
}
