import * as React from 'react';
import { Form } from '@remix-run/react';
import { ActionFunction, useActionData } from 'remix';
import { sendEmail } from '../util/email.server';
import { encrypt } from '../util/crypto.server';

const linkExpirationTime = 1000 * 60 * 30;

export let action: ActionFunction = async ({ request }) => {
  let formData = await request.formData();
  let email = formData.get('email');

  if (typeof email !== 'string' || !email.match(/.@.+\..+/)) {
    return { error: 'Invalid Email' };
  }

  try {
    const expirationDateTime = new Date(
      Date.now() + linkExpirationTime,
    ).toISOString();
    const stringToEncrypt = JSON.stringify([email, expirationDateTime]);
    const encryptedString = encrypt(stringToEncrypt);

    console.log(`http://localhost:3000/magic?magicWord=${encryptedString}`);

    // await sendEmail(encryptedString, email);
    return { email };
  } catch (err: any) {
    console.error(`Failed to create a magic link: ${err.message}`);
    return { error: 'Something went wrong' };
  }
};

export default function Login() {
  const data = useActionData();

  const [submitted, setSubmitted] = React.useState(false);

  return (
    <Form
      className="flex flex-col p-2"
      method="post"
      onSubmit={() => setSubmitted(true)}
    >
      {data?.error ? <div>{data.error}</div> : null}
      <p className="mb-4 italic font-bold">
        Enter your email and we'll send you a "magic link" that you can use to
        log in. No accounts to create, no passwords to remember. Just use your
        email! Easy!
      </p>
      <label htmlFor="email" className="font-extrabold">
        Email Address
      </label>
      <input
        type="text"
        id="email"
        name="email"
        className="flex-1 py-4 px-2 mb-2 rounded-2xl bg-white appearance-none"
        placeholder="Enter your email..."
      />
      <button
        type="submit"
        className="w-24 p-1 bg-blue-400 rounded disabled:bg-gray-400 disabled:border-gray-200"
        disabled={submitted}
      >
        Request Magic Link
      </button>
      {data?.email ? (
        <div>A magic link has been sent to {data.email}.</div>
      ) : null}
    </Form>
  );
}
