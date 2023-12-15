import type { MetaFunction } from '@remix-run/node';
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  useRouteError,
} from '@remix-run/react';

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
  const error = useRouteError() as Response;
  return (
    <html>
      <head>
        <title>{error.status}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <section>
          <div>
            <h1>{error.status}</h1>
            <p>{error.statusText}</p>
          </div>
          <Link to="/">
            <button>Back home</button>
          </Link>
        </section>
      </body>
    </html>
  );
}
