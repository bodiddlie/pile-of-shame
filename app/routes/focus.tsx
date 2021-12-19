import * as React from 'react';
import {
  ActionFunction,
  LoaderFunction,
  redirect,
  useLoaderData,
  useTransition,
} from 'remix';
import { requireUserEmail } from '../util/session.server';
import { MdSearch } from 'react-icons/md';
import { Form } from '@remix-run/react';
import { GameCard } from '../components/game-card';
import { ActionButton } from '../components/action-button';
import { Game } from '../types';
import {
  completeGame,
  getNextGameInList,
  resetSortOrder,
  updateProfile,
} from '../util/dynamo.server';
import { GiGamepadCross } from 'react-icons/gi';

export let loader: LoaderFunction = async ({ request }) => {
  let email = await requireUserEmail(request);
  let game = await getNextGameInList(email);
  if (!game) {
    await updateProfile(email, 'list');
    return redirect('/list');
  }
  return { game };
};

export let action: ActionFunction = async ({ request }) => {
  let email = await requireUserEmail(request);
  let formData = await request.formData();
  let id = formData.get('id') as string;
  let actionType = formData.get('actionType') as string;

  if (actionType === 'cancel') {
    await resetSortOrder(email);
    await updateProfile(email, 'list');
    return redirect('/list');
  }

  if (!id) return { completeError: 'Error' };

  await completeGame(email, id);
  let game = await getNextGameInList(email);
  if (!game) {
    await updateProfile(email, 'list');
    return redirect('/list');
  }

  return null;
};

export default function Focus() {
  let data = useLoaderData();
  let transition = useTransition();
  let actionType = transition?.submission?.formData.get('actionType');
  let gameId = transition?.submission?.formData.get('id');

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
            <span>Cancel Focus Mode</span>
          )}
        </button>
      </Form>
      <Form action="/search" method="get" className="flex pr-2">
        <div className="flex bg-white flex-1">
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
      <div className="p-2">
        <h3 className="text-xl font-bold">Current Game</h3>
        {!!data.errorText && (
          <h3 className="text-gray-800 border border-gray-800 bg-red-200 p-2 rounded-2xl m-2">
            {data.errorText}
          </h3>
        )}
        <GameCard game={data.game}>
          <GameForm game={data.game}>
            <ActionButton performingAction={gameId === data.game.id}>
              Complete
            </ActionButton>
          </GameForm>
        </GameCard>
      </div>
    </div>
  );
}

type Props = {
  game: Game;
  children: React.ReactNode;
};
function GameForm({ game, children }: Props) {
  return (
    <Form method="post" className="self-end">
      <input type="hidden" name="id" value={game.id} />
      <input type="hidden" name="title" value={game.title} />
      <input type="hidden" name="description" value={game.description} />
      <input type="hidden" name="boxArt" value={game.boxArt} />
      {children}
    </Form>
  );
}
