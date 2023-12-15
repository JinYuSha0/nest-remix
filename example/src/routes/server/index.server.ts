import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Body, Injectable, Query, Req } from '@nestjs/common';
import {
  Loader,
  Action,
  RemixArgs,
  useAction,
  useLoader,
} from 'nestjs-remix/server';
import { AppService } from '~/modules/app/app.service';
import { LoginDto } from '~/modules/app/dto/login.dto';

@Injectable()
export class IndexBackend {
  constructor(private readonly appService: AppService) {}

  @Loader()
  loader(
    @RemixArgs() args: LoaderFunctionArgs,
    @Req() req: Request,
    @Query('name') name?: string,
  ) {
    return { message: this.appService.getHello(name), a: { b: { c: 1 } } };
  }

  @Action()
  action(@Body() body: LoginDto) {
    console.log(body);
    return {};
  }
}

export const useIndexLoader = (args: LoaderFunctionArgs) =>
  useLoader(IndexBackend)(args);

export const useIndexAction = (args: ActionFunctionArgs) =>
  useAction(IndexBackend)(args);
