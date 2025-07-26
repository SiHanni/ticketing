import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false, // 필드 강제 차단 해제
      skipMissingProperties: true, // 없으면 무시
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Event Service API')
    .setDescription('이벤트 생성 및 조회 API 문서')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('event-api-docs', app, document);

  await app.listen(process.env.port ?? 3001);
}
bootstrap();
