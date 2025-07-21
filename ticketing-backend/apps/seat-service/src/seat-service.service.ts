import { Injectable } from '@nestjs/common';

@Injectable()
export class SeatServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
