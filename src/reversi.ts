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

export interface Player {
  name?: string;
  isHuman: boolean;
  think?: (board: BoardState) => Promise<Position>;
}

export interface BoardState {
  cells: CellState[][];
  turn: Colors; // 1=Black, 2=White
  turnCount: number;
  blackCount: number;
  whiteCount: number;
  placeableCount: number;
  finished: boolean;
  lastMove: Position;
  currentPlayer: Player;
  winner?: Player;
  blackPlayer: Player;
  whitePlayer: Player;
}

export function initBoard(blackPlayer: Player, whitePlayer: Player): BoardState {
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
    turn: Colors.White,
    turnCount: 0,
    blackCount: 0,
    whiteCount: 0,
    placeableCount: 0,
    finished: false,
    lastMove: { row: -1, col: -1 },
    currentPlayer: blackPlayer,
    blackPlayer: blackPlayer,
    whitePlayer: whitePlayer,
  };

  return getNextTurn(board);
}

export function cloneBoard(board: BoardState): BoardState {
  return {
    ...board,
    cells: cloneCells(board.cells),
    lastMove: board.lastMove && { ...board.lastMove },
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

export function getNextTurn(board: BoardState): BoardState {
  board.turnCount++;
  board.turn = board.turn === Colors.Black ? Colors.White : Colors.Black;

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

  board.placeableCount = countPlaceable;
  board.whiteCount = countWhite;
  board.blackCount = countBlack;
  board.finished =
    countNone === 0 || countWhite === 0 || countBlack === 0 || (board.lastMove.row < 0 && board.placeableCount === 0);
  board.currentPlayer = board.turn === Colors.Black ? board.blackPlayer : board.whitePlayer;

  board.winner =
    countBlack === countWhite ? undefined : countBlack > countWhite ? board.blackPlayer : board.whitePlayer;

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
