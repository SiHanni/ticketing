import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('User Service')
    .setDescription('User registration and authentication API')
    .setVersion('1.0')
    .addBearerAuth() // JWT 인증 헤더 추가
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('user-api-docs', app, document);

  await app.startAllMicroservices();

  await app.listen(process.env.PORT ?? 3004);
}
bootstrap();
