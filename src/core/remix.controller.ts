import type { AppLoadContext } from "@remix-run/server-runtime/dist/data.d";
import type { GetLoadContextFunction } from "@remix-run/express";
import type { NextFunction } from "express-serve-static-core";
import { All, Controller, Next, Req, Res } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core/injector/module-ref";
import { createRequestHandler } from "@remix-run/express";
import { InjectRemixConfig, RemixConfig } from "./remix.config";
import { hasAnotherMatch } from "./express.utils";

export interface RemixLoadContext extends AppLoadContext {
  moduleKey: string;
  moduleRef: ModuleRef;
  req: Request;
  res: Response;
  next: NextFunction;
}

@Controller("/")
export class RemixController {
  constructor(
    @InjectRemixConfig() private readonly remixConfig: RemixConfig,
    private moduleRef: ModuleRef
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

    return createRequestHandler({
      build: await import(this.remixConfig.browserBuildDir),
      getLoadContext,
    })(req, res, next);
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
