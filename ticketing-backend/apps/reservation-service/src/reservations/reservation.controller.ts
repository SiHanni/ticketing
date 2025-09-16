import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QueueGuard } from '../middleware/queue.guard';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @UseGuards(QueueGuard)
  @ApiOperation({ summary: '좌석 예약 요청' })
  @ApiResponse({ status: 201, description: '예약 요청이 정상적으로 처리됨' })
  reserve(@Body() dto: CreateReservationDto) {
    return this.reservationService.reservation(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '예약 상태 조회' })
  @ApiResponse({ status: 200, description: '예약 상태 반환' })
  async getReservation(@Param('id') id: number) {
    return this.reservationService.getReservationStatus(id);
  }

  @Get('metrics/confirmed-count')
  async getConfirmedCount(@Query('eventId', ParseIntPipe) eventId: number) {
    const count = await this.reservationService.getConfirmedCount(eventId);
    return { count };
  }
}
