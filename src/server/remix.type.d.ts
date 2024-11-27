import type {
  ServerBuild,
  ActionFunction,
  LazyRouteFunction,
  LoaderFunction,
  ShouldRevalidateFunction,
  Params,
} from "react-router";

export type ServerRouteManifest = ServerBuild["routes"];
export type ServerRoute = ServerRouteManifest[string];

export type AgnosticBaseRouteObject = {
  caseSensitive?: boolean;
  path?: string;
  id?: string;
  loader?: LoaderFunction | boolean;
  action?: ActionFunction | boolean;
  hasErrorBoundary?: boolean;
  shouldRevalidate?: ShouldRevalidateFunction;
  handle?: any;
  lazy?: LazyRouteFunction<AgnosticBaseRouteObject>;
};

export type AgnosticIndexRouteObject = AgnosticBaseRouteObject & {
  children?: undefined;
  index: true;
};

export type AgnosticNonIndexRouteObject = AgnosticBaseRouteObject & {
  children?: AgnosticRouteObject[];
  index?: false;
};

export type AgnosticRouteObject =
  | AgnosticIndexRouteObject
  | AgnosticNonIndexRouteObject;

export type AgnosticDataIndexRouteObject = AgnosticIndexRouteObject & {
  id: string;
};

export type AgnosticDataNonIndexRouteObject = AgnosticNonIndexRouteObject & {
  children?: AgnosticDataRouteObject[];
  id: string;
};

export type AgnosticDataRouteObject =
  | AgnosticDataIndexRouteObject
  | AgnosticDataNonIndexRouteObject;

export interface RouteMatch<Route> {
  params: Params;
  pathname: string;
  route: Route;
}
