import type { ParamData } from "@nestjs/common";
import { assignMetadata } from "@nestjs/common";
import { ROUTE_ARGS_METADATA } from "@nestjs/common/constants";
import { RemixProperty, setRemixTypeDescriptor } from "./remix.core";
import { isConstructor } from "./remix.helper";
import { RemixRouteParamtypes } from "./remix.constant";

function createRouteParamDecorator(paramtype: number) {
  return (data?: ParamData): ParameterDecorator =>
    (target, key, index) => {
      if (!key) return;
      const args =
        Reflect.getMetadata(ROUTE_ARGS_METADATA, target.constructor, key) || {};
      Reflect.defineMetadata(
        ROUTE_ARGS_METADATA,
        assignMetadata(args, paramtype, index, data),
        target.constructor,
        key
      );
    };
}

export const ReactRouterArgs = createRouteParamDecorator(
  RemixRouteParamtypes.REMIX_ARGS
);

function Decorator(...properties: RemixProperty[]) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const type = target.constructor;
    if (!isConstructor(type)) {
      return;
    }
    for (const property of properties) {
      setRemixTypeDescriptor(type, propertyKey, property);
    }
  };
}

export const Loader = () => Decorator(RemixProperty.Loader);
export function Action() {
  return Decorator(RemixProperty.ActionPost);
}
Action.Post = () => Action;
Action.Put = () => Decorator(RemixProperty.ActionPut);
Action.Patch = () => Decorator(RemixProperty.ActionPatch);
Action.Delete = () => Decorator(RemixProperty.ActionDelete);
Action.Options = () => Decorator(RemixProperty.ActionOptions);
Action.Head = () => Decorator(RemixProperty.ActionHead);
Action.Search = () => Decorator(RemixProperty.ActionSearch);
