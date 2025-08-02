import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

interface RequestEntry {
  statusCode?: number;
  timestamp?: number;
}

async function main() {
  const filePath = path.join(__dirname, 'result.json');

  if (!fs.existsSync(filePath)) {
    console.error('❌ result.json 파일을 찾을 수 없습니다.');
    process.exit(1);
  }

  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  let total = 0;
  let success = 0;
  let forbidden403 = 0;
  let conflict409 = 0;
  let otherErrors = 0;

  // 초당 TPS 기록
  const tps: Record<number, number> = {};

  // Artillery result.json에서 응답 상태코드와 타임스탬프 추출
  data.intermediate?.forEach((entry: any) => {
    const timestamp = Math.floor(entry?.timestamp / 1000) || 0;

    entry?.requestsCompleted?.forEach((r: RequestEntry) => {
      const code = r.statusCode;
      if (!code) return;

      total++;

      if (code === 200 || code === 201) {
        success++;
        tps[timestamp] = (tps[timestamp] || 0) + 1;
      } else if (code === 403) {
        forbidden403++;
      } else if (code === 409) {
        conflict409++;
      } else {
        otherErrors++;
      }
    });
  });

  // 결과 요약
  console.log('📊 테스트 결과 분석');
  console.log('------------------------');
  console.log(`총 요청 수      : ${total}`);
  console.log(
    `✅ 성공 (200)    : ${success} (${((success / total) * 100).toFixed(2)}%)`,
  );
  console.log(
    `🚫 403 (대기열)  : ${forbidden403} (${(
      (forbidden403 / total) *
      100
    ).toFixed(2)}%)`,
  );
  console.log(
    `⚠️ 409 (중복예약): ${conflict409} (${((conflict409 / total) * 100).toFixed(
      2,
    )}%)`,
  );
  console.log(
    `❌ 기타 오류     : ${otherErrors} (${((otherErrors / total) * 100).toFixed(
      2,
    )}%)`,
  );

  // --- TPS 차트 출력 ---
  console.log('\n📈 초당 성공 처리량(TPS):\n');

  const maxTPS = Math.max(...Object.values(tps));
  const scale = maxTPS > 50 ? 50 / maxTPS : 1; // 최대 50칸 기준 스케일링

  Object.entries(tps)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .forEach(([second, count]) => {
      const bar = '█'.repeat(Math.floor(count * scale));
      console.log(`${second}s | ${count.toString().padStart(4)} req | ${bar}`);
    });
}

main();

// 실행: ts-node analyze-results.ts
