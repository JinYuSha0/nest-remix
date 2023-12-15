import { NestApplication } from '@nestjs/core';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { startNestRemix } from 'nestjs-remix';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/global.exeception.filter';
import { GlobalInterceptor } from './common/global.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new GlobalInterceptor());
  await app.listen(3000);
  // Must be after the listen method
  startNestRemix(app);
}
bootstrap();
