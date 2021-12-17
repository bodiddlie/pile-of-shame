import * as React from 'react';
import { MdClear, MdSearch } from 'react-icons/md';
import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useLoaderData,
} from 'remix';
import { GameCard } from '../components/game-card';
import { requireUserEmail } from '../util/session.server';
import { addGame, getPile, removeGame } from '../util/dynamo.server';
import { ActionButton } from '../components/action-button';
import { Game } from '../types';

export let loader: LoaderFunction = async ({ request }) => {
  const email = await requireUserEmail(request);
  let url = new URL(request.url);
  let search = url.searchParams.get('search');

  if (!search) return { errorText: 'Search term is required.' };

  const data = await searchGames(email, search);

  return { ...data, search };
};

export let action: ActionFunction = async ({ request }) => {
  const email = await requireUserEmail(request);

  const formData = await request.formData();
  const actionType = formData.get('actionType');
  // let search = formData.get('search');

  if (actionType === 'add') {
    // add game to pile
    let id = formData.get('id');
    let title = formData.get('title');
    let boxArt = formData.get('boxArt');
    let description = formData.get('description');

    try {
      await addGame(email, id, title, boxArt, description);
      return null;
    } catch (err) {
      return {
        errorText: `An error occurred while adding game: ${id} ${title}`,
      };
    }
  } else if (actionType === 'delete') {
    let id = formData.get('id');

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
};

async function searchGames(email: string, search: string) {
  if (!search) return { errorText: 'Game title is required to search.' };

  const pile = await getPile(email);
  const gbUrl = 'https://giantbomb.com/api/games';
  const apiKey = process.env.GB_API_KEY;
  const url = `${gbUrl}?api_key=${apiKey}&format=json&filter=name:${search}&sort=name:asc`;

  try {
    const result = await fetch(url);
    const data = await result.json();
    const games = data.results.map((g: any) => {
      return {
        id: g.id,
        title: g.name,
        description: g.deck,
        boxArt: g.image.original_url,
        isInPile: !!pile
          ? pile.findIndex((p) => p.id === `${g.id}`) > -1
          : false,
      };
    });
    return { games };
  } catch (err: any) {
    console.error(`Failed to search GB for games: ${err.message}`);
    return { errorText: 'Error while searching for games.' };
  }
}

export default function Search() {
  const data = useLoaderData();
  return (
    <React.Fragment>
      <Form method="get" action="/search" className="flex pr-2">
        <div className="flex bg-white flex-1">
          <input
            type="text"
            name="search"
            className="flex-1 p-1 rounded-none bg-white appearance-none"
            placeholder="Find a game..."
          />
          <button
            type="button"
            className="w-10 flex justify-center items-center text-2xl"
          >
            <MdClear />
          </button>
          <button
            type="submit"
            className="w-10 flex justify-center items-center text-2xl"
          >
            <MdSearch />
          </button>
        </div>
      </Form>
      {data?.games?.length > 0 ? (
        <div className="grid gap-3 grid-cols-expando p-2">
          {data.games.map((g: any) => (
            <GameCard key={g.id} game={g}>
              {g.isInPile ? (
                <GameForm game={g} actionType="delete" search={data.search}>
                  <ActionButton negative>Remove</ActionButton>
                </GameForm>
              ) : (
                <GameForm game={g} actionType="add" search={data.search}>
                  <ActionButton positive>Add</ActionButton>
                </GameForm>
              )}
            </GameCard>
          ))}
        </div>
      ) : null}
    </React.Fragment>
  );
}

type Props = {
  game: Game;
  actionType: string;
  children: React.ReactNode;
  search: string;
};

function GameForm({ game, actionType, search, children }: Props) {
  return (
    <Form
      method="post"
      action={`/search?search=${search}`}
      className="self-end"
    >
      <input type="hidden" name="actionType" value={actionType} />
      <input type="hidden" name="id" value={game.id} />
      <input type="hidden" name="title" value={game.title} />
      <input type="hidden" name="description" value={game.description} />
      <input type="hidden" name="boxArt" value={game.boxArt} />
      {/*<input type="hidden" name="search" value={search} />*/}
      {children}
    </Form>
  );
}
