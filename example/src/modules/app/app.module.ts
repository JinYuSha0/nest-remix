import { Module } from '@nestjs/common';
import { RemixService } from 'nestjs-remix';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import remixPageServices from '~/routes/server/all.server';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, RemixService, ...remixPageServices],
})
export class AppModule {}
