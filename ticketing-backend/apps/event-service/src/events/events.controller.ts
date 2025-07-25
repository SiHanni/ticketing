import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { Event } from './event.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('이벤트 API')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: '티켓 이벤트 생성 (관리자 전용)' })
  async create(@Body() dto: CreateEventDto) {
    return this.eventsService.createEvent(dto);
  }

  @Get()
  @ApiOperation({ summary: '이벤트 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '이벤트 목록 조회 성공',
    type: [Event],
  })
  findAll(): Promise<Event[]> {
    return this.eventsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '이벤트 상세 조회' })
  @ApiResponse({
    status: 200,
    description: '이벤트 상세 조회 성공',
    type: Event,
  })
  @ApiResponse({ status: 404, description: '이벤트를 찾을 수 없음' })
  findById(@Param('id', ParseIntPipe) id: number): Promise<Event> {
    return this.eventsService.findById(id);
  }
}
