import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ReservationModule } from './reservations/reservation.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './reservations/reservation.entity';
import * as path from 'path';
import { RedisService } from '@libs/redis';
import { RedisModule } from '@libs/redis';
import { ReservationExpirationWorker } from './scheduler/reservation-expiration.worker';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, `../.env`),
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3307,
      username: 'root',
      password: '4581',
      database: 'reservation_service',
      entities: [Reservation],
      synchronize: true,
    }),
    ReservationModule,
    RedisModule,
  ],
  providers: [RedisService, ReservationExpirationWorker],
})
export class AppModule {}
