import * as React from 'react';
import { GiGamepadCross } from 'react-icons/gi';
import { Form } from '@remix-run/react';
import { Game } from '../types';

type Props = {
  game: Game;
  positive?: boolean;
  negative?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function ActionButton({
  game,
  positive,
  negative,
  children,
  className,
}: Props) {
  let classes =
    'py-3 px-6 text-white rounded-lg shadow-lg border self-end disabled:bg-gray-200 disabled:border-gray-800 disabled:text-gray-800';
  if (positive) {
    classes += ' bg-green-400 border-green-400';
  } else if (negative) {
    classes += ' bg-red-400 border-red-400';
  } else {
    classes += ' bg-blue-400 border-blue-400';
  }

  const performingAction = false;
  const method = negative ? 'delete' : 'post';

  return (
    <Form method="post" className={className}>
      <input type="hidden" name="_method" value={method} />
      <input type="hidden" name="id" value={game.id} />
      <input type="hidden" name="title" value={game.title} />
      <input type="hidden" name="description" value={game.description} />
      <input type="hidden" name="boxArt" value={game.boxArt} />
      <button type="submit" className={classes}>
        {performingAction ? (
          <span className="text-2xl fast-spin inline-block">
            <GiGamepadCross />
          </span>
        ) : (
          <span>{children}</span>
        )}
      </button>
    </Form>
  );
}
