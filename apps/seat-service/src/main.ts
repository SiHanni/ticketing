import { NestFactory } from '@nestjs/core';
import { SeatServiceModule } from './seat-service.module';

async function bootstrap() {
  const app = await NestFactory.create(SeatServiceModule);
  await app.listen(process.env.port ?? 3003);
}
bootstrap();
