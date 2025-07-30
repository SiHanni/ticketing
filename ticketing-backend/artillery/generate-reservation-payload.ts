import { Venue } from '../apps/seat-service/src/venues/venue.entity';
import { Seat } from '../apps/seat-service/src/seats/seat.entity';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';

interface ReservationPayload {
  userId: number;
  seatId: string;
  eventId: string;
}
// 100석 짜리 공연장 ID : 63c86589-4c06-4a1d-ba14-4aeebed9d8c1
// 100석 짜리 콘서트 ID : 5
// 1000석 짜리 공연장 ID : 79c91ab9-a4ee-457c-b117-1d4751d4043a
// 1000석 짜리 콘서트 ID : 6

// 🎯 공연장, 유저 범위 설정
const EVENT_ID = '6'; // 1000석 공연장
const VENUE_ID = '79c91ab9-a4ee-457c-b117-1d4751d4043a';
const USER_START = 2;
const USER_END = 50000; // 이건 테스트 중에 규모를 키우면됨

const outputFile = path.join(__dirname, 'reservation-test-payload.json');

const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3307,
  username: 'root',
  password: '4581',
  database: 'venue_service',
  entities: [Venue, Seat],
  synchronize: false,
});

async function main() {
  await AppDataSource.initialize();
  console.log('DB 연결 성공');

  const seats = await AppDataSource.query(
    `SELECT id FROM seats WHERE venueId = ? ORDER BY id LIMIT ?`,
    [VENUE_ID, USER_END - USER_START + 1],
  );

  if (seats.length === 0) {
    console.error('해당 공연장의 좌석이 없습니다.');
    process.exit(1);
  }

  const payload: ReservationPayload[] = [];

  for (let i = 0; i <= USER_END - USER_START; i++) {
    const userId = USER_START + i;
    const seat = seats[i % seats.length]; // 좌석 순환
    payload.push({
      userId,
      seatId: seat.id,
      eventId: EVENT_ID,
    });
  }

  fs.writeFileSync(outputFile, JSON.stringify(payload, null, 2));
  console.log(`Payload 생성 완료: ${payload.length}건 → ${outputFile}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('오류 발생:', err);
  process.exit(1);
});
