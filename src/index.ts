export { RemixModule } from "./core/remix.module";
export { Loader, Action, RemixArgs } from "./core/remix.decorator";
export { startNestRemix } from "./core/remix.core";
export { RemixController } from "./core/remix.controller";

declare global {
  namespace Express {
    interface Request {
      handleByRemix?: boolean;
    }
  }

  interface Request extends Express.Request {}

  interface Response extends Express.Response {}
}
