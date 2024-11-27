import {
  useLoaderData as useReactRouterLoaderData,
  useActionData as useReactRouterActionData,
} from "react-router";
export { usePromiseSubmit } from "./usePromiseSubmit";

type ExcludeResponse<T> = T extends Response ? never : T;

export type AnyFunction = (...args: any) => any;

export interface ReactRouterError {
  data: {
    message?: string;
    code?: number;
    success?: false;
  };
  internal: boolean;
  status: number;
  statusText: string;
}

export type ReactRouterReturnType<
  T,
  P extends keyof T,
> = T[P] extends AnyFunction
  ? ExcludeResponse<Awaited<ReturnType<T[P]>>>
  : never;

export type LoaderReturnType<
  T extends { loader?: AnyFunction } & object,
  P extends keyof T = "loader",
> = ReactRouterReturnType<T, P>;

export type ActionReturnType<
  T extends { action?: AnyFunction } & object,
  P extends keyof T = "action",
> = ReactRouterReturnType<T, P>;

export const useLoaderData = <
  T extends { loader?: AnyFunction } & object,
  P extends keyof T = "loader",
>(
  ...args: any
): LoaderReturnType<T, P> => useReactRouterLoaderData.apply(null, args);

export const useActionData = <
  T extends { action?: AnyFunction } & object,
  P extends keyof T = "action",
>(
  ...args: any
): ActionReturnType<T, P> => useReactRouterActionData.apply(null, args);
