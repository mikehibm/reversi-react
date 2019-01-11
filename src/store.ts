import EventEmitter from 'eventemitter3';
import { Position, BoardState, initBoard, cloneBoard, getNextTurn, Player } from './reversi';
import humanPlayer from './players/humanPlayer';
import computerPlayer1 from './players/computerPlayer1';
import computerPlayer2 from './players/computerPlayer2';
import computerPlayer3 from './players/computerPlayer3';

export type Pages = 'game' | 'menu';

export const EV_PAGE_CHANGED = 'page_changed';
export const EV_BOARD_CHANGED = 'board_changed';

export interface AppState {
  page: Pages;
  board: BoardState;
}

export const computerPlayers = [computerPlayer1, computerPlayer2, computerPlayer3];

class Store extends EventEmitter {
  private state: AppState = {
    page: 'menu',
    board: this.getInitialBoard(humanPlayer(), computerPlayer1()),
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
