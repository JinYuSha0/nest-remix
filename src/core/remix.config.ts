import type { ValueProvider } from "@nestjs/common";
import type { ServeStaticModuleOptions } from "@nestjs/serve-static";
import * as path from "path";
import { Inject } from "@nestjs/common";

const REMIX_CONFIG = "REMIX_CONFIG";

export const InjectRemixConfig = () => Inject(REMIX_CONFIG);

export const buildRemixConfigProvider = (config: RemixConfig) => {
  return {
    provide: REMIX_CONFIG,
    useValue: {
      remixServerDir:
        config.remixServerDir ??
        path.join(process.cwd(), "./dist/routes/server"),
      browserBuildDir: config.browserBuildDir,
      useCustomController: config.useCustomController ?? "RemixController",
      isStaticAsset: config.isStaticAsset,
    } as RemixConfig,
  } as ValueProvider;
};

export type RemixConfig = {
  remixServerDir: string;
  browserBuildDir: string;
  staticDirs?: ServeStaticModuleOptions[];
  useCustomController?: string;
  isStaticAsset?: (request: Request) => boolean;
};
