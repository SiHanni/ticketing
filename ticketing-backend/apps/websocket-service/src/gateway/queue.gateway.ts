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
import { QUEUE_RESERVATION_PREFIX } from '../constants';

@WebSocketGateway({
  cors: { origin: '*' }, // 테스트 단계에서는 전체 허용
})
export class QueueGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  // 유저별 소켓 관리
  private clients = new Map<string, Socket>();

  constructor(private readonly queueService: QueueService) {}

  async handleConnection(client: Socket) {
    const { userId, eventId } = client.handshake.query;

    if (!userId || !eventId) {
      client.emit('error', 'Missing userId or eventId');
      client.disconnect();
      return;
    }

    const uid = Number(userId);
    const eid = Number(eventId);
    const key = `${eid}:${uid}`;

    // 중복 접속 제거
    await this.queueService.removeUser(uid, eid);
    this.clients.set(key, client);

    // 대기열 등록
    await this.queueService.enqueue({ userId: uid, eventId: eid });

    // 3초마다 순번 조회 (O(1))
    const intervalId = setInterval(async () => {
      const position = await this.queueService.getPosition(uid, eid);
      client.emit('queue-position', {
        position: position >= 0 ? position + 1 : null,
      });
    }, 3000);

    // 연결 종료 시 interval 제거
    client.on('disconnect', async () => {
      clearInterval(intervalId);
      await this.queueService.removeUser(Number(userId), Number(eventId));
    });
  }

  /** 활성화 신호 전송 */
  sendActiveSignal(userId: number, eventId: number) {
    const key = `${eventId}:${userId}`;
    const client = this.clients.get(key);
    if (client) {
      client.emit('user-active', {
        message: '입장 가능합니다',
        userId,
        eventId,
      });
    }
  }

  // 특정 유저의 순번을 계산해서 전송
  private async sendUserPosition(
    client: Socket,
    userId: number,
    eventId: number,
  ) {
    // ZSET에서 순번 조회
    const rank = await this.queueService.getPosition(userId, eventId);

    if (rank !== null && rank >= 0) {
      client.emit('queue-position', {
        message: `현재 대기열 순번 ::`,
        position: rank + 1, // 1등부터 시작하도록 +1
      });
    } else {
      client.emit('queue-position', {
        message: '대기열에 존재하지 않습니다.',
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
