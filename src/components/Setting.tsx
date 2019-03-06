import * as React from 'react';
import store, { EV_PAGE_CHANGED } from '../store';
import { Player } from '../reversi';
import humanPlayer from '../players/humanPlayer';
import computerPlayer from '../players/computerPlayer';
import './Setting.css';

export default function Setting() {
  const cpus = [computerPlayer('cpu1'), computerPlayer('cpu2'), computerPlayer('cpu3')];
  const human = humanPlayer();
  const human1 = humanPlayer('Black');
  const human2 = humanPlayer('White');

  const handleBack = () => store.setPage('menu');

  const handleStart = (p1: Player, p2: Player) => {
    store.startGame(p1, p2);
  };

  return (
    <div className="Setting">
      <div className="Setting-header">
        <button className="" onClick={handleBack}>
          Back
        </button>
      </div>
      <ul>
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
        <li>TEST</li>
        <li>
          <button className="primary" onClick={() => handleStart(cpus[0], cpus[1])}>
            CPU 1 vs 2
          </button>
          <button className="primary" onClick={() => handleStart(cpus[1], cpus[0])}>
            CPU 2 vs 1
          </button>
        </li>
        <li>
          <button className="primary" onClick={() => handleStart(cpus[1], cpus[2])}>
            CPU 2 vs 3
          </button>
          <button className="primary" onClick={() => handleStart(cpus[2], cpus[1])}>
            CPU 3 vs 2
          </button>
        </li>
      </ul>
    </div>
  );
}
