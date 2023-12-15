import { Injectable, Req, ForbiddenException, UseGuards } from '@nestjs/common';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Loader, Action, useAction, useLoader } from 'nestjs-remix/server';
import { AppService } from '~/modules/app/app.service';
import { UserAuthGuard } from '~/common/user.auth.guard';

@Injectable()
@UseGuards(new UserAuthGuard({}))
export class FooBackend {
  constructor(private readonly appService: AppService) {}

  @Loader()
  loader(@Req() req: Request) {
    throw new ForbiddenException();
  }

  @Action()
  action() {}
}

export const useFooLoader = (args: LoaderFunctionArgs) =>
  useLoader(FooBackend)(args);

export const useFooAction = (args: ActionFunctionArgs) =>
  useAction(FooBackend)(args);
