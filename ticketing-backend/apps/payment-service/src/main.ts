import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // 1. Kafka 마이크로서비스 연결
  const kafkaApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: ['localhost:10001', 'localhost:10002', 'localhost:10003'],
        },
        consumer: {
          groupId: 'payment-consumer-group',
        },
      },
    },
  );

  // 2. 일반 HTTP + Swagger 서버 실행
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Payment Service')
    .setDescription('결제 API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('payment-api-docs', app, document);

  await kafkaApp.listen(); // Kafka consumer 시작
  await app.listen(3005); // HTTP API 서버 시작
}
bootstrap();
