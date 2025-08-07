import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { PaymentService } from './payment.service';
//import { PaymentController } from './payment.controller';
import { PaymentConsumer } from './payment.consumer';
import { KafkaModule, KafkaRetryService } from '@libs/kafka';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), KafkaModule],
  // http 테스트 용
  //controllers: [PaymentController],
  controllers: [PaymentConsumer],
  providers: [PaymentService, PaymentConsumer, KafkaRetryService],
})
export class PaymentModule {}
