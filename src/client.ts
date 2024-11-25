import {
  useLoaderData as useRemixLoaderData,
  useActionData as useRemixActionData,
} from "react-router";
export type {
  ReactRouterError,
  ReactRouterError as RemixError,
} from "./core/remix.exceptions";
export { usePromiseSubmit } from "./client/usePromiseSubmit";

type ExcludeResponse<T> = T extends Response ? never : T;

export type AnyFunction = (...args: any) => any;

export type RemixReturnType<T, P extends keyof T> = T[P] extends AnyFunction
  ? ExcludeResponse<Awaited<ReturnType<T[P]>>>
  : never;

export type LoaderReturnType<
  T extends { loader?: AnyFunction } & object,
  P extends keyof T = "loader",
> = RemixReturnType<T, P>;

export type ActionReturnType<
  T extends { action?: AnyFunction } & object,
  P extends keyof T = "action",
> = RemixReturnType<T, P>;

export const useLoaderData = <
  T extends { loader?: AnyFunction } & object,
  P extends keyof T = "loader",
>(
  ...args: any
): LoaderReturnType<T, P> => useRemixLoaderData.apply(null, args);

export const useActionData = <
  T extends { action?: AnyFunction } & object,
  P extends keyof T = "action",
>(
  ...args: any
): ActionReturnType<T, P> => useRemixActionData.apply(null, args);
