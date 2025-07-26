import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venues.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Venue } from './venue.entity';

@ApiTags('Venues')
@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Post()
  @ApiOperation({ summary: '공연장 등록' })
  @ApiResponse({ status: 201, description: '공연장이 등록되었습니다.' })
  async create(@Body() dto: CreateVenueDto) {
    return this.venuesService.create(dto);
  }

  @Get(':id/seats')
  @ApiOperation({ summary: '공연장의 좌석 목록 조회' })
  @ApiResponse({ status: 200, description: '공연장의 좌석 목록 반환' })
  async findSeats(@Param('id') id: string) {
    const seats = await this.venuesService.findSeats(id);
    if (!seats) throw new NotFoundException('해당 공연장의 좌석이 없습니다.');
    return seats;
  }

  @Get()
  findAll(): Promise<Partial<Venue>[]> {
    return this.venuesService.findAll();
  }
}
