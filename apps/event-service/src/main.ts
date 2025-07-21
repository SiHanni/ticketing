import { NestFactory } from '@nestjs/core';
import { EventServiceModule } from './event-service.module';

async function bootstrap() {
  const app = await NestFactory.create(EventServiceModule);
  await app.listen(process.env.port ?? 3001);
}
bootstrap();
