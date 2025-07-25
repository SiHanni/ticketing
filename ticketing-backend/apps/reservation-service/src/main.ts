import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:10001', 'localhost:10002', 'localhost:10003'],
      },
      consumer: {
        groupId: 'reservation-consumer-group',
      },
    },
  });
  await app.startAllMicroservices();

  const config = new DocumentBuilder()
    .setTitle('Reservation Service API')
    .setDescription('티켓 예약 API 문서')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('reservation-api-docs', app, document);

  await app.listen(3002);
}
bootstrap();
