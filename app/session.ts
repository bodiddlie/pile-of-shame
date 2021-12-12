import { createCookieSessionStorage } from 'remix';

const maxAge = 60 * 60 * 24 * 30;

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: 'pile_of_shame_session',
      httpOnly: true,
      maxAge,
      path: '/',
      sameSite: 'lax',
      secrets: ['s3cret1'],
      secure: true,
    },
  });

export { getSession, commitSession, destroySession };
