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

export interface CellClick {
  x: number;
  y: number;
}

export interface CellState {
  index: number;
  x: number;
  y: number;
  color: Colors; // 0=None, 1=Black, 2=White
}
export interface BoardState {
  cells: CellState[][];
  turn: Turns;
  turnCount: number;
}

class Store extends EventEmitter {
  page = 'menu';
  board: BoardState = this.initBoard();

  getState() {
    return {
      page: this.page,
      board: this.board,
    };
  }

  setPage(page: string) {
    this.page = page;
    console.log(`page=${page}`);

    // Initialize the board before going back to game screen.
    if (page === 'game') {
      this.board = this.initBoard();
    }

    this.emit('page_changed');
  }

  setStone({ x, y }: CellClick) {
    const current = this.board.cells[y][x].color;
    if (current > 0) {
      return;
    }
    this.board.cells[y][x].color = this.board.turn as number;
    this.board.turnCount++;
    this.board.turn = this.board.turn === Turns.Black ? Turns.White : Turns.Black;
    this.emit('board_changed');
  }

  initBoard() {
    const cells = Array.from(new Array(8).keys()).map((_, y) => {
      return Array.from(new Array(8).keys()).map((_, x) => {
        return {
          index: y * 8 + x,
          x: x,
          y: y,
          color: Colors.None,
        };
      });
    });

    // Set 4 stones as initial state.
    cells[3][3].color = Colors.Black;
    cells[3][4].color = Colors.White;
    cells[4][3].color = Colors.White;
    cells[4][4].color = Colors.Black;

    return {
      cells,
      turn: 1,
      turnCount: 0,
    };
  }
}

const store = new Store();
export default store;
