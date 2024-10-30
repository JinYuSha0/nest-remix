import type { ModuleMetadata } from "@nestjs/common";
import type { RemixConfig } from "./remix.config";
import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { buildRemixConfigProvider } from "./remix.config";
import { RemixController } from "./remix.controller";

export type ProcessMetadata = <T extends ModuleMetadata>(metadata: T) => T;

export const RemixModule = (
  metadata: ModuleMetadata & RemixConfig,
  processMetadata: ProcessMetadata = (metadata) => metadata
) => {
  const controllers = metadata.controllers ?? [];
  if (!metadata.useCustomController) {
    controllers.push(RemixController);
  }
  return Module(
    processMetadata({
      imports: [
        ...(metadata.imports ?? []),
        ServeStaticModule.forRoot(
          {
            rootPath: metadata.browserBuildDir,
            serveRoot: "/",
            serveStaticOptions: {
              setHeaders(res, pathname) {
                const relativePath = pathname.replace(
                  metadata.browserBuildDir,
                  ""
                );
                res.setHeader(
                  "Cache-Control",
                  relativePath.startsWith(metadata.browserBuildDir)
                    ? "public, max-age=31536000, immutable"
                    : "public, max-age=3600"
                );
              },
            },
          },
          ...(metadata.staticDirs ?? [])
        ),
      ],
      controllers: controllers,
      providers: [
        ...(metadata.providers ?? []),
        buildRemixConfigProvider(metadata),
      ],
      exports: [...(metadata.exports ?? [])],
    })
  );
};
