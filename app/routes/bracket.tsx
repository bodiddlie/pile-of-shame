import * as React from 'react';
import {
  ActionFunction,
  LoaderFunction,
  redirect,
  useLoaderData,
  useTransition,
} from 'remix';

import { requireUserEmail } from '../util/session.server';
import {
  getPile,
  getUser,
  resetSortOrder,
  updateProfile,
  updateSortOrder,
} from '../util/dynamo.server';
import { Form } from '@remix-run/react';
import { Game } from '../types';
import { ActionButton } from '../components/action-button';
import { GiGamepadCross } from 'react-icons/gi';

function getRandomIndex(arr: Array<any>) {
  return Math.floor(Math.random() * arr.length);
}

function pickNext(arr: Array<any>) {
  let a = [...arr];
  let index = getRandomIndex(a);
  let first = a[index];
  a = [...a.slice(0, index), ...a.slice(index + 1)];
  index = getRandomIndex(a);
  let second = a[index];
  return { first, second };
}

export let loader: LoaderFunction = async ({ request }) => {
  let email = await requireUserEmail(request);
  let user = await getUser(email);
  if (!user) return redirect('/login');

  if (user.isSorted === 'focus') {
    return redirect('/focus');
  } else if (user.isSorted !== 'bracket') {
    return redirect('/list');
  }

  let pile = (await getPile(email)) || [];

  let unsorted = pile.filter((p) => p.sortOrder === null);
  let winners = pile.filter((p) => p.sortOrder === 'w');
  let losers = pile.filter((p) => p.sortOrder === 'l');

  if (unsorted.length >= 2) {
    return pickNext(unsorted);
  } else if (winners.length >= 2) {
    return pickNext(winners);
  } else if (losers.length >= 2) {
    return pickNext(losers);
  }

  await updateProfile(email, 'focus');
  return redirect('/focus');
};

export let action: ActionFunction = async ({ request }) => {
  let email = await requireUserEmail(request);
  let formData = await request.formData();
  let winner = formData.get('winner') as string;
  let loser = formData.get('loser') as string;
  let actionType = formData.get('actionType') as string;

  if (actionType === 'cancel') {
    await resetSortOrder(email);
    await updateProfile(email, 'list');
    return redirect('/list');
  }

  if (!winner || !loser) throw redirect('/list');

  let pile = (await getPile(email)) || [];
  let unsorted = pile.filter((p) => p.sortOrder === null);
  let winners = pile.filter((p) => p.sortOrder === 'w');
  let losers = pile.filter((p) => p.sortOrder === 'l');
  let sorted = pile
    .filter((p) => typeof p.sortOrder === 'number' && p.sortOrder !== 1)
    .sort((first, second) => first.sortOrder - second.sortOrder);

  if (unsorted.length >= 2) {
    if (unsorted.length % 2 === 1) {
      let filtered = unsorted.filter((p) => p.id !== winner && p.id !== loser);
      let bye = filtered[getRandomIndex(filtered)].id;
      await updateSortOrder(email, bye, 'w');
    }
    await updateSortOrder(email, winner, 'w');
    await updateSortOrder(email, loser, 'l');
  } else if (winners.length >= 2) {
    if (winners.length == 2) {
      await updateSortOrder(email, winner, 1);
    }
    await updateSortOrder(email, loser, 'l');
  } else if (losers.length > 2) {
    if (sorted.length > 0) {
      await updateSortOrder(email, loser, sorted[0].sortOrder - 1);
    } else {
      await updateSortOrder(email, loser, pile.length);
    }
  } else if (losers.length == 2) {
    await updateSortOrder(email, winner, 2);
    await updateSortOrder(email, loser, 3);
  }
  return null;
};

export default function Bracket() {
  const data = useLoaderData();
  const transition = useTransition();
  const actionType = transition?.submission?.formData.get('actionType');
  const winner = transition?.submission?.formData.get('winner');

  return (
    <div className="flex flex-col flex-grow">
      <Form method="post" className="flex flex-col">
        <input type="hidden" name="actionType" value="cancel" />
        <button
          type="submit"
          className="m-1 p-2 bg-yellow-400 rounded border border-gray-800 text-gray-800"
        >
          {actionType === 'cancel' ? (
            <span className="text-2xl fast-spin inline-block">
              <GiGamepadCross />
            </span>
          ) : (
            <span>Cancel Tournament</span>
          )}
        </button>
      </Form>
      <Form
        method="post"
        className="flex-grow flex flex-col justify-between p-4 border-2 border-blue-800 rounded-lg m-1 bg-white"
      >
        <GameButton
          game={data.first}
          performingAction={winner === data.first.id}
        />
        <input type="hidden" name="winner" value={data.first.id} />
        <input type="hidden" name="loser" value={data.second.id} />
      </Form>
      <div className="text-center bg-blue-800 text-white font-extrabold">
        VS
      </div>
      <Form
        method="post"
        className="flex-grow flex flex-col justify-between p-4 border-2 border-blue-800 rounded-lg m-1 bg-white flex-col-reverse"
      >
        <GameButton
          game={data.second}
          performingAction={winner === data.second.id}
        />
        <input type="hidden" name="winner" value={data.second.id} />
        <input type="hidden" name="loser" value={data.first.id} />
      </Form>
    </div>
  );
}

type ButtonProps = {
  game: Game;
  performingAction: boolean;
};
function GameButton({ game, performingAction }: ButtonProps) {
  return (
    <React.Fragment>
      <div className="flex-grow flex items-center p-4">
        <img className="max-h-24" src={game.boxArt} alt={game.title} />
        <div className="flex flex-col ml-5 w-full">
          <h4 className="text-xl font-semibold mb-2">{game.title}</h4>
          <p>{game.description}</p>
        </div>
      </div>
      <ActionButton>
        {performingAction ? (
          <span className="text-2xl fast-spin inline-block">
            <GiGamepadCross />
          </span>
        ) : (
          <span>Choose {game.title}</span>
        )}
      </ActionButton>
    </React.Fragment>
  );
}
