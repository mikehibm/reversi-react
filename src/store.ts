import * as EventEmitter from 'eventemitter3';

export enum Colors {
  None = 0,
  Black = 1,
  White = 2,
}

export enum Turns {
  Black = 1,
  White = 2,
}

export const ROWS = 8;
export const COLS = 8;

export interface CellClick {
  row: number;
  col: number;
}

export interface CellState {
  index: number;
  col: number;
  row: number;
  color: Colors; // 0=None, 1=Black, 2=White
}
export interface BoardState {
  cells: CellState[][];
  turn: Turns;
  turnCount: number;
}

export interface AppState {
  page: string;
  board: BoardState;
}

class Store extends EventEmitter {
  page = 'menu';
  board: BoardState = this.initBoard();

  getState(): AppState {
    return {
      page: this.page,
      board: this.board,
    };
  }

  setPage(page: string): void {
    this.page = page;
    console.log(`page=${page}`);

    // Initialize the board before going back to game screen.
    if (page === 'game') {
      this.board = this.initBoard();
    }

    this.emit('page_changed');
  }

  setStone({ row, col }: CellClick): void {
    const current = this.board.cells[row][col].color;
    if (current > 0) {
      return;
    }
    this.board.cells[row][col].color = this.board.turn as number;
    this.board.turnCount++;
    this.board.turn = this.board.turn === Turns.Black ? Turns.White : Turns.Black;
    this.emit('board_changed');
  }

  initBoard(): BoardState {
    const cells = Array.from(new Array(ROWS).keys()).map((_, row) => {
      return Array.from(new Array(COLS).keys()).map((_, col) => {
        return {
          index: row * COLS + col,
          col: col,
          row: row,
          color: Colors.None,
        } as CellState;
      });
    });

    // Set 4 stones as initial state.
    const cx = COLS / 2 - 1;
    const cy = ROWS / 2 - 1;
    cells[cy][cx].color = Colors.Black;
    cells[cy][cx + 1].color = Colors.White;
    cells[cy + 1][cx].color = Colors.White;
    cells[cy + 1][cx + 1].color = Colors.Black;

    return {
      cells,
      turn: Turns.Black,
      turnCount: 0,
    };
  }
}

const store = new Store();
export default store;
