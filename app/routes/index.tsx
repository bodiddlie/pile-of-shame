import type { MetaFunction, LoaderFunction } from 'remix';
import { Link, redirect } from 'remix';
import { getUserEmail } from '~/util/session.server';

export let meta: MetaFunction = () => {
  return {
    title: 'Pile of Shame',
    description: 'Pile of Shame',
  };
};

export let loader: LoaderFunction = async ({ request }) => {
  let email = await getUserEmail(request);
  if (email) return redirect('/list');
  return null;
};

export default function Index() {
  console.log('hi');
  return (
    <div className="flex flex-col p-2">
      <p className="mb-4 italic font-bold">
        With the ease of access to games that digital delivery provides and the
        ability to stock up on games in all the fantastic seasonal sales, it's
        harder than ever to decide which games you should play next.
      </p>
      <p className="mb-4 italic">
        Now with{' '}
        <span className="not-italic font-bold text-red-700">Pile of Shame</span>
        , you can pit your games against each other in a tournament to sort
        them. It's super easy to get started!
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>
          <Link
            className="py-1 px-3 text-white rounded-lg shadow-lg border self-end bg-blue-400 border-blue-400"
            to="/login"
          >
            Request a Magic Login Link
          </Link>
        </li>
        <li>Search for the games you haven't played yet</li>
        <li>Add games to your list</li>
        <li>Start a tournament</li>
        <li>Pick the winners of each match</li>
      </ul>
      <p className="mb-4 italic">
        After that, your choices of winners and losers will result in a sorted
        list of games. We'll present you with the next top game on your list, so
        you can maintain focus on you Pile of Shame (you can add new games to
        the end of the list).
      </p>
      <p className="text-xs italic">
        Icons provided by{' '}
        <a
          href="https://game-icons.net/"
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 underline"
        >
          https://game-icons.net/
        </a>
      </p>
    </div>
  );
}
