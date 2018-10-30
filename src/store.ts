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
  blackCount: number;
  whiteCount: number;
  placeableCount: number;
  finished: boolean;
  currentPlayerName?: string;
  winnerName?: string;
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
    const names = ['', 'Black', 'White'];
    const playerName = names[this.board.turn];
    const winnerName = this.board.finished ? names[this.getWinner(this.board)] : '';

    return {
      page: this.page,
      board: {
        cells: cloneCells(this.board.cells),
        turn: this.board.turn,
        turnCount: this.board.turnCount,
        blackCount: this.board.blackCount,
        whiteCount: this.board.whiteCount,
        placeableCount: this.board.placeableCount,
        finished: this.board.finished,
        currentPlayerName: playerName,
        winnerName: winnerName,
      },
    };

    function cloneCells(cells: CellState[][]): CellState[][] {
      return cells.map((row, rowIndex) => {
        return row.map((cell, colIndex) => ({
          index: cell.index,
          row: cell.row,
          col: cell.col,
          color: cell.color,
          placeable: cell.placeable,
          turnableCells: [...cell.turnableCells],
        }));
      });
    }
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

    // Place a stone.
    cell.color = this.board.turn as number;

    // Turn all the stones that are in the middle.
    cell.turnableCells.forEach((target) => {
      target.color = cell.color;
    });

    this.changeTurn();
  }

  changeTurn(): void {
    this.board.turnCount++;
    this.board.turn = this.board.turn === Turns.Black ? Turns.White : Turns.Black;
    this.updateCellStatus(this.board);
    this.emit('board_changed');
  }

  skipTurn(): void {
    this.changeTurn();
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
    cells[cy][cx].color = Colors.White;
    cells[cy][cx + 1].color = Colors.Black;
    cells[cy + 1][cx].color = Colors.Black;
    cells[cy + 1][cx + 1].color = Colors.White;

    const board = {
      cells,
      turn: Turns.Black,
      turnCount: 1,
      blackCount: 0,
      whiteCount: 0,
      placeableCount: 0,
      finished: false,
    };

    this.updateCellStatus(board);

    return board;
  }

  updateCellStatus(board: BoardState) {
    const cells = board.cells;
    let blankCount = 0;
    cells.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        cell.placeable = checkIfPlaceable(cells, rowIndex, colIndex, board.turn);
        cell.color === Colors.None && blankCount++;
      });
    });

    board.blackCount = this.countColor(board, Colors.Black);
    board.whiteCount = this.countColor(board, Colors.White);
    board.placeableCount = this.getPlaceableCount(board);
    board.finished = blankCount === 0;

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

  getPlaceableCount(board: BoardState): number {
    let count = 0;
    const cells = board.cells;
    cells.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell.placeable) count++;
      });
    });
    return count;
  }

  countColor(board: BoardState, color: Colors): number {
    let count = 0;
    const cells = board.cells;
    cells.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell.color === color) count++;
      });
    });
    return count;
  }

  getWinner(board: BoardState): Colors {
    const { blackCount, whiteCount } = this.board;
    return blackCount === whiteCount ? Colors.None : blackCount > whiteCount ? Colors.Black : Colors.White;
  }
}

const store = new Store();
export default store;
