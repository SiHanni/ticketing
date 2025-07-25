// apps/event-service/src/events/events.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { Repository } from 'typeorm';
import { CreateEventDto } from '../dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  async createEvent(dto: CreateEventDto): Promise<Event> {
    const event = this.eventsRepository.create(dto);
    return this.eventsRepository.save(event);
  }

  async findAll(): Promise<Event[]> {
    return this.eventsRepository.find();
  }

  async findById(id: number): Promise<Event> {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException('이벤트를 찾을 수 없습니다.');
    }
    return event;
  }
}
