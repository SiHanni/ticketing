import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentConsumer } from './payment.consumer';
import { KafkaModule } from '@libs/kafka';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), KafkaModule],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentConsumer],
})
export class PaymentModule {}
