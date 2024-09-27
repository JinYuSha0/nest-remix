import { createParamDecorator } from '@nestjs/common';

export const Test = createParamDecorator((data, ctx) => {
  const request = ctx.switchToHttp().getRequest();
  return 'test';
});
