import type { Params } from "@remix-run/react";
import type * as core from "express-serve-static-core";

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
      remixParams?: Params;
    }
  }

  interface Request extends core.Request {}

  interface Response extends core.Response {}
}
