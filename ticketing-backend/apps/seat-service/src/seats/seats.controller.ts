import { Controller, Post, Body } from '@nestjs/common';
import { SeatsService } from './seats.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Seats')
@Controller('seats')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Post()
  @ApiOperation({ summary: '좌석 등록 (범위 포함)' })
  @ApiResponse({ status: 201, description: '좌석이 등록되었습니다.' })
  async create(@Body() dto: CreateSeatDto) {
    return this.seatsService.create(dto);
  }
}
