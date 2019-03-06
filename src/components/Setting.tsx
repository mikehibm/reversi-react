import * as React from 'react';
import store from '../store';
import { Player, Colors } from '../reversi';
import humanPlayer from '../players/humanPlayer';
import computerPlayer from '../players/computerPlayer';
import './Setting.css';
import { timingSafeEqual } from 'crypto';

interface State {
  p1: Player;
  p2: Player;
}

export default class Setting extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);

    this.blackPlayers = [humanPlayer('You'), computerPlayer('cpu1'), computerPlayer('cpu2'), computerPlayer('cpu3')];
    this.whitePlayers = [humanPlayer('You'), computerPlayer('cpu1'), computerPlayer('cpu2'), computerPlayer('cpu3')];

    this.state = {
      p1: this.blackPlayers[0],
      p2: this.whitePlayers[1],
    };
  }
  blackPlayers: Player[];
  whitePlayers: Player[];

  handleBack = () => store.setPage('menu');

  handleSelect = (p: Player, color: Colors) => {
    const newState = {
      ...this.state,
      p1: color === Colors.Black ? p : this.state.p1,
      p2: color === Colors.White ? p : this.state.p2,
    };
    this.setState(newState);
  };

  handleStart = () => {
    const { p1, p2 } = this.state;
    if (p1.name === p2.name) {
      p1.name = 'Black';
      p2.name = 'White';
    }
    store.startGame(p1, p2);
  };

  renderPlayers(color: Colors) {
    const { p1, p2 } = this.state;
    const players = color === Colors.Black ? this.blackPlayers : this.whitePlayers;
    return players.map((p, ix) => {
      let classNames = `primary ${color === Colors.Black ? 'black' : 'white'}`;
      if (p === p1) classNames += ' active';
      if (p === p2) classNames += ' active';
      return (
        <button key={ix} className={classNames} onClick={() => this.handleSelect(p, color)}>
          {p.isHuman ? p.name : ix}
        </button>
      );
    });
  }

  render() {
    return (
      <div className="Setting">
        <div className="Setting-header">
          <button className="" onClick={this.handleBack}>
            Back
          </button>
        </div>
        <ul>
          <li className="playerLabel">
            <h3>Black</h3>
          </li>
          <li className="levels">{this.renderPlayers(Colors.Black)}</li>
          <li className="playerLabel">
            <h3>White</h3>
          </li>
          <li className="levels">{this.renderPlayers(Colors.White)}</li>
          <li>
            <button className="primary start" onClick={() => this.handleStart()}>
              Start
            </button>
          </li>
        </ul>
      </div>
    );
  }
}
