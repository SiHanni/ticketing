import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from './events/events.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Event } from './events/event.entity';
import { RedisModule } from '@libs/redis';
import { RedisService } from '@libs/redis';
import { EventActivationWorker } from './scheduler/event-activation.worker';

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
        entities: [Event],
        synchronize: true,
      }),
    }),
    EventsModule,
    RedisModule,
  ],
  providers: [RedisService, EventActivationWorker],
})
export class AppModule {}
