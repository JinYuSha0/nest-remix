import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@remix-run/node';
import { Body, Injectable, Query, Req } from '@nestjs/common';
import { Loader, Action, RemixArgs, useAction, useLoader } from 'nestjs-remix';
import { AppService } from '~/modules/app/app.service';
import { LoginDto } from '~/modules/app/dto/login.dto';
import { Test } from '~/common/test.decorator';

@Injectable()
export class IndexBackend {
  constructor(private readonly appService: AppService) {}

  @Loader()
  loader(
    @RemixArgs() args: LoaderFunctionArgs,
    @Req() req: Request,
    @Test() test: string,
    @Query('name') name?: string,
  ) {
    return { message: this.appService.getHello(name) + ', now: ' + Date.now() };
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

export const useIndexLoader = (args: LoaderFunctionArgs) =>
  useLoader(IndexBackend)(args);

export const useIndexAction = (args: ActionFunctionArgs) =>
  useAction(IndexBackend)(args);
