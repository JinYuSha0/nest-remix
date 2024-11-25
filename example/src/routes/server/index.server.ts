import { redirect, type LoaderFunctionArgs } from 'react-router';
import {
  Body,
  Inject,
  Injectable,
  OnModuleInit,
  Query,
  Req,
} from '@nestjs/common';
import { Loader, Action, ReactRouterArgs, useServer } from 'nest-react-router';
import { AppService } from '~/modules/app/app.service';
import { LoginDto } from '~/modules/app/dto/login.dto';
import { Test } from '~/common/test.decorator';
import { Client, ClientProxy, Transport } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class IndexBackend implements OnModuleInit {
  @Client({
    transport: Transport.TCP,
    options: { port: 3001 },
  })
  private microService: ClientProxy;
  private enableMicroService: boolean;

  constructor(private readonly appService: AppService) {
    this.enableMicroService = process.env.ENABLE_MICRO_SERVICE === 'true';
  }

  async onModuleInit() {
    if (this.enableMicroService) {
      try {
        await this.microService.connect();
        console.log('Connected to microservice');
      } catch (error) {
        console.error('Failed to connect to microservice:', error);
      }
    } else {
      console.log('Microservice is disabled.');
    }
  }

  @Loader()
  loader(
    @ReactRouterArgs() args: LoaderFunctionArgs,
    @Req() req: Request,
    @Test() test: string,
    @Query('name') name?: string,
  ) {
    return {
      message: this.appService.getHello(name) + ', now: ' + Date.now(),
      loadData: new Promise<string>((res) => {
        setTimeout(() => res(`loaded success, now: ${Date.now()}`), 2000);
      }),
      sumFromMicroService: this.enableMicroService
        ? lastValueFrom<number>(
            this.microService.send('sum', [1, 2, 3, 4, 5, 6, 8]),
          )
        : Promise.resolve('Try using script: yarn start:dev:microservice'),
    };
  }

  @Action()
  action(@Body() body: LoginDto) {
    if (this.appService.login(body)) {
      return redirect('/foo');
    }
    return { msg: 'The username or password is incorrect' };
  }

  @Action.Patch()
  patch() {
    return '[patch]: returned by server side';
  }

  @Action.Delete()
  delete() {
    return '[delete]: returned by server side';
  }
}

export const useIndexServer = (args: LoaderFunctionArgs) =>
  useServer(IndexBackend)(args);
