import { Test, TestingModule } from '@nestjs/testing';
import { WebsocketServiceController } from './websocket-service.controller';
import { WebsocketServiceService } from './websocket-service.service';

describe('WebsocketServiceController', () => {
  let websocketServiceController: WebsocketServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [WebsocketServiceController],
      providers: [WebsocketServiceService],
    }).compile();

    websocketServiceController = app.get<WebsocketServiceController>(WebsocketServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(websocketServiceController.getHello()).toBe('Hello World!');
    });
  });
});
