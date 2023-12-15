import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { GlobalResponse } from './global.response';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    if (process.env.NODE_ENV === 'development') {
      console.error(exception);
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request: Request = ctx.getRequest();
    const status = exception.getStatus ? exception.getStatus() : 500;

    let code = status;
    let msg: string | object = exception.message;

    // Judge is handled by remix
    if (request.method === 'GET' && request.handleByRemix) {
      if (exception instanceof Response) {
        throw exception;
      }
      throw new Response(null, {
        status: status,
        statusText: msg as string,
      });
    }

    if (exception instanceof BadRequestException) {
      msg = (exception.getResponse() as Record<string, object>)
        .message as string[];
    }

    if (status === 500 && process.env.NODE_ENV !== 'development') {
      msg = 'System internal exception';
    }

    const errorResponse = new GlobalResponse({ msg }, code, false);

    response.status(status);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send(errorResponse.toPlainObject());
  }
}
