import { Module } from '@nestjs/common';
import { resolve } from 'path';
import { resolveReactRouterServices } from 'nest-react-router';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  controllers: [AppController],
  providers: [
    AppService,
    ...resolveReactRouterServices(resolve('dist/routes/server')),
  ],
})
export class AppModule {}
