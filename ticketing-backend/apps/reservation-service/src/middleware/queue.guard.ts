import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { RedisService } from '@libs/redis';

@Injectable()
export class QueueGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.body.userId || request.query.userid;
    const eventId = request.body.eventId || request.query.eventId;

    if (!userId) {
      throw new ForbiddenException('User ID is required');
    }
    if (!eventId) {
      throw new ForbiddenException('Event ID is required');
    }

    const statusKey = `user:${eventId}:${userId}:status`;
    const status = await this.redisService.get(statusKey);

    if (status !== 'active') {
      throw new ForbiddenException('You are not allowed to reserve yet.');
    }

    return true;
  }
}
