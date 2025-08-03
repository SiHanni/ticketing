import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { Logger } from '@nestjs/common';

@Controller()
export class PaymentConsumer {
  private readonly logger = new Logger(PaymentConsumer.name);

  constructor(private readonly paymentService: PaymentService) {}

  @MessagePattern('reservation.requested')
  async handleReservationRequested(@Payload() data: CreatePaymentDto) {
    this.logger.log('[payment-service] Consumed reservation.requested:', data);
    await this.paymentService.create(data);
  }
}
