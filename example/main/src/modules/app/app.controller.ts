import { BadRequestException, Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('/')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/hello')
  getHello() {
    return this.appService.getHello();
  }

  @Get('/json')
  getJson() {
    return this.appService.getJson();
  }

  @Get('/bad')
  getBad() {
    throw new BadRequestException();
  }
}
