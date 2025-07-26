import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { Repository } from 'typeorm';
import { CreateEventDto } from '../dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,

    private readonly httpService: HttpService,
  ) {}

  async createEvent(dto: CreateEventDto): Promise<Event> {
    const eventCreateRequestAdminId = dto.adminId;
    const user = await this.getUserById(eventCreateRequestAdminId);
    console.log('III', user);
    if (user.role !== 'admin') {
      throw new ForbiddenException('관리자 전용 기능입니다:(createEvent)');
    }

    const event = this.eventsRepository.create(dto);
    return this.eventsRepository.save(event);
  }

  private async getUserById(
    userId: number,
  ): Promise<{ id: number; role: string }> {
    try {
      const { data } = await this.httpService.axiosRef.get(
        `http://localhost:3004/auth/${userId}`,
      );
      console.log('getUserById', data);
      return data;
    } catch (error) {
      console.log('error');
      throw new ForbiddenException('유저 정보를 가져오는 데 실패했습니다.');
    }
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
