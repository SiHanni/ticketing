import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from './events/events.module';
import { ConfigModule } from '@nestjs/config';
import { Event } from './events/event.entity';
import { RedisModule } from '@libs/redis';
import { RedisService } from '@libs/redis';
import { EventActivationWorker } from './scheduler/event-activation.worker';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // .env 지원
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3307,
      username: 'root',
      password: '4581',
      database: 'event_service',
      entities: [Event],
      synchronize: true,
    }),
    EventsModule,
    RedisModule,
  ],
  providers: [RedisService, EventActivationWorker],
})
export class AppModule {}
