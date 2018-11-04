import * as EventEmitter from 'eventemitter3';
import { Position, BoardState, initBoard, cloneBoard, getNextTurn } from './reversi';

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
    board: initBoard(),
  };

  public getState(): AppState {
    return this.state;
  }

  public setPage(page: Pages): void {
    // Initialize the board before going back to game screen.
    const board = page === 'game' ? initBoard() : this.state.board;

    this.state = { ...this.getState(), page, board };
    this.emit(EV_PAGE_CHANGED);
  }

  public setStone({ row, col }: Position): void {
    const newBoard = cloneBoard(this.state.board);

    const cell = newBoard.cells[row][col];
    if (!cell.placeable) {
      return;
    }

    // Place a stone.
    cell.color = newBoard.turn;
    newBoard.lastMove = { row, col };

    // Turn all the stones that are in the middle.
    cell.turnableCells.forEach(({ row, col }) => {
      newBoard.cells[row][col].color = cell.color;
    });

    this.state = { ...this.getState(), board: getNextTurn(newBoard) };
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
