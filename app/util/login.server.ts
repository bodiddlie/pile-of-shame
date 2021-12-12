import { redirect } from 'remix';
import { decrypt } from './crypto';
import jwt from 'jsonwebtoken';
import { getUserSession } from './dynamo.server';

export type TokenPayload = {
  email: string;
  sessionId: string;
};

export function validateMagicLink(urlString: string): string {
  const token = parseTokenFromUrl(urlString);

  if (!token) {
    console.warn('Magic link route hit with no magic word');
    throw redirect('/login');
  }

  let decryptedMagicLink;
  try {
    decryptedMagicLink = JSON.parse(decrypt(token));
  } catch (err) {
    console.warn('Error decrypting magic link: ', err);
    throw redirect('/login');
  }

  const [email, linkExpiration] = decryptedMagicLink;

  if (!email || !linkExpiration) {
    console.warn('Invalid magic link');
    throw redirect('/login');
  }

  const linkExpirationDate = new Date(linkExpiration);
  if (Date.now() > linkExpirationDate.getTime()) {
    console.warn('Magic link expired.');
    throw redirect('/login');
  }

  return email;
}

function parseTokenFromUrl(urlString: string): string | null {
  try {
    const url = new URL(urlString);
    const params = new URLSearchParams(url.search);
    return params.get('magicWord');
  } catch (err) {
    console.error(err);
    throw redirect('/login');
  }
}

export function validateToken(token: string): TokenPayload {
  return jwt.verify(token, 'tokensecret') as TokenPayload;
}
