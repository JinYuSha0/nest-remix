import type {
  ActionFunction,
  LoaderFunction,
  ShouldRevalidateFunction,
} from 'react-router';
import { Form, useRevalidator, Await } from 'react-router';
import { type IndexBackend, useIndexServer } from './server/index.server';
import {
  useActionData,
  useLoaderData,
  usePromiseSubmit,
} from 'nest-react-router/client';
import { Suspense } from 'react';

export const loader: LoaderFunction = (args) => {
  return useIndexServer(args);
};

export const action: ActionFunction = (args) => {
  return useIndexServer(args);
};

export const shouldRevalidate: ShouldRevalidateFunction = ({ formMethod }) => {
  return !formMethod || formMethod === 'GET';
};

export default function Index() {
  const { message, loadData, sumFromMicroService } =
    useLoaderData<IndexBackend>() ?? {};
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
        <p>{message}</p>
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
        <h2>Defer data</h2>
        <Suspense fallback={<span>loading...</span>}>
          <Await resolve={loadData}>{(data) => <span>{data}</span>}</Await>
        </Suspense>
      </div>
      <br />
      <div>
        <h2>MicroService data</h2>
        <Suspense fallback={<span>loading...</span>}>
          <Await resolve={sumFromMicroService}>
            {(data) => <span>{data}</span>}
          </Await>
        </Suspense>
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
