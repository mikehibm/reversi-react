import * as React from 'react';
import store, { EV_BOARD_CHANGED } from '../store';
import { BoardState, positionToStr } from '../reversi';
import Board from './Board';
import Stats from './Stats';

interface State {
  board: BoardState;
}

function showAlert(msg: string, board: BoardState) {
  console.log(msg);
  if (!board.blackPlayer.isHuman && !board.whitePlayer.isHuman) {
    return;
  }
  alert(msg);
}

export default class Game extends React.Component<{}, State> {
  state = { board: store.getState().board };

  onBoardChange = async () => {
    const { board } = store.getState();
    this.setState({ board });

    if (board.finished) {
      setTimeout(() => {
        if (board.winner) {
          showAlert(`Finished! Winner is ${board.winner.name}`, board);
        } else {
          showAlert(`Finished! DRAW GAME!`, board);
        }
      }, 100);
    } else if (board.placeableCount === 0) {
      setTimeout(() => {
        showAlert(`${board.currentPlayer.name} must pass this turn.`, board);
        store.skipTurn();
      }, 100);
    } else if (!board.currentPlayer.isHuman && board.currentPlayer.think) {
      const result = await board.currentPlayer.think(board);
      console.log(`Think result=${positionToStr(result.row, result.col)}`);
      store.setStone(result);
    }
  };
  componentDidMount() {
    store.on(EV_BOARD_CHANGED, this.onBoardChange);
    setTimeout(() => this.onBoardChange(), 100);
  }
  componentWillUnmount() {
    store.off(EV_BOARD_CHANGED, this.onBoardChange);
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
