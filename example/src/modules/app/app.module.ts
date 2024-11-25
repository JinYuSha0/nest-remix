import { Module } from '@nestjs/common';
import { resolve } from 'path';
import { resolveRemixServices } from 'nest-react-router';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  controllers: [AppController],
  providers: [
    AppService,
    ...resolveRemixServices(resolve('dist/routes/server')),
  ],
})
export class AppModule {}
