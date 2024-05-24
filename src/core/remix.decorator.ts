import type { ParamData, RouteParamMetadata } from "@nestjs/common";
import { assignMetadata } from "@nestjs/common";
import { ROUTE_ARGS_METADATA } from "@nestjs/common/constants";
import {
  markTypeAsProvider,
  RemixProperty,
  setRemixTypeDescriptor,
} from "./remix.core";
import { isConstructor } from "./remix.helper";
import { CUSTOM_PARAM_TYPE } from "./remix.constant";

function createRouteParamDecorator(paramtype: string) {
  return (data?: ParamData): ParameterDecorator =>
    (target, key, index) => {
      if (!key) return;
      const args =
        Reflect.getMetadata(ROUTE_ARGS_METADATA, target.constructor, key) || {};
      Reflect.defineMetadata(
        ROUTE_ARGS_METADATA,
        assignMetadata<string, Record<number, RouteParamMetadata>>(
          args,
          paramtype,
          index,
          data
        ),
        target.constructor,
        key
      );
    };
}

export const RemixArgs = createRouteParamDecorator(
  CUSTOM_PARAM_TYPE.REMIX_ARGS
);

function Decorator(property: RemixProperty) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const type = target.constructor;
    if (!isConstructor(type)) {
      return;
    }
    markTypeAsProvider(type);
    setRemixTypeDescriptor(type, propertyKey, property);
  };
}

export const Loader = () => Decorator(RemixProperty.Loader);
export function Action() {
  return Decorator(RemixProperty.ActionAll);
}
Action.Post = () => Action;
Action.Put = () => Decorator(RemixProperty.ActionPut);
Action.Patch = () => Decorator(RemixProperty.ActionPatch);
Action.Delete = () => Decorator(RemixProperty.ActionDelete);
Action.Options = () => Decorator(RemixProperty.ActionOptions);
Action.Head = () => Decorator(RemixProperty.ActionHead);
Action.Search = () => Decorator(RemixProperty.ActionSearch);
