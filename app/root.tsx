import {
  Links,
  LiveReload,
  LoaderFunction,
  Outlet,
  Scripts,
  useCatch,
  useLoaderData,
} from 'remix';
import * as React from 'react';
import { Form } from '@remix-run/react';

import styles from './tailwind.css';
import { GiGamepadCross } from 'react-icons/gi';
import { getUserEmail } from './util/session.server';
import { logError } from '~/util/logging.server';

export function links() {
  return [{ rel: 'stylesheet', href: styles }];
}

export let loader: LoaderFunction = async ({ request }) => {
  const email = await getUserEmail(request);
  return { email };
};

export default function App() {
  const data = useLoaderData();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Pile of Shame</title>
        <Links />
      </head>
      <body>
        <div className="flex flex-col min-h-screen">
          <div className="p-2 flex w-full justify-between bg-pale-cream align-middle">
            <div className="text-2xl text-red-700 flex items-center">
              <GiGamepadCross />
              <span>Pile of Shame</span>
            </div>
            {data.email ? (
              <Form action="/logout" method="post" className="self-center">
                <button type="submit">Logout</button>
              </Form>
            ) : null}
          </div>
          <Outlet />
        </div>
        <Scripts />
        {process.env.NODE_ENV === 'development' ? <LiveReload /> : null}
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  logError(error);
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Pile of Shame</title>
      </head>
      <body>
        <div className="flex flex-col min-h-screen">
          <div className="p-2 flex w-full justify-between bg-pale-cream align-middle">
            <div className="text-2xl text-red-700 flex items-center">
              <GiGamepadCross />
              <span>Pile of Shame</span>
            </div>
          </div>
          <div className="flex-grow flex flex-col justify-center items-center">
            <h3 className="text-gray-800 border border-gray-800 bg-yellow-200 p-2 rounded-2xl m-2">
              There's been an error.
            </h3>
            <p>{error.message}</p>
          </div>
        </div>
      </body>
    </html>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Pile of Shame</title>
      </head>
      <body>
        <div className="flex flex-col min-h-screen">
          <div className="p-2 flex w-full justify-between bg-pale-cream align-middle">
            <div className="text-2xl text-red-700 flex items-center">
              <GiGamepadCross />
              <span>Pile of Shame</span>
            </div>
          </div>
          <div className="flex-grow flex flex-col justify-center items-center">
            <h3 className="text-gray-800 border border-gray-800 bg-yellow-200 p-2 rounded-2xl m-2">
              {caught.status} {caught.statusText}
            </h3>
          </div>
        </div>
      </body>
    </html>
  );
}
