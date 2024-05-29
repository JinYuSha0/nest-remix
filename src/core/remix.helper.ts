import type { Type } from "@nestjs/common";

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
  try {
    return await Function(`return import("${filepath}")`)();
  } catch (err) {}

  try {
    return require(filepath);
  } catch (err) {}
  return null;
};
