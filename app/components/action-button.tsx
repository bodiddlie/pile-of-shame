import * as React from 'react';
import { GiGamepadCross } from 'react-icons/gi';

type Props = {
  positive?: boolean;
  negative?: boolean;
  children: React.ReactNode;
};

export function ActionButton({ positive, negative, children }: Props) {
  let classes =
    'py-3 px-6 text-white rounded-lg shadow-lg border self-end disabled:bg-gray-200 disabled:border-gray-800 disabled:text-gray-800';
  if (positive) {
    classes += ' bg-green-400 border-green-400';
  } else if (negative) {
    classes += ' bg-red-400 border-red-400';
  } else {
    classes += ' bg-blue-400 border-blue-400 w-full';
  }

  const performingAction = false;

  return (
    <button type="submit" className={classes}>
      {performingAction ? (
        <span className="text-2xl fast-spin inline-block">
          <GiGamepadCross />
        </span>
      ) : (
        <span>{children}</span>
      )}
    </button>
  );
}
