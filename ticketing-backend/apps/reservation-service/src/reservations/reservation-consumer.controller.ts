import { Controller, Logger } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  Ctx,
  KafkaContext,
} from '@nestjs/microservices';
import { ReservationService } from './reservation.service';
import { KafkaRetryService } from '@libs/kafka';

@Controller()
export class ReservationConsumerController {
  private readonly logger = new Logger(ReservationConsumerController.name);

  constructor(
    private readonly reservationService: ReservationService,
    private readonly kafkaRetryService: KafkaRetryService,
  ) {}

  @MessagePattern('reservation.paid')
  async handleReservation(
    @Payload() payload: any,
    @Ctx() context: KafkaContext,
  ) {
    const { reservationId } = payload;
    const headers = context.getMessage().headers;

    this.logger.log(
      '[reservation-service] Consumed reservation.paid:',
      payload,
    );

    try {
      await this.reservationService.confirmReservation(reservationId);
    } catch (error) {
      this.logger.error('❌ 예약 확정 처리 실패:', error);
      await this.kafkaRetryService.retryOrDlq(
        'reservation.paid',
        payload,
        headers,
        error,
      );
    }
  }
}
