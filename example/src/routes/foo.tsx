import type { ActionFunction, LoaderFunction } from 'react-router';
import { useLoaderData } from 'nest-react-router/client';
import { type FooBackend, useFooServer } from './server/foo.server';
import { usePromiseSubmit } from 'nest-react-router/client';

export const loader: LoaderFunction = (args) => {
  return useFooServer(args);
};

export const action: ActionFunction = (args) => {
  return useFooServer(args);
};

export default function Index() {
  const data = useLoaderData<FooBackend>();
  const [submit] = usePromiseSubmit<FooBackend>();
  return (
    <div>
      <h2>{data}</h2>
      <button onClick={() => submit(null, { method: 'POST' })}>logout</button>
    </div>
  );
}
