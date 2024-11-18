import type { MetaFunction } from '@remix-run/node';
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  useRouteError,
} from '@remix-run/react';
import { useMemo } from 'react';

export const meta: MetaFunction = () => [
  {
    charset: 'utf-8',
    viewport: 'width=device-width,initial-scale=1',
  },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <title>nestjs-remix-demo</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div id="root">
          <Outlet />
          <Scripts />
        </div>
      </body>
    </html>
  );
}

interface HttpError {
  data: {
    message?: string;
    code?: number;
    success?: false;
  };
  internal: boolean;
  status: number;
  statusText: string;
}

export function ErrorBoundary() {
  const error = useRouteError() as HttpError;
  return (
    <html>
      <head>
        <title>{error.statusText}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div id="root">
          <h1>{error.data.code}</h1>
          <h2>{error.data.message}</h2>
          <Link to="/">
            <button>Back home</button>
          </Link>
        </div>
      </body>
    </html>
  );
}
