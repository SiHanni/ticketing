import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venue } from './venue.entity';
import { CreateVenueDto } from './dto/create-venues.dto';

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue)
    private venuesRepository: Repository<Venue>,
  ) {}

  create(dto: CreateVenueDto) {
    const venue = this.venuesRepository.create(dto);
    return this.venuesRepository.save(venue);
  }

  async findSeats(venueId: string) {
    const venue = await this.venuesRepository.findOne({
      where: { id: venueId },
      relations: ['seats'],
    });

    if (!venue) {
      throw new NotFoundException('공연장을 찾을 수 없습니다');
    }

    return venue.seats;
  }
}
