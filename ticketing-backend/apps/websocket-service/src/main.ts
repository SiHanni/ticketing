import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { QueueService } from './queue/queue.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3006);
  console.log('✅ WebSocket Service is running on ws://localhost:3006');
}
bootstrap();
