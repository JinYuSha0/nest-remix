import type { ActionReturnType, AnyFunction } from "../client";
import { useSubmit } from "@remix-run/react";
type Options = {
    delay?: number;
};
export declare function usePromiseSubmit<T extends {
    action?: AnyFunction;
} & object, K extends keyof T = "action", P = ActionReturnType<T, K>>(options?: Options): [
    (...args: Parameters<ReturnType<typeof useSubmit>>) => Promise<P>,
    boolean
];
export {};
