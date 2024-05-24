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

import { dynamicImportRemixBackend } from "./core/remix.dynamicImport";
dynamicImportRemixBackend();

declare global {
  namespace Express {
    interface Request {
      handleByRemix?: boolean;
    }
  }

  interface Request extends Express.Request {}

  interface Response extends Express.Response {}
}
