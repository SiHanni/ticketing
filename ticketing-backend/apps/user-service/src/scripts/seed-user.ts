import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { fakerKO as faker } from '@faker-js/faker';

async function bootstrap() {
  console.log('🚀 Starting seed script...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UsersService);

  const BATCH_SIZE = 1000;
  const TOTAL_USERS = 70000;
  const password = '0000';

  console.time('Seeding users');

  for (let i = 0; i < TOTAL_USERS / BATCH_SIZE; i++) {
    const batch: CreateUserDto[] = [];

    for (let j = 0; j < BATCH_SIZE; j++) {
      const email = faker.internet.email().toLowerCase();
      const name = faker.person.fullName();
      const phone = faker.phone.number();

      batch.push({ email, password, name, phone });
    }

    await Promise.all(
      batch.map((dto) =>
        userService.create(dto).catch((e) => {
          console.error('❌ 유저 생성 실패:', e.message);
          return null;
        }),
      ),
    );

    console.log(`✅ Inserted ${BATCH_SIZE * (i + 1)} users...`);
  }

  console.timeEnd('Seeding users');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('🔥 Fatal error during seeding:', err);
});
