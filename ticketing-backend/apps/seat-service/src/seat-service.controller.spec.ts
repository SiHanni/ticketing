import { Test, TestingModule } from '@nestjs/testing';
import { SeatServiceController } from './seat-service.controller';
import { SeatServiceService } from './seat-service.service';

describe('SeatServiceController', () => {
  let seatServiceController: SeatServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SeatServiceController],
      providers: [SeatServiceService],
    }).compile();

    seatServiceController = app.get<SeatServiceController>(SeatServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(seatServiceController.getHello()).toBe('Hello World!');
    });
  });
});
