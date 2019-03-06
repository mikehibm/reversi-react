import * as React from 'react';
import store from '../store';
import { Player } from '../reversi';
import humanPlayer from '../players/humanPlayer';
import './Menu.css';

export default function Menu() {
  const handleNext = () => store.setPage('setting');
  const handleVSHuman = () => {
    const p1 = humanPlayer('Black');
    const p2 = humanPlayer('White');
    store.startGame(p1, p2);
  };

  return (
    <div className="Menu">
      <h1>Let's start!</h1>
      <ul>
        <li>
          <button className="primary" onClick={handleNext}>
            VS Computer
          </button>
        </li>
        <li>
          <button className="primary" onClick={handleVSHuman}>
            VS Human
          </button>
        </li>
      </ul>
    </div>
  );
}
