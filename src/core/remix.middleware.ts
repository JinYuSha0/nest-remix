import type { ServerBuild } from "react-router";
import type { GetLoadContextFunction } from "@react-router/express";
import type { ReactRouterConfig } from "index";
import type { ServerRoute } from "./remix.type";
import { NestApplication } from "@nestjs/core";
import { viteDevServer } from "./remix.core";
import { createRequestHandler } from "@react-router/express";
import { RemixService } from "./remix.service";
import {
  createRoutes,
  dynamicImport,
  IS_DEV,
  matchServerRoutes,
} from "./remix.helper";

const serverBuildId = "virtual:react-router/server-build";

export const remixMiddleware = async (
  app: NestApplication,
  remixConfig: ReactRouterConfig
) => {
  let build: ServerBuild;
  let routes: ServerRoute[];

  const moduleRef = app.get(RemixService);

  if (!IS_DEV) {
    build = (await dynamicImport(remixConfig.serverFile)) as ServerBuild;
    routes = createRoutes(build.routes);
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (IS_DEV) {
        build = (await viteDevServer.ssrLoadModule(
          serverBuildId
        )) as ServerBuild;
        routes = createRoutes(build.routes);
      }

      const manifestUrl = `${build.basename ?? "/"}/__manifest`.replace(
        /\/+/g,
        "/"
      );

      if (
        matchServerRoutes(routes, req.url, build.basename) ||
        req.path === manifestUrl ||
        (req.path.endsWith(".data") &&
          matchServerRoutes(
            routes,
            req.path.replace(/\.data$/, "").replace(/^\/_root$/, "/"),
            build.basename
          ))
      ) {
        // Mark this request to be handled by react-router
        req.handleByReactRouter = true;
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
