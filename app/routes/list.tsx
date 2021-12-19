import * as React from 'react';
import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useLoaderData,
  useTransition,
} from 'remix';
import { MdSearch } from 'react-icons/md';

import { requireUserEmail } from '../util/session.server';
import {
  getPile,
  getUser,
  removeGame,
  updateProfile,
} from '../util/dynamo.server';
import { GameCard } from '../components/game-card';
import { Game } from '../types';
import { ActionButton } from '../components/action-button';
import { GiGamepadCross } from 'react-icons/gi';

export let loader: LoaderFunction = async ({ request }) => {
  const email = await requireUserEmail(request);
  let user = await getUser(email);
  if (!user) return redirect('/login');

  if (user.isSorted === 'bracket') return redirect('/bracket');
  if (user.isSorted === 'focus') return redirect('/focus');

  try {
    const pile = await getPile(email);
    return { pile };
  } catch {
    return {
      errorText: 'An error occurred while loading your pile of shame.',
    };
  }
};

export let action: ActionFunction = async ({ request }) => {
  let formData = await request.formData();
  const email = await requireUserEmail(request);

  let actionType = formData.get('actionType');
  let id = formData.get('id');

  if (actionType === 'delete') {
    if (typeof id !== 'string') return { errorText: 'Invalid id' };

    try {
      await removeGame(email, id);
      return null;
    } catch (err) {
      return {
        errorText: 'An error occurred while deleting the game from your list.',
      };
    }
  } else if (actionType === 'bracket') {
    try {
      await updateProfile(email, 'bracket');
      return redirect('/bracket');
    } catch (err) {
      return {
        errorText: 'An error occurred while starting your bracket.',
      };
    }
  }
  return null;
};

export default function List() {
  const data = useLoaderData();
  const transition = useTransition();
  const actionType = transition?.submission?.formData.get('actionType');
  const gameId = transition?.submission?.formData.get('id');

  return (
    <div className="flex flex-col flex-grow">
      <Form method="post" className="flex flex-col">
        <input type="hidden" name="actionType" value="bracket" />
        <button
          type="submit"
          disabled={!data.pile || data.pile.length === 0}
          className="m-1 p-2 bg-green-400 rounded border border-gray-800 text-gray-800 text-center disabled:bg-gray-400"
        >
          {actionType === 'bracket' ? (
            <span className="text-2xl fast-spin inline-block">
              <GiGamepadCross />
            </span>
          ) : (
            <span>Start Bracket</span>
          )}
        </button>
      </Form>
      <Form action="/search" method="get" className="flex pr-2">
        <div className="flex bg-white flex-1">
          <input type="hidden" name="actionType" value="search" />
          <input
            type="text"
            name="search"
            className="flex-1 p-1 rounded-none bg-white appearance-none"
            placeholder="Find a game..."
          />
          <input type="hidden" name="actionType" value="search" />
          <button
            type="submit"
            className="w-10 flex justify-center items-center text-2xl"
          >
            {actionType === 'search' ? (
              <span className="text-2xl fast-spin inline-block">
                <GiGamepadCross />
              </span>
            ) : (
              <MdSearch />
            )}
          </button>
        </div>
      </Form>
      {data.pile.length > 0 ? (
        <React.Fragment>
          {!!data.errorText && (
            <h3 className="text-gray-800 border border-gray-800 bg-red-200 p-2 rounded-2xl m-2">
              {data.errorText}
            </h3>
          )}
          <div className="grid gap-3 grid-cols-expando p-2 pb-16">
            {data.pile.map((g: Game) => (
              <GameCard game={g} key={g.id}>
                <GameForm game={g} actionType="delete">
                  <ActionButton
                    negative
                    performingAction={
                      actionType === 'delete' && gameId === g.id
                    }
                  >
                    Remove
                  </ActionButton>
                </GameForm>
              </GameCard>
            ))}
          </div>
        </React.Fragment>
      ) : (
        <div className="flex-grow flex flex-col justify-center items-center">
          <h3 className="text-gray-800 border border-gray-800 bg-yellow-200 p-2 rounded-2xl m-2">
            No games added to your tournament yet. Search for some games above
            and them to the tournament list.
          </h3>
        </div>
      )}
    </div>
  );
}

type Props = {
  game: Game;
  actionType: string;
  children: React.ReactNode;
};

function GameForm({ game, actionType, children }: Props) {
  return (
    <Form method="post" className="self-end">
      <input type="hidden" name="actionType" value={actionType} />
      <input type="hidden" name="id" value={game.id} />
      <input type="hidden" name="title" value={game.title} />
      <input type="hidden" name="description" value={game.description} />
      <input type="hidden" name="boxArt" value={game.boxArt} />
      {children}
    </Form>
  );
}
