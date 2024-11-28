import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GlobalResponse } from './global.response';

export class GlobalInterceptor<T> implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    return next.handle().pipe(
      map(async (data: any) => {
        if (data == null) return;
        const ctx = context.switchToHttp();
        const request: Request = ctx.getRequest();
        // react-router is not used GlobalResponse
        if (request.handleByReactRouter) {
          return data;
        }
        return new GlobalResponse(data, 200, true).toPlainObject();
      }),
    );
  }
}
