import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  sum(numArr: number[]): number {
    console.log('micro-service recive:', numArr);
    return numArr.reduce((total, item) => total + item, 0);
  }
}
