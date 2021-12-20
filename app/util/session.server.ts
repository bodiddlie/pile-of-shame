import { redirect } from 'remix';

import { destroySession, getSession } from '~/session';
import { getUserSession } from './dynamo.server';

export async function requireUserEmail(request: Request) {
  const session = await getSession(request.headers.get('Cookie'));

  if (!session.has('email') || !session.has('sessionId')) {
    throw redirect('/login');
  }

  const email = session.get('email');
  const sessionId = session.get('sessionId');

  const userSession = await getUserSession(email, sessionId);

  if (!userSession) {
    throw redirect('/login');
  }

  return email;
}

export async function getUserEmail(request: Request) {
  const session = await getSession(request.headers.get('Cookie'));

  if (!session.has('email') || !session.has('sessionId')) {
    return null;
  }

  const email = session.get('email');
  const sessionId = session.get('sessionId');
  const userSession = await getUserSession(email, sessionId);

  if (!userSession) {
    return null;
  }

  return email;
}

export async function logout(request: Request) {
  const session = await getSession(request.headers.get('Cookie'));

  return redirect('/login', {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
}
