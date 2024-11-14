import type { NestApplication } from "@nestjs/core";
import type { Type } from "@nestjs/common";
import type {
  LoaderFunction,
  ActionFunction,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "@remix-run/node";
import type { NestContainer } from "@nestjs/core/injector/container";
import type { RemixLoadContext, RemixConfig } from "index";
import type { ViteDevServer } from "vite";
import { ExternalContextCreator } from "@nestjs/core";
import { RequestMethod } from "@nestjs/common/enums";
import { IS_DEV, isConstructor } from "./remix.helper";
import { remixMiddleware } from "./remix.middleware";
import { defaultRemixConfig } from "index";
import { ROUTE_ARGS_METADATA } from "@nestjs/common/constants";
import { RemixRouteParamsFactory } from "./remix.route.params.factory";
import bodyParser from "body-parser";

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

export let viteDevServer: ViteDevServer;
let remixExecutionContextCreator: ExternalContextCreator;
const remixRouteParamsFactory = new RemixRouteParamsFactory();

const getProviderName = (type: Type | string) =>
  typeof type === "string" ? type : type.name;

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
  return async (args: LoaderFunctionArgs | ActionFunctionArgs) => {
    const { moduleRef, req, res, next } = args.context as RemixLoadContext;
    req.remixArgs = args;
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

    const _remixExecutionContextCreator: ExternalContextCreator =
      remixExecutionContextCreator ?? global.remixExecutionContext;

    const executionContext = await _remixExecutionContextCreator.create(
      instance,
      instance[methodName],
      methodName,
      ROUTE_ARGS_METADATA,
      remixRouteParamsFactory
    );

    return executionContext(req, res, next);
  };
};

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

  remixExecutionContextCreator =
    ExternalContextCreator.fromContainer(container);

  if (IS_DEV) {
    global.remixExecutionContext = remixExecutionContextCreator;
  }
};

export const useLoader = (type: Type) =>
  useDecorator(type, RemixProperty.Loader) as LoaderFunction;
export const useAction = (type: Type) =>
  useDecorator(type, RemixProperty.ActionAll) as ActionFunction;
