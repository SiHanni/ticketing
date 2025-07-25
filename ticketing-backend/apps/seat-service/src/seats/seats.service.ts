import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seat, SeatGrade } from './seat.entity';
import { Repository } from 'typeorm';
import { CreateSeatDto } from './dto/create-seat.dto';
import { Venue } from '../venues/venue.entity';

@Injectable()
export class SeatsService {
  constructor(
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
  ) {}

  async create(dto: CreateSeatDto) {
    const { section, row, fromNumber, toNumber, grade, venueId, floor } = dto;
    console.log('DTO', dto);
    const seats: Seat[] = [];
    for (let number = fromNumber; number <= toNumber; number++) {
      const seat = this.seatRepository.create({
        section,
        row,
        number,
        grade: grade as SeatGrade,
        venue: { id: venueId } as Venue,
        floor,
      });
      seats.push(seat);
    }

    return this.seatRepository.save(seats);
  }
}
