import { Injectable, Query, Req } from '@nestjs/common';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Loader, Action, RemixArgs } from 'nestjs-remix';
import { useAction, useLoader } from 'nestjs-remix/server';
import { AppService } from '~/app.service';

@Injectable()
export class IndexBackend {
  constructor(private readonly appService: AppService) {}

  @Loader()
  loader(
    @RemixArgs() args: LoaderFunctionArgs,
    @Req() req: Request,
    @Query('name') name?: string,
  ) {
    return { message: this.appService.getHello(name) };
  }

  @Action()
  action() {}
}

export const useIndexLoader = (args: LoaderFunctionArgs) =>
  useLoader(IndexBackend)(args);

export const useIndexAction = (args: ActionFunctionArgs) =>
  useAction(IndexBackend)(args);
