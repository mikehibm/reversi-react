import * as EventEmitter from 'eventemitter3';

export interface CellClick {
  x: number;
  y: number;
}

export interface CellState {
  index: number;
  x: number;
  y: number;
  color: number;
}
export interface BoardState {
  cells: CellState[][];
  turn: number;
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
    this.board.cells[y][x].color = this.board.turn;
    this.board.turnCount++;
    this.board.turn = this.board.turn === 1 ? 2 : 1;
    this.emit('board_changed');
  }

  initBoard() {
    const cells = Array.from(new Array(8).keys()).map((_, y) => {
      return Array.from(new Array(8).keys()).map((_, x) => {
        return {
          index: y * 8 + x,
          x: x,
          y: y,
          color: 0,
        };
      });
    });
    return {
      cells,
      turn: 1,
      turnCount: 0,
    };
  }
}

const store = new Store();
export default store;
