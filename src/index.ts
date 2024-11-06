import type { Params } from "@remix-run/react";

export {
  RemixModule,
  RemixController,
  Loader,
  Action,
  RemixArgs,
  startNestRemix,
  useAction,
  useLoader,
} from "./server";

declare global {
  namespace Express {
    interface Request {
      handleByRemix?: boolean;
      handleByVite?: boolean;
      remixParams?: Params;
    }
  }

  interface Request extends Express.Request {}

  interface Response extends Express.Response {}
}
