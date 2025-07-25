import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venue } from './venues/venue.entity';
import { Seat } from './seats/seat.entity';
import { SeatsModule } from './seats/seats.module';
import { VenuesModule } from './venues/venues.module';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '..', '.env'), // apps/seat-service/.env
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3307,
      username: 'root',
      password: '4581',
      database: 'venue_service',
      entities: [Venue, Seat],
      synchronize: true,
    }),

    VenuesModule,
    SeatsModule,
  ],
})
export class AppModule {}
