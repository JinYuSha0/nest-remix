import { ForbiddenException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AppService {
  static logged = false;

  getHello(name?: string): string {
    return name ? `Hello, ${name}` : 'Hello World!';
  }

  getJson() {
    return { foo: 1, bar: '2' };
  }

  login(dto: LoginDto) {
    if (dto.username === 'admin' && dto.password === '123456') {
      AppService.logged = true;
      return true;
    }
    return false;
  }

  logout() {
    AppService.logged = false;
  }
}
