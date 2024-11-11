import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";

@Injectable()
export class RemixService {
  constructor(private readonly moduleRef: ModuleRef) {}

  public get(serviceName: string) {
    const instance = this.moduleRef.get(serviceName, { strict: false });
    return instance;
  }
}
