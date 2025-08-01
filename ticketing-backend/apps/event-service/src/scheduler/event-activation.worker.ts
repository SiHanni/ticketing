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

    const activeEventIds = events.map((e) => String(e.id));

    // Redis에 현재 저장된 활성화 이벤트 값들
    const currentIds = await this.redisService.smembers('activeEvents');

    const toRemove = currentIds.filter((id) => !activeEventIds.includes(id));
    for (const id of toRemove) {
      await this.redisService.srem('activeEvents', id);
    }

    const toAdd = activeEventIds.filter((id) => !currentIds.includes(id));
    for (const id of toAdd) {
      await this.redisService.sadd('activeEvents', id);
    }
    this.logger.debug(`🔄 활성 이벤트 갱신 완료 (${events.length}건)`);
  }
}
