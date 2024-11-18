const generateRemixException = (message: string, code: number) =>
  new Response(JSON.stringify({ message, code, success: false }), {
    status: code,
    statusText: message,
    headers: {
      'Content-Type': 'application/json',
    },
  });

export const RemixUnauthorizedException = (message?: string) =>
  generateRemixException(message ?? 'Unauthorized', 401);
export const RemixForbiddenException = (message?: string) =>
  generateRemixException(message ?? 'Forbidden', 403);
