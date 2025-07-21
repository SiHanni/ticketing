import { Injectable } from '@nestjs/common';

@Injectable()
export class WebsocketServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
