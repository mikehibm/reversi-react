import * as EventEmitter from 'eventemitter3';

export enum Colors {
  None = 0,
  Black = 1,
  White = 2,
}

export const ROWS = 8;
export const COLS = 8;

export interface Position {
  row: number;
  col: number;
}

export interface CellState {
  index: number;
  row: number;
  col: number;
  color: Colors; // 0=None, 1=Black, 2=White
  placeable: boolean;
  turnableCells: Position[];
}
export interface BoardState {
  cells: CellState[][];
  turn: Colors;
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

const playerNames = ['', 'Black', 'White'];

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
    this.emit('page_changed');
  }

  public setStone({ row, col }: Position): void {
    const newBoard = cloneBoard(this.state.board);

    const cell = newBoard.cells[row][col];
    if (!cell.placeable) {
      return;
    }

    // Place a stone.
    cell.color = newBoard.turn;

    // Turn all the stones that are in the middle.
    cell.turnableCells.forEach(({ row, col }) => {
      newBoard.cells[row][col].color = cell.color;
    });

    this.changeTurn(newBoard);
  }

  public skipTurn(): void {
    const newBoard = cloneBoard(this.state.board);
    this.changeTurn(newBoard);
  }

  private changeTurn(board: BoardState): void {
    board.turnCount++;
    board.turn = board.turn === Colors.Black ? Colors.White : Colors.Black;
    updateBoardStatus(board);
    this.state = { ...this.getState(), board };
    this.emit('board_changed');
  }
}

function initBoard(): BoardState {
  const cells = Array.from(new Array(ROWS).keys()).map((_, row) => {
    return Array.from(new Array(COLS).keys()).map((_, col) => {
      return {
        index: row * COLS + col,
        col: col,
        row: row,
        color: Colors.None,
        placeable: false,
        turnableCells: [],
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
    turn: Colors.Black,
    turnCount: 1,
    blackCount: 0,
    whiteCount: 0,
    placeableCount: 0,
    finished: false,
  };

  updateBoardStatus(board);
  return board;
}

function cloneBoard(board: BoardState): BoardState {
  return {
    ...board,
    cells: cloneCells(board.cells),
  };
}

function cloneCells(cells: CellState[][]): CellState[][] {
  return cells.map((row, rowIndex) => {
    return row.map((cell, colIndex) => ({
      ...cell,
      turnableCells: cell.turnableCells.map((p) => ({ ...p })),
    }));
  });
}

function updateBoardStatus(board: BoardState) {
  let countWhite = 0,
    countBlack = 0,
    countNone = 0,
    countPlaceable = 0;

  board.cells.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      cell.placeable = checkIfPlaceable(board, cell, board.turn);
      if (cell.placeable) countPlaceable++;
      if (cell.color === Colors.White) countWhite++;
      if (cell.color === Colors.Black) countBlack++;
      if (cell.color === Colors.None) countNone++;
    });
  });

  board.whiteCount = countWhite;
  board.blackCount = countBlack;
  board.finished = countNone === 0 || countWhite === 0 || countBlack === 0;
  board.placeableCount = countPlaceable;
  board.currentPlayerName = playerNames[board.turn];
  board.winnerName = board.finished ? playerNames[getWinner(board)] : '';

  return board;
}

function checkIfPlaceable(board: BoardState, cell: CellState, turn: Colors): boolean {
  cell.turnableCells = [];
  if (cell.color !== Colors.None) return false;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const foundCells = searchTurnableCells(board, dx, dy, cell, turn, []);
      cell.turnableCells = cell.turnableCells.concat(foundCells);
    }
  }
  return cell.turnableCells.length > 0;
}

function searchTurnableCells(
  board: BoardState,
  dx: number,
  dy: number,
  cell: CellState,
  turn: Colors,
  arr: Position[]
): Position[] {
  if (dx === 0 && dy === 0) return [];
  const r = cell.row + dy;
  const c = cell.col + dx;
  if (r < 0 || c < 0 || r > ROWS - 1 || c > COLS - 1) return [];
  const opponentColor = turn === Colors.Black ? Colors.White : Colors.Black;
  const nextCell = board.cells[r][c];

  if (nextCell.color === opponentColor) {
    arr.push({ row: nextCell.row, col: nextCell.col });
    return searchTurnableCells(board, dx, dy, nextCell, turn, arr);
  } else if (nextCell.color === turn) {
    return arr;
  }
  return [];
}

function getWinner(board: BoardState): Colors {
  const { blackCount, whiteCount } = board;
  return blackCount === whiteCount ? Colors.None : blackCount > whiteCount ? Colors.Black : Colors.White;
}

const store = new Store();
export default store;
