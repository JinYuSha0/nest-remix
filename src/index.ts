import type { AppLoadContext, Params } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import type { RemixService } from "server/remix.service";
import type { ServeStaticOptions } from "@nestjs/platform-express/interfaces/serve-static-options.interface";
import type * as core from "express-serve-static-core";
import path from "path";

export {
  Loader,
  Action,
  useAction,
  useLoader,
  useServer,
  ReactRouterArgs,
  ReactRouterArgs as RemixArgs,
  resolveReactRouterServices,
  resolveReactRouterServices as resolveRemixServices,
  startNestReactRouter,
  startNestReactRouter as startNestRemix,
  type ReactRouterError,
  ReactRouterException,
  type ReactRouterError as RemixError,
  ReactRouterException as RemixException,
} from "./server";

export interface ReactRouterLoadContext extends AppLoadContext {
  moduleKey: string;
  moduleRef: RemixService;
  req: Request;
  res: Response;
  next: NextFunction;
}

export type ReactRouterConfig = {
  clientDir: string;
  serverFile: string;
  clientFileOptions: ServeStaticOptions;
};

export const defaultRemixConfig: ReactRouterConfig = {
  clientDir: path.join(process.cwd(), "/build/client"),
  serverFile: path.join(process.cwd(), "/build/server/index.mjs"),
  clientFileOptions: { immutable: true, maxAge: "1d" },
};

declare global {
  namespace Express {
    interface Request {
      handleByReactRouter?: boolean;
      reactRouterArgs?: LoaderFunctionArgs | ActionFunctionArgs;
      reactRouterParams?: Params;
    }
  }

  interface Request extends core.Request {}

  interface Response extends core.Response {}

  type NextFunction = core.NextFunction;
}
