import EventEmitter from 'eventemitter3';
import { wait } from './utils';
import {
  Position,
  BoardState,
  initBoard,
  cloneBoard,
  getNextTurn,
  Player,
  placeStoneAndGetNextTurn,
  CellState,
} from './reversi';
import humanPlayer from './players/humanPlayer';
import computerPlayer from './players/computerPlayer';

export type PageTag = 'game' | 'menu' | 'setting';

export const EV_PAGE_CHANGED = 'page_changed';
export const EV_BOARD_CHANGED = 'board_changed';
export const EV_BOARD_FLIPPING = 'board_flipping';

const FLIP_DURATION = 400;
const FLIP_FRAMES = 20;

export type AppState = {
  page: PageTag;
  board: BoardState;
};

export type FlippingEvent = {
  count: number;
  total: number;
};

class Store extends EventEmitter {
  private state: AppState = {
    page: 'menu',
    board: this.getInitialBoard(humanPlayer(), computerPlayer('cpu1')),
  };

  private getInitialBoard(player1: Player, player2: Player): BoardState {
    return initBoard(player1, player2);
  }

  public getState(): AppState {
    return this.state;
  }

  public startGame(player1: Player, player2: Player) {
    const board = this.getInitialBoard(player1, player2);
    this.state = { ...this.getState(), board };
    this.setPage('game');
  }

  public setPage(page: PageTag): void {
    this.state = { ...this.getState(), page };
    this.emit(EV_PAGE_CHANGED);
  }

  public async setStone({ row, col }: Position): Promise<void> {
    const newBoard = placeStoneAndGetNextTurn(this.state.board, { row, col });
    if (!newBoard) return;

    this.state = { ...this.getState(), board: newBoard };
    await this.FlipCells(newBoard, FLIP_DURATION);

    this.state = { ...this.getState(), board: newBoard };
    this.emit(EV_BOARD_CHANGED);
  }

  private async FlipCells(board: BoardState, duration: number) {
    if (!board.flippingCells) return;

    const total = FLIP_FRAMES;
    board.isFlipping = true;
    for (let i = 0; i < total; i++) {
      const data: FlippingEvent = { count: i, total };
      // console.log('EV_BOARD_FLIPPING', data);
      this.emit(EV_BOARD_FLIPPING, data);
      await wait(duration / total);
    }
    board.isFlipping = false;
    board.flippingCells = undefined;
  }

  public skipTurn(): void {
    const newBoard = cloneBoard(this.state.board);
    newBoard.lastMove = { row: -1, col: -1 }; // (-1, -1)は「パス」を示す。
    this.state = { ...this.getState(), board: getNextTurn(newBoard) };
    this.emit(EV_BOARD_CHANGED);
  }
}

const store = new Store();
export default store;
