import { ReactRouterException } from 'nest-react-router';

export const ReactRouterUnauthorizedException = (message?: string) =>
  new ReactRouterException(message ?? 'Unauthorized', 401);
export const ReactRouterForbiddenException = (message?: string) =>
  new ReactRouterException(message ?? 'Forbidden', 403);
