import type { Type } from "@nestjs/common";
import { matchRoutes } from "react-router";
import { pathToFileURL } from "url";
import awaitImport from "await-import-dont-compile";
import {
  AgnosticRouteObject,
  ServerRoute,
  ServerRouteManifest,
  RouteMatch,
} from "./remix.type";

export const IS_DEV = process.env.NODE_ENV !== "production";

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
  let href = pathToFileURL(filepath).href;
  // dynamic import have a cache, will cause the remix page not to be updated
  if (IS_DEV) {
    href += `?d=${Date.now()}`;
  }
  return await awaitImport(href);
};

export const delay = (ms: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

function groupRoutesByParentId(
  manifest: ServerRouteManifest
): Record<string, ServerRoute[]> {
  let routes: Record<string, ServerRoute[]> = {};

  Object.values(manifest).forEach((route) => {
    if (route) {
      let parentId = route.parentId || "";
      if (!routes[parentId]) {
        routes[parentId] = [];
      }
      routes[parentId].push(route);
    }
  });

  return routes;
}

export function createRoutes(
  manifest: ServerRouteManifest,
  parentId: string = "",
  routesByParentId: Record<string, ServerRoute[]> = groupRoutesByParentId(
    manifest
  )
): ServerRoute[] {
  return (routesByParentId[parentId] || []).map((route) => ({
    ...route,
    children: createRoutes(manifest, route.id, routesByParentId),
  }));
}

export function matchServerRoutes(
  routes: ServerRoute[],
  pathname: string,
  basename?: string
): RouteMatch<ServerRoute>[] | null {
  let matches = matchRoutes(
    routes as unknown as AgnosticRouteObject[],
    pathname,
    basename
  );
  if (!matches) return null;

  return matches.map((match) => ({
    params: match.params,
    pathname: match.pathname,
    route: match.route as unknown as ServerRoute,
  }));
}
