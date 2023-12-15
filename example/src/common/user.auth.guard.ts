import { redirect } from '@remix-run/node';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class UserAuthGuard implements CanActivate {
  private readonly redirectUrl?: string;

  constructor(options?: { redirectUrl?: string }) {
    this.redirectUrl = options?.redirectUrl;
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    if (this.redirectUrl != null && req.method === 'GET' && req.handleByRemix) {
      throw redirect(this.redirectUrl);
    }
    return false;
  }
}
