import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReservationService } from './reservation.service';

@Controller()
export class ReservationConsumerController {
  constructor(private readonly reservationService: ReservationService) {}

  @MessagePattern('reservation.paid')
  async handleReservation(@Payload() payload: any) {
    const { reservationId } = payload;
    console.log('[reservation-service] Consumed reservation.paid:', payload);
    await this.reservationService.confirmReservation(reservationId);
  }
}
