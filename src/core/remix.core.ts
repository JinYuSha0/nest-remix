import type { NestApplication } from "@nestjs/core";
import type { HttpServer, CanActivate, ArgumentMetadata } from "@nestjs/common";
import type { ApplicationConfig } from "@nestjs/core/application-config";
import type { NextFunction } from "express-serve-static-core";
import type { PipeTransform, Type, RouteParamMetadata } from "@nestjs/common";
import type {
  LoaderFunction,
  ActionFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import type { NestContainer } from "@nestjs/core/injector/container";
import type { RemixLoadContext, RemixConfig } from "index";
import type { ParamProperties } from "@nestjs/core/helpers/context-utils";
import type { HandlerMetadata } from "@nestjs/core/helpers/handler-metadata-storage";
import type { RouterProxyCallback } from "@nestjs/core/router/router-proxy";
import type { ExceptionsHandler } from "@nestjs/core//exceptions/exceptions-handler";
import type { Controller } from "@nestjs/common/interfaces";
import type { ViteDevServer } from "vite";
import { lastValueFrom, isObservable } from "rxjs";
import {
  CUSTOM_ROUTE_ARGS_METADATA,
  HEADERS_METADATA,
  HTTP_CODE_METADATA,
  ROUTE_ARGS_METADATA,
} from "@nestjs/common/constants";
import { ForbiddenException } from "@nestjs/common/exceptions";
import { RequestMethod } from "@nestjs/common/enums";
import { IS_DEV, isConstructor } from "./remix.helper";
import { RouteParamsFactory } from "@nestjs/core/router/route-params-factory";
import { ContextUtils } from "@nestjs/core/helpers/context-utils";
import { RouterExceptionFilters } from "@nestjs/core/router/router-exception-filters";
import { PipesConsumer, PipesContextCreator } from "@nestjs/core/pipes";
import {
  GuardsConsumer,
  GuardsContextCreator,
  FORBIDDEN_MESSAGE,
} from "@nestjs/core/guards";
import {
  InterceptorsConsumer,
  InterceptorsContextCreator,
} from "@nestjs/core/interceptors";
import {
  CustomHeader,
  RouterResponseController,
} from "@nestjs/core/router/router-response-controller";
import { RouteParamtypes } from "@nestjs/common/enums/route-paramtypes.enum";
import { CUSTOM_PARAM_TYPE } from "./remix.constant";
import { HandlerMetadataStorage } from "@nestjs/core/helpers/handler-metadata-storage";
import { STATIC_CONTEXT } from "@nestjs/core/injector/constants";
import { ExecutionContextHost } from "@nestjs/core/helpers/execution-context-host";
import { RemixSimulateHost } from "./remix.simulate.host";
import { remixMiddleware } from "./remix.middleware";
import { defaultRemixConfig } from "index";
import bodyParser from "body-parser";

const getProviderName = (type: Type | string) =>
  typeof type === "string" ? type : type.name;

export enum RemixProperty {
  Loader = "Loader",
  ActionAll = "Action",
  ActionPost = "Action.Post",
  ActionPut = "Action.Put",
  ActionPatch = "Action.Patch",
  ActionDelete = "Action.Delete",
  ActionOptions = "Action.Options",
  ActionHead = "Action.Head",
  ActionSearch = "Action.Search",
}

const getPropertyNameByRequest = (
  request: Request
): [RemixProperty, RequestMethod] => {
  switch (request.method) {
    case "GET":
      return [RemixProperty.Loader, RequestMethod.GET];
    case "POST":
      return [RemixProperty.ActionPost, RequestMethod.POST];
    case "PUT":
      return [RemixProperty.ActionPut, RequestMethod.PUT];
    case "PATCH":
      return [RemixProperty.ActionPatch, RequestMethod.PATCH];
    case "DELETE":
      return [RemixProperty.ActionDelete, RequestMethod.DELETE];
    case "OPTIONS":
      return [RemixProperty.ActionOptions, RequestMethod.OPTIONS];
    case "HEAD":
      return [RemixProperty.ActionHead, RequestMethod.HEAD];
    case "SEARCH":
      return [RemixProperty.ActionSearch, RequestMethod.SEARCH];
    default:
      return [RemixProperty.ActionAll, RequestMethod.ALL];
  }
};

type RemixDescriptor = Partial<{
  [key in RemixProperty]: string;
}>;

export const setRemixTypeDescriptor = (
  type: Type,
  methodName: string,
  property: RemixProperty
) =>
  Reflect.defineMetadata(
    "__RemixTypeDescriptor__",
    {
      ...getRemixTypeDescriptor(type),
      [property]: methodName,
    },
    type
  );

const getRemixTypeDescriptor = (type: Type): RemixDescriptor | undefined =>
  Reflect.getMetadata("__RemixTypeDescriptor__", type);

type ReturnFunction = LoaderFunction | ActionFunction;

export class RemixExecutionContext {
  public static instance: RemixExecutionContext;

  private readonly routeParamsFactory: RouteParamsFactory;
  private readonly pipesConsumer: PipesConsumer;
  private readonly pipesContextCreator: PipesContextCreator;
  private readonly guardsConsumer: GuardsConsumer;
  private readonly guardsContextCreator: GuardsContextCreator;
  private readonly interceptorsConsumer: InterceptorsConsumer;
  private readonly interceptorsContextCreator: InterceptorsContextCreator;
  private readonly responseController: RouterResponseController;
  private readonly handlerMetadataStorage: HandlerMetadataStorage;
  private readonly contextUtils: ContextUtils;

  constructor(
    container: NestContainer,
    config: ApplicationConfig,
    applicationRef: HttpServer
  ) {
    this.routeParamsFactory = new RouteParamsFactory();
    this.pipesConsumer = new PipesConsumer();
    this.pipesContextCreator = new PipesContextCreator(container, config);
    this.guardsConsumer = new GuardsConsumer();
    this.guardsContextCreator = new GuardsContextCreator(container, config);
    this.interceptorsConsumer = new InterceptorsConsumer();
    this.interceptorsContextCreator = new InterceptorsContextCreator(
      container,
      config
    );
    this.responseController = new RouterResponseController(applicationRef);
    this.handlerMetadataStorage = new HandlerMetadataStorage();
    this.contextUtils = new ContextUtils();
  }

  private createConcreteContext<T extends any[], R extends any[]>(
    metadata: T
  ): R {
    if (!metadata?.length) {
      return [] as R;
    }
    return (metadata ?? [])
      .filter((pipe: any) => pipe && (pipe.name || pipe.transform))
      .filter(
        (pipe) => pipe && pipe.transform && typeof pipe.transform === "function"
      ) as R;
  }

  private exchangeKeysForValues(
    keys: string[],
    metadata: Record<
      string,
      RouteParamMetadata & {
        pipes: (PipeTransform<any, any> | Type<PipeTransform<any, any>>)[];
        factory: (...args: unknown[]) => void;
      }
    >,
    contextFactory?: (args: unknown[]) => ExecutionContextHost
  ): ParamProperties[] {
    return keys.map((key) => {
      const { index, data, pipes: pipesCollection } = metadata[key];
      const pipes = this.createConcreteContext(pipesCollection);
      const type = this.contextUtils.mapParamType(key);

      if (key.includes(CUSTOM_ROUTE_ARGS_METADATA)) {
        const { factory } = metadata[key];
        const customExtractValue = this.contextUtils.getCustomFactory(
          factory,
          data,
          contextFactory
        );
        return { index, extractValue: customExtractValue, type, data, pipes };
      }
      const numericType = isNaN(+type)
        ? CUSTOM_PARAM_TYPE.REMIX_ARGS
        : Number(type);
      const extractValue = (req, res, next) =>
        this.routeParamsFactory.exchangeKeyForValue(numericType, data, {
          req,
          res,
          next,
        });
      return { index, extractValue, type: numericType, data, pipes };
    });
  }

  private isPipeable(type: number | string): boolean {
    return (
      type === RouteParamtypes.BODY ||
      type === RouteParamtypes.QUERY ||
      type === RouteParamtypes.PARAM ||
      type === RouteParamtypes.FILE ||
      type === RouteParamtypes.FILES ||
      typeof type === "string"
    );
  }

  private async getParamValue<T>(
    value: T,
    { metatype, type, data }: ArgumentMetadata,
    pipes: PipeTransform[]
  ): Promise<unknown> {
    if (pipes?.length) {
      return this.pipesConsumer.apply(value, { metatype, type, data }, pipes);
    }
    return value;
  }

  private createPipesFn(
    pipes: PipeTransform[],
    paramsOptions: (ParamProperties & { metatype?: Type<any> })[],
    dataFuncArgs: LoaderFunctionArgs
  ) {
    const pipesFn = async <TRequest, TResponse>(
      args: any[],
      req: TRequest,
      res: TResponse,
      next: Function
    ) => {
      const resolveParamValue = async (
        param: ParamProperties & { metatype?: Type<any> }
      ) => {
        const {
          index,
          extractValue,
          type,
          data,
          metatype,
          pipes: paramPipes,
        } = param;
        if (type === CUSTOM_PARAM_TYPE.REMIX_ARGS) {
          args[index] = dataFuncArgs;
        } else {
          const value = extractValue(req, res, next);
          args[index] = this.isPipeable(type)
            ? await this.getParamValue(
                value,
                { metatype, type, data: data as string },
                pipes.concat(paramPipes)
              )
            : value;
        }
      };
      await Promise.all(paramsOptions.map(resolveParamValue));
    };
    return paramsOptions.length ? pipesFn : null;
  }

  private reflectHttpStatusCode(
    callback: (...args: unknown[]) => unknown
  ): number {
    return Reflect.getMetadata(HTTP_CODE_METADATA, callback);
  }

  private reflectResponseHeaders(
    callback: (...args: unknown[]) => unknown
  ): CustomHeader[] {
    return Reflect.getMetadata(HEADERS_METADATA, callback) || [];
  }

  private createGuardsFn(
    guards: CanActivate[],
    instance: Controller,
    callback: (...args: any[]) => any,
    contextType?: "http"
  ): (args: any[]) => Promise<void> | null {
    const canActivateFn = async (args: any[]) => {
      const canActivate = await this.guardsConsumer.tryActivate(
        guards,
        args,
        instance,
        callback,
        contextType
      );
      if (!canActivate) {
        throw new ForbiddenException(FORBIDDEN_MESSAGE);
      }
    };
    return guards.length ? canActivateFn : null;
  }

  private getMetadata(
    instance: Controller,
    callback: (...args: any[]) => any,
    methodName: string,
    moduleKey: string,
    requestMethod: RequestMethod,
    contextType: "http"
  ): HandlerMetadata {
    const cacheMetadata = this.handlerMetadataStorage.get(instance, methodName);
    if (cacheMetadata) {
      return cacheMetadata;
    }
    const metadata =
      this.contextUtils.reflectCallbackMetadata(
        instance,
        methodName,
        ROUTE_ARGS_METADATA
      ) || {};
    const keys = Object.keys(metadata);
    const argsLength = this.contextUtils.getArgumentsLength(keys, metadata);
    const paramtypes = this.contextUtils.reflectCallbackParamtypes(
      instance,
      methodName
    );
    const contextFactory = this.contextUtils.getContextFactory(
      contextType,
      instance,
      callback
    );
    const getParamsMetadata = (
      moduleKey: string,
      contextId = STATIC_CONTEXT,
      inquirerId?: string
    ) => this.exchangeKeysForValues(keys, metadata, contextFactory);

    const httpCode = this.reflectHttpStatusCode(callback);
    const httpStatusCode = httpCode
      ? httpCode
      : this.responseController.getStatusByMethod(requestMethod);

    const responseHeaders = this.reflectResponseHeaders(callback);
    const hasCustomHeaders = responseHeaders?.length > 0;
    const handlerMetadata: HandlerMetadata = {
      argsLength,
      paramtypes,
      getParamsMetadata,
      httpStatusCode,
      hasCustomHeaders,
      responseHeaders,
      fnHandleResponse: () => {},
    };
    this.handlerMetadataStorage.set(instance, methodName, handlerMetadata);
    return handlerMetadata;
  }

  private transformToResult(resultOrDeferred: unknown) {
    if (isObservable(resultOrDeferred)) {
      return lastValueFrom(resultOrDeferred);
    }
    return resultOrDeferred;
  }

  public async create(
    property: RemixProperty,
    instance: Controller,
    methodName: string,
    requestMethod: RequestMethod,
    context: RemixLoadContext,
    dataFuncArgs: LoaderFunctionArgs
  ) {
    const { moduleKey } = context;
    const callback = instance[methodName];
    const contextType = "http";
    const {
      argsLength,
      paramtypes,
      getParamsMetadata,
      httpStatusCode,
      responseHeaders,
      hasCustomHeaders,
    } = this.getMetadata(
      instance,
      callback,
      methodName,
      moduleKey,
      requestMethod,
      contextType
    );
    const paramsOptions = this.contextUtils.mergeParamsMetatypes(
      getParamsMetadata(moduleKey),
      paramtypes
    );
    const pipes = this.pipesContextCreator.create(
      instance,
      callback,
      moduleKey,
      STATIC_CONTEXT,
      undefined
    );
    const guards = this.guardsContextCreator.create(
      instance,
      callback,
      moduleKey,
      STATIC_CONTEXT,
      undefined
    );
    const interceptors = this.interceptorsContextCreator.create(
      instance,
      callback,
      moduleKey,
      STATIC_CONTEXT,
      undefined
    );
    const fnCanActivate = this.createGuardsFn(
      guards,
      instance,
      callback,
      contextType
    );
    const fnApplyPipes = this.createPipesFn(pipes, paramsOptions, dataFuncArgs);
    const handler =
      (args: any[], req: Request, res: Response, next: NextFunction) =>
      async () => {
        fnApplyPipes && (await fnApplyPipes(args, req, res, next));
        return callback.apply(instance, args);
      };
    return async (req: Request, res: Response, next: NextFunction) => {
      const args = this.contextUtils.createNullArray(argsLength);

      fnCanActivate && (await fnCanActivate([req, res, next]));

      this.responseController.setStatus(res, httpStatusCode);
      hasCustomHeaders &&
        this.responseController.setHeaders(res, responseHeaders);

      const result = await this.interceptorsConsumer.intercept(
        interceptors,
        [req, res, next],
        instance,
        callback,
        handler(args, req, res, next),
        contextType
      );

      return this.transformToResult(result);
    };
  }
}

export class RemixExceptionsFilter {
  public static instance: RemixExceptionsFilter;

  private routerExceptionFilters: RouterExceptionFilters;

  constructor(container: NestContainer, config: ApplicationConfig) {
    const httpAdapterRef = container.getHttpAdapterRef();
    this.routerExceptionFilters = new RouterExceptionFilters(
      container,
      config,
      httpAdapterRef
    );
  }

  public create(
    instance: Controller,
    callback: RouterProxyCallback,
    moduleKey: string,
    contextId = STATIC_CONTEXT,
    inquirerId?: string
  ): ExceptionsHandler {
    return this.routerExceptionFilters.create(
      instance,
      callback,
      moduleKey,
      contextId,
      inquirerId
    );
  }

  public static createProxy(
    targetCallback: RouterProxyCallback,
    exceptionsHandler: ExceptionsHandler
  ) {
    return async (req: Request, res: Response, next: () => void) => {
      try {
        return await targetCallback(req, res, next);
      } catch (e) {
        const host = new RemixSimulateHost(req);
        exceptionsHandler.next(e, host);
        return host.toRemix();
      }
    };
  }
}

const useDecorator = (
  typeOrDescriptor: Type | RemixDescriptor,
  property: RemixProperty,
  typeName?: string
): ReturnFunction => {
  if (isConstructor(typeOrDescriptor)) {
    const descriptor = getRemixTypeDescriptor(typeOrDescriptor);
    let hasProperty = true;
    if (property === RemixProperty.Loader) {
      hasProperty = !!descriptor?.[RemixProperty.Loader];
    } else {
      hasProperty =
        !!descriptor?.[property] || !!descriptor?.[RemixProperty.ActionAll];
    }
    if (!descriptor || !hasProperty) {
      throw new Error(
        `No method found using @${property} decorator on class ${typeOrDescriptor.name}`
      );
    }
    return useDecorator(
      descriptor,
      property,
      typeName ?? typeOrDescriptor.name
    );
  }
  return async (args: LoaderFunctionArgs) => {
    const { moduleRef, req, res, next } = args.context as RemixLoadContext;
    req.remixParams = args.params;
    const providerName = getProviderName(typeName);
    const instance = moduleRef.get(providerName);
    const [requestProperty, requestMethod] = getPropertyNameByRequest(
      args.context.req as Request
    );
    if (property !== RemixProperty.Loader) {
      property = requestProperty;
    }
    const methodName =
      typeOrDescriptor[property] ?? typeOrDescriptor[RemixProperty.ActionAll]!;

    const remixExecutionContext =
      RemixExecutionContext.instance ?? global.remixExecutionContext;
    const remixExceptionsFilter =
      RemixExceptionsFilter.instance ?? global.remixExceptionsFilter;

    const executionContext = await remixExecutionContext.create(
      property,
      instance,
      methodName,
      requestMethod,
      args.context as RemixLoadContext,
      args
    );

    const exceptionFilter = remixExceptionsFilter.create(
      instance,
      instance[methodName],
      (args.context as RemixLoadContext).moduleKey,
      STATIC_CONTEXT,
      undefined
    );

    return RemixExceptionsFilter.createProxy(
      executionContext as RouterProxyCallback,
      exceptionFilter
    )(req, res, next);
  };
};

export let viteDevServer: ViteDevServer;

export const startNestRemix = async (
  app: NestApplication,
  remixConfig: RemixConfig = defaultRemixConfig
) => {
  // client static file middleware
  app.useStaticAssets(
    remixConfig.remixClientDir,
    remixConfig.remixClientFileOptions
  );

  // vite middleware (DEV only)
  if (IS_DEV) {
    if (!viteDevServer) {
      viteDevServer = await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        })
      );
      app.use(viteDevServer.middlewares);
    }
  }

  // remix middleware
  app.use(bodyParser.urlencoded(), await remixMiddleware(app, remixConfig));

  const container = (app as any).container as NestContainer;
  const config = (app as any).config as ApplicationConfig;
  const httpAdapterRef = container.getHttpAdapterRef();
  RemixExecutionContext.instance = new RemixExecutionContext(
    container,
    config,
    httpAdapterRef
  );
  RemixExceptionsFilter.instance = new RemixExceptionsFilter(container, config);
  if (IS_DEV) {
    global.remixExecutionContext = RemixExecutionContext.instance;
    global.remixExceptionsFilter = RemixExceptionsFilter.instance;
  }
};

export const useLoader = (type: Type) =>
  useDecorator(type, RemixProperty.Loader) as LoaderFunction;
export const useAction = (type: Type) =>
  useDecorator(type, RemixProperty.ActionAll) as ActionFunction;
