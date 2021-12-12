import { LoaderFunction, redirect } from 'remix';
import cuid from 'cuid';

import { validateMagicLink } from '../util/login.server';
import { getUser, saveUser, saveUserSession } from '../util/dynamo.server';
import { commitSession, getSession } from '../session';

export let loader: LoaderFunction = async ({ request }) => {
  const email = validateMagicLink(request.url);
  const user = await getUser(email);

  if (!user) {
    await saveUser(email);
  }

  const sessionId = cuid();

  await saveUserSession(email, sessionId);

  const session = await getSession(request.headers.get('Cookie'));
  session.set('email', email);
  session.set('sessionId', sessionId);
  return redirect('/list', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
};

export default function Magic() {
  return <div>You shouldn't be here.</div>;
}
