import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { QueueService } from '../queue/queue.service';

@WebSocketGateway({
  cors: { origin: '*' }, // 테스트 단계에서는 전체 허용
})
export class QueueGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly queueService: QueueService) {}

  // 클라이언트가 소켓으로 처음 연결될 때
  async handleConnection(client: Socket) {
    // 연결 파라미터에서 userId, eventId 가져오기
    const { userId, eventId } = client.handshake.query;

    if (!userId || !eventId) {
      client.emit('error', 'Missing userId or eventId');
      client.disconnect();
      return;
    }

    // 대기열 등록
    await this.queueService.enqueue({
      userId: Number(userId),
      eventId: Number(eventId),
    });

    // 접속 직후 1회 순번 전달
    await this.sendUserPosition(client, Number(userId), Number(eventId));

    // 3초마다 순번 업데이트 전달
    const intervalId = setInterval(async () => {
      await this.sendUserPosition(client, Number(userId), Number(eventId));
    }, 3000);

    // 연결 종료 시 interval 제거
    client.on('disconnect', () => {
      clearInterval(intervalId);
    });
  }

  // 특정 유저의 순번을 계산해서 전송
  private async sendUserPosition(
    client: Socket,
    userId: number,
    eventId: number,
  ) {
    // Redis 리스트 전체 조회
    const key = `queue:reservation:${eventId}`;
    const queue = await this.queueService['redisService'].lrange(key, 0, -1);

    // 자신의 순번 계산
    const position =
      queue.findIndex((item: string) => JSON.parse(item).userId === userId) + 1;

    if (position > 0) {
      client.emit('queue-position', {
        message: `Your current position in the queue`,
        position,
      });
    } else {
      client.emit('queue-position', {
        message: 'You are not in the queue',
        position: null,
      });
    }
  }

  // 클라이언트가 'get-position' 요청 시 현재 순번 알려주기
  @SubscribeMessage('get-position')
  async handleGetPosition(
    @MessageBody() data: { userId: number; eventId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const length = await this.queueService.getQueueLength(data.eventId);
    client.emit('queue-position', {
      position: length,
    });
  }
}
