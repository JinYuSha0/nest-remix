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

export function ErrorBoundary() {
  const error = useRouteError() as any;
  const data = useMemo(() => {
    try {
      return JSON.parse(error.data) as {
        msg: string;
        cause?: string | string[];
      };
    } catch {}
    return void 0;
  }, [error.data]);
  const cause = useMemo(() => {
    if (!data?.cause) return '';
    if (Array.isArray(data.cause)) return data.cause.join(',');
    return data.cause;
  }, [data?.cause]);
  return (
    <html>
      <head>
        <title>{error.status}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div>
          <h1>{error.status}</h1>
          <h3>{error.statusText}</h3>
          {!!cause && <p>cause: {cause}</p>}
        </div>
        <Link to="/">
          <button>Back home</button>
        </Link>
        <Scripts />
      </body>
    </html>
  );
}
