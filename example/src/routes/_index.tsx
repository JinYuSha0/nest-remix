import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { Form } from '@remix-run/react';
import {
  type IndexBackend,
  useIndexLoader,
  useIndexAction,
} from './server/index.server';
import { useActionData, useLoaderData } from 'nestjs-remix/client';

export const loader: LoaderFunction = (...args) => {
  return useIndexLoader(...args);
};

export const action: ActionFunction = (...args) => {
  return useIndexAction(...args);
};

export default function Index() {
  const data = useLoaderData<IndexBackend>();
  const actionData = useActionData<IndexBackend>();
  return (
    <div>
      <h1>{data.message}</h1>
      <Form method="POST">
        <input
          placeholder="username"
          name="username"
          type="text"
          defaultValue="admin"
        />
        <br />
        <input
          placeholder="password"
          name="password"
          type="password"
          defaultValue="123456"
        />
        <br />
        <button type="submit">login</button>
      </Form>
    </div>
  );
}
