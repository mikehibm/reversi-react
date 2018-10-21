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
  row: number;
  col: number;
  color: Colors; // 0=None, 1=Black, 2=White
  placeable: boolean;
  turnableCells: CellState[];
}
export interface BoardState {
  cells: CellState[][];
  turn: Turns;
  turnCount: number;
}

export type Pages = 'game' | 'menu';

export interface AppState {
  page: Pages;
  board: BoardState;
}

class Store extends EventEmitter {
  page: Pages = 'menu';
  board: BoardState = this.initBoard();

  getState(): AppState {
    return {
      page: this.page,
      board: this.board,
    };
  }

  setPage(page: Pages): void {
    this.page = page;
    console.log(`page=${page}`);

    // Initialize the board before going back to game screen.
    if (page === 'game') {
      this.board = this.initBoard();
    }

    this.emit('page_changed');
  }

  setStone({ row, col }: CellClick): void {
    const cell = this.board.cells[row][col];
    if (!cell.placeable) {
      return;
    }
    cell.color = this.board.turn as number;
    cell.turnableCells.forEach((target) => {
      target.color = cell.color;
    });
    this.board.turnCount++;
    this.board.turn = this.board.turn === Turns.Black ? Turns.White : Turns.Black;
    this.updateCellStatus(this.board);
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

    const board = {
      cells,
      turn: Turns.Black,
      turnCount: 1,
    };

    this.updateCellStatus(board);

    return board;
  }

  updateCellStatus(board: BoardState) {
    const cells = board.cells;
    cells.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        cell.placeable = checkIfPlaceable(cells, rowIndex, colIndex, board.turn);
      });
    });

    function checkIfPlaceable(cells: CellState[][], row: number, col: number, turn: Turns): boolean {
      const cell = cells[row][col];
      cell.turnableCells = [];
      if (cell.color !== Colors.None) return false;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const foundCells = searchTurnableCells(dx, dy, cell, turn, []);
          cell.turnableCells = cell.turnableCells.concat(foundCells);
        }
      }
      return cell.turnableCells.length > 0;
    }

    function searchTurnableCells(dx: number, dy: number, cell: CellState, turn: Turns, arr: CellState[]): CellState[] {
      if (dx === 0 && dy === 0) return [];
      let r = cell.row + dy;
      let c = cell.col + dx;
      if (r < 0 || c < 0 || r > ROWS - 1 || c > COLS - 1) return [];
      const opponent = turn === Turns.Black ? Turns.White : Turns.Black;

      if (cells[r][c].color === (opponent as number)) {
        arr.push(cells[r][c]);
        return searchTurnableCells(dx, dy, cells[r][c], turn, arr);
      } else if (cells[r][c].color === (turn as number)) {
        return arr;
      }
      return [];
    }
  }
}

const store = new Store();
export default store;
