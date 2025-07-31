import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Event } from '../events/event.entity';
import { RedisService } from '@libs/redis';

@Injectable()
export class EventActivationWorker implements OnModuleInit {
  private readonly logger = new Logger(EventActivationWorker.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    this.logger.log('✅ EventActivationWorker 초기화 완료');
    setInterval(async () => {
      await this.updateActiveEvents();
    }, 5000);
  }

  private async updateActiveEvents() {
    const now = new Date();

    const events = await this.dataSource
      .getRepository(Event)
      .createQueryBuilder('event')
      .where('event.openAt <= :now', { now })
      .andWhere('event.endDate >= :now', { now })
      .getMany();

    if (events.length === 0) return;

    for (const e of events) {
      await this.redisService.sadd('activeEvents', String(e.id));
    }

    this.logger.debug(`🔄 활성 이벤트 갱신 완료 (${events.length}건)`);
  }
}
