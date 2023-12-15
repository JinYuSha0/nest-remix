import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { useActionData, useLoaderData } from '@remix-run/react';
import {
  useFooLoader,
  useFooAction,
  type FooBackend,
} from './server/foo.server';

export const loader: LoaderFunction = (...args) => {
  return useFooLoader(...args);
};

export const action: ActionFunction = (...args) => {
  return useFooAction(...args);
};

export default function Index() {
  const data = useLoaderData<FooBackend['loader']>();
  const actionData = useActionData<FooBackend['action']>();
  return <div></div>;
}
