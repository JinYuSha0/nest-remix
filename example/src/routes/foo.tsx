import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { useActionData, useLoaderData } from '@remix-run/react';
import { type FooBackend, useFooServer } from './server/foo.server';
import { usePromiseSubmit } from 'nestjs-remix/client';

export const loader: LoaderFunction = (...args) => {
  return useFooServer(...args);
};

export const action: ActionFunction = (...args) => {
  return useFooServer(...args);
};

export default function Index() {
  const data = useLoaderData<FooBackend['loader']>();
  const [submit] = usePromiseSubmit<FooBackend>();
  return (
    <div>
      <h2>{data}</h2>
      <button onClick={() => submit(null, { method: 'POST' })}>logout</button>
    </div>
  );
}
