import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seat } from './seat.entity';
import { SeatsService } from './seats.service';
import { SeatsController } from './seats.controller';
import { VenuesModule } from '../venues/venues.module';

@Module({
  imports: [TypeOrmModule.forFeature([Seat]), VenuesModule],
  controllers: [SeatsController],
  providers: [SeatsService],
})
export class SeatsModule {}
