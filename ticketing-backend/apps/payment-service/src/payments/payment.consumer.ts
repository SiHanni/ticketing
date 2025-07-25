import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';

@Controller()
export class PaymentConsumer {
  constructor(private readonly paymentService: PaymentService) {}

  @MessagePattern('reservation.requested')
  async handleReservationRequested(@Payload() data: CreatePaymentDto) {
    console.log('[payment-service] Consumed reservation.requested:', data);
    await this.paymentService.create(data);
  }
}
