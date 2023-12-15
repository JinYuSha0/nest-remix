import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { useActionData, useLoaderData } from '@remix-run/react';
import {
  useIndexLoader,
  useIndexAction,
  type IndexBackend,
} from './server/index.server';

export const loader: LoaderFunction = (...args) => {
  return useIndexLoader(...args);
};

export const action: ActionFunction = (...args) => {
  return useIndexAction(...args);
};

export default function Index() {
  const data = useLoaderData<IndexBackend['loader']>();
  const actionData = useActionData<IndexBackend['action']>();
  return <div>{data.message}</div>;
}
