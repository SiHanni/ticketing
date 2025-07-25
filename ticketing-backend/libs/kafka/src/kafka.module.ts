import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaService } from './kafka.service';

@Module({
  providers: [KafkaService],
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'ticketing-client',
            brokers: ['localhost:10001', 'localhost:10002', 'localhost:10003'],
          },
          consumer: {
            groupId: 'ticketing-consumer-group', // 서비스마다 override 가능
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule, KafkaService],
})
export class KafkaModule {}
