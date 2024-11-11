import type { Params } from "@remix-run/react";
import type { AppLoadContext } from "@remix-run/server-runtime/dist/data.d";
import type { RemixService } from "core/remix.service";
import type { ServeStaticOptions } from "@nestjs/platform-express/interfaces/serve-static-options.interface";
import type * as core from "express-serve-static-core";
import path from "path";

export {
  RemixService,
  Loader,
  Action,
  RemixArgs,
  startNestRemix,
  useAction,
  useLoader,
} from "./server";

export interface RemixLoadContext extends AppLoadContext {
  moduleKey: string;
  moduleRef: RemixService;
  req: Request;
  res: Response;
  next: NextFunction;
}

export type RemixConfig = {
  remixClientDir: string;
  remixServerFile: string;
  remixClientFileOptions: ServeStaticOptions;
};

export const defaultRemixConfig: RemixConfig = {
  remixClientDir: path.join(process.cwd(), "/build/client"),
  remixServerFile: path.join(process.cwd(), "/build/server/index.js"),
  remixClientFileOptions: { immutable: true, maxAge: "1d" },
};

declare global {
  namespace Express {
    interface Request {
      handleByRemix?: boolean;
      remixParams?: Params;
    }
  }

  interface Request extends core.Request {}

  interface Response extends core.Response {}

  type NextFunction = core.NextFunction;
}
