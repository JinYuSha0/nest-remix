import type { Type } from "@nestjs/common";
import awaitImport from "await-import-dont-compile";
import { pathToFileURL } from "url";

export const isConstructor = (type: any): type is Type => {
  try {
    new type();
  } catch (err) {
    if ((err as Error).message.indexOf("is not a constructor") > -1) {
      return false;
    }
  }
  return true;
};

export const dynamicImport = async (filepath: string) => {
  let href = pathToFileURL(filepath).href;
  // dynamic import have a cache, will cause the remix page not to be updated
  if (process.env.NODE_ENV !== "production") {
    href += `?d=${Date.now()}`;
  }
  return await awaitImport(href);
};

export const delay = (ms: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};
