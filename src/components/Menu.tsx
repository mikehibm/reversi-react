import * as React from 'react';
import store from '../store';
import { Player } from '../reversi';
import humanPlayer from '../players/humanPlayer';
import computerPlayer from '../players/computerPlayer';

export default function Menu() {
  const cpus = [computerPlayer('cpu1'), computerPlayer('cpu2'), computerPlayer('cpu3')];
  const human = humanPlayer();
  const human1 = humanPlayer('Black');
  const human2 = humanPlayer('White');

  const handleStart = (p1: Player, p2: Player) => {
    store.startGame(p1, p2);
  };

  return (
    <div className="menu">
      <h1>Let's start!</h1>
      <ul>
        <button className="primary" onClick={() => handleStart(human1, human2)}>
          2 Players
        </button>
        {cpus.map((p, ix) => (
          <li key={ix}>
            <button className="primary black" onClick={() => handleStart(human, p)}>
              Lv {ix + 1} Black
            </button>
            <button className="primary white" onClick={() => handleStart(p, human)}>
              Lv {ix + 1} White
            </button>
          </li>
        ))}
        <button className="primary" onClick={() => handleStart(cpus[0], cpus[1])}>
          Test CPUs
        </button>
      </ul>
    </div>
  );
}
