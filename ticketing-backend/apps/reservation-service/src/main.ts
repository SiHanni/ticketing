import { NestFactory } from '@nestjs/core';
import { ReservationServiceModule } from './reservation-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ReservationServiceModule);
  await app.listen(process.env.port ?? 3002);
}
bootstrap();
