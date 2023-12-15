import { json as remixJson, redirect as remixRedirect } from "@remix-run/node";
import type { ArgumentsHost, ContextType } from "@nestjs/common";
import type {
  RpcArgumentsHost,
  HttpArgumentsHost,
  WsArgumentsHost,
} from "@nestjs/common/interfaces";
import type { Type } from "@nestjs/common/interfaces";
import type { HttpAdapterHost } from "@nestjs/core/helpers/http-adapter-host";

const noop = () => {};

class RemixSimulateResponse {
  private _redirect?: string;
  private _status: number;
  private _headers: Record<string, string> = {};
  private _body: any;

  status(status: number) {
    this._status = status;
    return this;
  }

  set(field: string, value: string) {
    this._headers[field] = value;
    return this;
  }

  header(field: string, value: string) {
    return this.set(field, value);
  }

  send(body: any) {
    this._body = body;
    return this;
  }

  json(body: any) {
    return this.send(body);
  }

  redirect(path: string) {
    this._redirect = path;
    return this;
  }

  toRemix() {
    if (this._redirect) {
      return remixRedirect(this._redirect, {
        status: this._status ?? 302,
        headers: this._headers,
      });
    }
    return remixJson(this._body, {
      status: this._status,
      headers: this._headers,
    });
  }
}

// todo HttpAdapterHost
export class RemixSimulateHost implements ArgumentsHost {
  private contextType = "http";
  private response: RemixSimulateResponse;
  private isArgsHost: boolean = false;

  constructor(
    private readonly request: Request,
    private readonly constructorRef: Type<any> = null,
    private readonly handler: Function = null
  ) {
    this.response = new RemixSimulateResponse();
  }

  getArgs<T extends any[] = any[]>(): T {
    return [this.request, this.response, noop] as T;
  }
  getArgByIndex<T = any>(index: number): T {
    return this.getArgs()[index] as T;
  }
  switchToRpc(): RpcArgumentsHost {
    throw new Error("Method not implemented.");
  }
  switchToHttp(): HttpArgumentsHost {
    this.isArgsHost = true;
    return Object.assign(this, {
      getRequest: () => this.getArgByIndex(0),
      getResponse: () => this.getArgByIndex(1),
      getNext: () => this.getArgByIndex(2),
    });
  }
  switchToWs(): WsArgumentsHost {
    throw new Error("Method not implemented.");
  }
  getType<TContext extends string = ContextType>(): TContext {
    return this.contextType as TContext;
  }
  toRemix() {
    if (this.isArgsHost) {
      return this.response.toRemix();
    } else {
      return null;
    }
  }
}
