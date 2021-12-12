import * as React from 'react';
import { ActionFunction, LoaderFunction, useLoaderData } from 'remix';

import { requireUserEmail } from '../util/session.server';
import { getPile, removeGame } from '../util/dynamo.server';
import { GameCard } from '../components/game-card';
import { ActionButton } from '../components/action-button';
import { Game } from '../types';

export let loader: LoaderFunction = async ({ request }) => {
  const email = await requireUserEmail(request);
  try {
    const pile = await getPile(email);
    return { pile };
  } catch {
    return { errorText: 'An error occurred while loading your pile of shame.' };
  }
};

export let action: ActionFunction = async ({ request }) => {
  let formData = await request.formData();
  const email = await requireUserEmail(request);

  let method = formData.get('_method');
  let id = formData.get('id');

  if (method === 'delete') {
    if (typeof id !== 'string') return { errorText: 'Invalid id' };

    try {
      await removeGame(email, id);
      return null;
    } catch (err) {
      return {
        errorText: 'An error occurred while deleting the game from your list.',
      };
    }
  }
  return null;
};

export default function List() {
  const data = useLoaderData();
  return (
    <React.Fragment>
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
                <ActionButton game={g} negative className="self-end">
                  Remove
                </ActionButton>
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
    </React.Fragment>
  );
}
