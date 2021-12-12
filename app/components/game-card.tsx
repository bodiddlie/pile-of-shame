import * as React from 'react';

import type { Game } from '../types';

type Props = {
  game: Game;
  children: React.ReactNode;
};

export function GameCard({ game, children }: Props) {
  return (
    <div
      className="flex items-center p-4 bg-white border-2 border-gray-400 rounded-lg shadow-sm"
      key={game.id}
    >
      <img className="max-h-24" src={game.boxArt} alt={game.title} />
      <div className="flex flex-col ml-5 w-full">
        <h4 className="text-xl font-semibold mb-2">{game.title}</h4>
        <p>{game.description}</p>
        {children}
      </div>
    </div>
  );
}
