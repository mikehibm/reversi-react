import * as React from 'react';
import store from '../store';
import Board from './Board';

export default function Game() {
  const handleBack = () => {
    store.setPage('menu');
  };

  return (
    <div className="game">
      <div className="game-header">
        <button className="" onClick={handleBack}>
          Back
        </button>
      </div>
      <Board width={440} height={440} />
    </div>
  );
}
