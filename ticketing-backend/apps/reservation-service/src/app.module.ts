import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ReservationModule } from './reservations/reservation.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './reservations/reservation.entity';
import { RedisService } from '@libs/redis';
import { RedisModule } from '@libs/redis';
import { ReservationExpirationWorker } from './scheduler/reservation-expiration.worker';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: parseInt(config.getOrThrow<string>('DB_PORT'), 10),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [Reservation],
        synchronize: true,
      }),
    }),
    ReservationModule,
    RedisModule,
  ],
  providers: [RedisService, ReservationExpirationWorker],
})
export class AppModule {}
