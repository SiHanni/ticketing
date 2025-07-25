import { Controller, Post, Body } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @ApiOperation({ summary: '좌석 예약 요청' })
  @ApiResponse({ status: 201, description: '예약 요청이 정상적으로 처리됨' })
  reserve(@Body() dto: CreateReservationDto) {
    return this.reservationService.reserve(dto);
  }
}
