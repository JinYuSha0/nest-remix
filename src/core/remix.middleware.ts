import type { ServerBuild } from "@remix-run/node";
import type { GetLoadContextFunction } from "@remix-run/express";
import type { RemixConfig } from "index";
import { NestApplication } from "@nestjs/core";
import { createRoutes } from "@remix-run/server-runtime/dist/routes";
import { matchServerRoutes } from "@remix-run/server-runtime/dist/routeMatching";
import { viteDevServer } from "./remix.core";
import { createRequestHandler } from "@remix-run/express";
import { RemixService } from "./remix.service";
import { dynamicImport, IS_DEV } from "./remix.helper";
import * as vmod from "@remix-run/dev/dist/vite/vmod";

const serverBuildId = vmod.id("server-build");

export const remixMiddleware = async (
  app: NestApplication,
  remixConfig: RemixConfig
) => {
  let build: ServerBuild;

  const moduleRef = app.get(RemixService);

  if (!IS_DEV) {
    build = (await dynamicImport(remixConfig.remixServerFile)) as ServerBuild;
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (IS_DEV) {
        build = (await viteDevServer.ssrLoadModule(
          serverBuildId
        )) as ServerBuild;
      }

      if (
        matchServerRoutes(createRoutes(build.routes), req.url, build.basename)
      ) {
        // Mark this request to be handled by remix
        req.handleByRemix = true;
        const getLoadContext: GetLoadContextFunction = (req) => {
          return {
            moduleRef,
            req,
            res,
            next,
          };
        };
        return createRequestHandler({
          build,
          getLoadContext,
        })(req, res, next);
      } else {
        next();
      }
    } catch (err) {
      next(err);
    }
  };
};
