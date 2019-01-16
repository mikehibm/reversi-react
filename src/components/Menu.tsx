import * as React from "react";
import store, { computerPlayers } from "../store";
import { Player } from "../reversi";
import humanPlayer from "../players/humanPlayer";

export default function Menu() {
  const human = humanPlayer();
  const cpuPlayers = computerPlayers.map(p => p());

  const handleStart = (cpu: Player) => {
    store.startGame(human, cpu);
  };

  return (
    <div className="menu">
      <h1>Let's start!</h1>
      <ul>
        {cpuPlayers.map((p, ix) => (
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
