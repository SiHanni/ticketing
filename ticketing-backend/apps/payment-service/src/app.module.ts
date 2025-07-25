import { Module } from '@nestjs/common';
import { PaymentModule } from './payments/payment.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { Payment } from './payments/payment.entity';

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
      database: 'payment_service',
      entities: [Payment],
      synchronize: true,
    }),
    PaymentModule,
  ],
})
export class AppModule {}
