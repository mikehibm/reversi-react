import * as React from 'react';
import store, { EV_BOARD_CHANGED } from '../store';
import { BoardState } from '../reversi';
import Board from './Board';
import Stats from './Stats';

interface State {
  board: BoardState;
}

export default class Game extends React.Component<{}, State> {
  state = { board: store.getState().board };

  onChangeStore = () => {
    const { board } = store.getState();
    this.setState({ board });

    if (board.finished) {
      setTimeout(() => {
        alert(`Finished! Winner is ${board.winnerName}`);
      }, 100);
    } else if (board.placeableCount === 0) {
      setTimeout(() => {
        alert(`${board.currentPlayerName} must pass this turn.`);
        store.skipTurn();
      }, 100);
    }
  };
  componentDidMount() {
    store.on(EV_BOARD_CHANGED, this.onChangeStore);
  }
  componentWillUnmount() {
    store.off(EV_BOARD_CHANGED, this.onChangeStore);
  }

  handleBack = () => {
    store.setPage('menu');
  };

  render() {
    return (
      <div className="game">
        <div className="game-header">
          <button className="" onClick={this.handleBack}>
            Back
          </button>
        </div>
        <Board width={420} height={420} />
        <Stats />
      </div>
    );
  }
}
