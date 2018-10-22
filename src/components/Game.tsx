import * as React from 'react';
import store, { BoardState } from '../store';
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
    store.on('board_changed', this.onChangeStore);
  }
  componentWillUnmount() {
    store.off('board_changed', this.onChangeStore);
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
        <Board width={440} height={440} />
        <Stats />
      </div>
    );
  }
}
