import * as React from 'react';
import store, { EV_BOARD_CHANGED } from '../store';
import { BoardState, positionToStr } from '../reversi';
import Board from './Board';
import Stats from './Stats';
import './Game.css';

const MAX_SIZE = 480;
interface State {
  board: BoardState;
  windowSize: { w: number; h: number };
}

function showAlert(msg: string, board: BoardState) {
  console.log(msg);
  if (!board.blackPlayer.isHuman && !board.whitePlayer.isHuman) {
    return;
  }
  alert(msg);
}

function getWindowSize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return { w, h };
}

export default class Game extends React.Component<{}, State> {
  state = {
    board: store.getState().board,
    windowSize: getWindowSize(),
  };

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
    setTimeout(() => this.onBoardChange(), 10);

    window.addEventListener('resize', this.handleResize);
    setTimeout(() => this.handleResize(), 10);
  }
  componentWillUnmount() {
    store.off(EV_BOARD_CHANGED, this.onBoardChange);
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    const windowSize = getWindowSize();
    this.setState({ windowSize });
  };
  handleBack = () => store.setPage('menu');

  render() {
    const sz = Math.min(this.state.windowSize.w, this.state.windowSize.h, MAX_SIZE);

    return (
      <div className="Game">
        <div className="Game-header">
          <button className="" onClick={this.handleBack}>
            Back
          </button>
        </div>
        <Board width={sz} height={sz} />
        <Stats />
      </div>
    );
  }
}
