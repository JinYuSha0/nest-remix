import { RemixException } from 'nest-react-router';

export const RemixUnauthorizedException = (message?: string) =>
  new RemixException(message ?? 'Unauthorized', 401);
export const RemixForbiddenException = (message?: string) =>
  new RemixException(message ?? 'Forbidden', 403);
