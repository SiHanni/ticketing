// 추후 다른 로깅 툴을 쓴다면 그것으로 대체
import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class AppLogger implements LoggerService {
  log(message: any) {
    console.log('[LOG]', message);
  }

  error(message: any, trace?: string) {
    console.error('[ERROR]', message, trace);
  }

  warn(message: any) {
    console.warn('[WARN]', message);
  }
}
