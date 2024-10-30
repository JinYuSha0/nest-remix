import type { AppLoadContext } from "@remix-run/server-runtime/dist/data.d";
import type { GetLoadContextFunction } from "@remix-run/express";
import type { NextFunction } from "express-serve-static-core";
import { type ViteDevServer } from "vite";
import path from "path";
import * as vmod from "@remix-run/dev/dist/vite/vmod";
import { All, Controller, Next, Req, Res } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core/injector/module-ref";
import { createRequestHandler } from "@remix-run/express";
import { InjectRemixConfig, RemixConfig } from "./remix.config";
import { hasAnotherMatch } from "./express.utils";
import { dynamicImport } from "./remix.helper";
import { ServerBuild } from "@remix-run/node";

const serverBuildId = vmod.id("server-build");

export interface RemixLoadContext extends AppLoadContext {
  moduleKey: string;
  moduleRef: ModuleRef;
  req: Request;
  res: Response;
  next: NextFunction;
}

@Controller("/")
export class RemixController {
  private viteDevServer?: ViteDevServer;

  constructor(
    @InjectRemixConfig() private readonly remixConfig: RemixConfig,
    private readonly moduleRef: ModuleRef
  ) {}

  @All("*")
  async handler(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction
  ) {
    if (this.isStaticAsset(req)) {
      return next();
    }

    this.purgeRequireCacheInDev();

    if (hasAnotherMatch(req)) {
      return next();
    }

    // Mark this request to be handled by remix
    req.handleByRemix = true;

    const getLoadContext: GetLoadContextFunction = (req) => {
      return {
        moduleRef: this.moduleRef,
        req,
        res,
        next,
      };
    };

    if (process.env.NODE_ENV !== "production") {
      if (!this.viteDevServer) {
        const vite = require("vite");
        this.viteDevServer = await vite.createServer({});
      }
      const build = (await this.viteDevServer.ssrLoadModule(
        serverBuildId
      )) as ServerBuild;
      return createRequestHandler({ build, getLoadContext })(req, res, next);
    } else {
      const serverBuildFile = path.join(
        this.remixConfig.remixServerDir,
        "index.js"
      );
      return createRequestHandler({
        // https://github.com/microsoft/TypeScript/issues/43329
        build: await dynamicImport(serverBuildFile),
        getLoadContext,
      })(req, res, next);
    }
  }

  private purgeRequireCacheInDev() {
    if (process.env.NODE_ENV === "production") return;

    for (const key in require.cache) {
      if (key.startsWith(this.remixConfig.browserBuildDir)) {
        delete require.cache[key];
      }
    }
  }

  private isStaticAsset(request: Request) {
    if (this.remixConfig.isStaticAsset) {
      return this.remixConfig.isStaticAsset(request);
    }

    return /^\/(build|assets)\//gi.test(request.url);
  }
}
