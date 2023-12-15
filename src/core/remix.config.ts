import type { ValueProvider } from "@nestjs/common";
import type { ServeStaticModuleOptions } from "@nestjs/serve-static";
import { Inject } from "@nestjs/common";

const REMIX_CONFIG = "REMIX_CONFIG";

export const InjectRemixConfig = () => Inject(REMIX_CONFIG);

export const buildRemixConfigProvider = (config: RemixConfig) => {
  return {
    provide: REMIX_CONFIG,
    useValue: {
      publicDir: config.publicDir,
      browserBuildDir: config.browserBuildDir,
      useCoustomController: config.useCoustomController ?? "RemixController",
      isStaticAsset: config.isStaticAsset,
    } as RemixConfig,
  } as ValueProvider;
};

export type RemixConfig = {
  publicDir: string;
  browserBuildDir: string;
  staticDirs?: ServeStaticModuleOptions[];
  useCoustomController?: string;
  isStaticAsset?: (request: Request) => boolean;
};
