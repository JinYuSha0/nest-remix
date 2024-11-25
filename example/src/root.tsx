import type { MetaFunction } from 'react-router';
import type { RemixError } from 'nest-react-router/client';
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  useRouteError,
} from 'react-router';

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
        <title>nest-react-router demo</title>
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
  const error = useRouteError() as RemixError;
  return (
    <html>
      <head>
        <title>{error.statusText}</title>
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
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
