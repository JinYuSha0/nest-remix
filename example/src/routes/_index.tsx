import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { Form, useRevalidator } from '@remix-run/react';
import { type IndexBackend, useIndexServer } from './server/index.server';
import {
  useActionData,
  useLoaderData,
  usePromiseSubmit,
} from 'nestjs-remix/client';

export const loader: LoaderFunction = (...args) => {
  return useIndexServer(...args);
};

export const action: ActionFunction = (...args) => {
  return useIndexServer(...args);
};

export default function Index() {
  const data = useLoaderData<IndexBackend>();
  const actionData = useActionData<IndexBackend>();
  const revalidator = useRevalidator();
  const [patch] = usePromiseSubmit<IndexBackend, 'patch'>();
  const [deleted] = usePromiseSubmit<IndexBackend, 'delete'>();
  const syncAlert = (wrapped: () => Promise<unknown>) => {
    return async () => {
      const data = await wrapped();
      if (typeof data === 'string') alert(data);
    };
  };
  return (
    <div>
      <div>
        <h2>Loader data</h2>
        <p>{data.message}</p>
        <button onClick={() => revalidator.revalidate()}>GET</button>
      </div>
      <br />
      <div>
        <h2>RESTFUL</h2>
        <button
          onClick={syncAlert(patch.bind(null, null, { method: 'PATCH' }))}
        >
          PATCH
        </button>
        <button
          onClick={syncAlert(deleted.bind(null, null, { method: 'DELETE' }))}
        >
          DELETE
        </button>
      </div>
      <br />
      <div>
        <h2>Form submit</h2>
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
        {typeof actionData?.msg === 'string' && (
          <span style={{ color: 'red' }}>{actionData.msg}</span>
        )}
      </div>
      <div>
        <h2>Nestjs api</h2>
        <a href="/json" target="_blank">
          <button>json</button>
        </a>
        <a href="/bad" target="_blank">
          <button>exception</button>
        </a>
      </div>
    </div>
  );
}
