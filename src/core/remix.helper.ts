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
  return await awaitImport(pathToFileURL(filepath).href);
};
