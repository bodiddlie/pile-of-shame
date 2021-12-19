import {
  Links,
  LiveReload,
  LoaderFunction,
  Outlet,
  Scripts,
  useLoaderData,
} from 'remix';

import styles from './tailwind.css';
import { GiGamepadCross } from 'react-icons/gi';
import { getUserEmail } from './util/session.server';
import { Form } from '@remix-run/react';

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
