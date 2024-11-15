import { INJECTABLE_WATERMARK } from "@nestjs/common/constants";
import * as path from "path";
import fs from "fs";
import { RemixService } from "./remix.service";

// Related link: https://vite.dev/guide/features#dynamic-import
function hackDynamicImport(file: string) {
  return new Function("require", "file", "return require(file)")(require, file);
}

function filterServices(module: { [x: string]: any }) {
  return Object.keys(module)
    .map((key) => module[key])
    .filter((property) => Reflect.hasMetadata(INJECTABLE_WATERMARK, property));
}

function scanRemixServerDir(remixServerDir: string) {
  const files = fs.readdirSync(remixServerDir);
  const allServices = [];
  for (const file of files) {
    if (path.parse(file).ext === ".js") {
      try {
        const module = hackDynamicImport(path.join(remixServerDir, file));
        const services = filterServices(module);
        allServices.push(...services);
      } catch (err) {
        console.error(`dynamic import file ${file} failed`, err);
      }
    }
  }
  return allServices.map((useClass) => ({
    provide: useClass.name,
    useClass,
  }));
}

export function resolveRemixServices(remixServerDir: string) {
  return [RemixService, ...scanRemixServerDir(remixServerDir)];
}
