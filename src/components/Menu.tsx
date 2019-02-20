import * as React from 'react';
import store from '../store';
import { Player } from '../reversi';
import humanPlayer from '../players/humanPlayer';
import computerPlayer from '../players/computerPlayer';

export default function Menu() {
  const computerPlayers = [computerPlayer('cpu1'), computerPlayer('cpu2'), computerPlayer('cpu3')];
  const human = humanPlayer();

  const handleStart = (cpu: Player) => {
    store.startGame(human, cpu);
  };

  return (
    <div className="menu">
      <h1>Let's start!</h1>
      <ul>
        {computerPlayers.map((p, ix) => (
          <li key={ix}>
            <button className="primary" onClick={() => handleStart(p)}>
              Level {ix + 1}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
