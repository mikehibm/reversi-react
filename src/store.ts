import EventEmitter from 'eventemitter3';
import { Position, BoardState, initBoard, cloneBoard, getNextTurn, Player, placeStoneAndGetNextTurn } from './reversi';
import humanPlayer from './players/humanPlayer';
import computerPlayer from './players/computerPlayer';

export type Pages = 'game' | 'menu';

export const EV_PAGE_CHANGED = 'page_changed';
export const EV_BOARD_CHANGED = 'board_changed';

export interface AppState {
  page: Pages;
  board: BoardState;
}

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

  public setPage(page: Pages): void {
    this.state = { ...this.getState(), page };
    this.emit(EV_PAGE_CHANGED);
  }

  public setStone({ row, col }: Position): void {
    const newBoard = placeStoneAndGetNextTurn(this.state.board, { row, col });
    if (!newBoard) return;

    this.state = { ...this.getState(), board: newBoard };
    this.emit(EV_BOARD_CHANGED);
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
