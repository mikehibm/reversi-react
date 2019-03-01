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
  is_stable: boolean;
  turnableCells: Position[];
  value: number;
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
  stableCount: number;
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
        is_stable: false,
        turnableCells: [],
        value: 0,
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
    stableCount: 0,
    finished: false,
    lastMove: { row: -1, col: -1 },
    currentPlayer: blackPlayer,
    blackPlayer: blackPlayer,
    whitePlayer: whitePlayer,
  };

  return getNextTurn(board);
}

function forAllCells(board: BoardState, func: (cell: CellState) => void) {
  board.cells.forEach((row) => {
    row.forEach(func);
  });
}

export function cloneBoard(board: BoardState): BoardState {
  return {
    ...board,
    cells: cloneCells(board.cells),
    lastMove: board.lastMove && { ...board.lastMove },
  };
}

function cloneCells(cells: CellState[][]): CellState[][] {
  return cells.map((row) => {
    return row.map((cell) => ({
      ...cell,
      turnableCells: cell.turnableCells.map((p) => ({ ...p })),
    }));
  });
}

export function placeStoneAndGetNextTurn(board: BoardState, { row, col }: Position): BoardState | null {
  const newBoard = cloneBoard(board);

  if (isOutOfRange(row, col)) return newBoard;

  const cell = newBoard.cells[row][col];
  if (!cell.placeable) return newBoard;

  // Place a stone.
  cell.color = newBoard.turn;

  // Turn all the stones that are in the middle.
  const turnableCells = cell.turnableCells.map((p) => newBoard.cells[p.row][p.col]);
  turnableCells.forEach((c) => (c.color = cell.color));

  // Check stable stones.
  [cell, ...turnableCells].forEach((c) => checkIfStable(newBoard, c));
  debugStables(newBoard);

  newBoard.lastMove = { row, col };
  return getNextTurn(newBoard);
}

export function getReversedColor(color: Colors) {
  return color === Colors.Black ? Colors.White : Colors.Black;
}

export function getNextTurn(board: BoardState): BoardState {
  board.turnCount++;
  board.turn = getReversedColor(board.turn);

  let white = 0,
    black = 0,
    none = 0,
    placeableCount = 0,
    stableCount = 0;

  forAllCells(board, (cell) => {
    cell.placeable = checkIfPlaceable(board, cell, board.turn);
    if (cell.placeable) placeableCount++;
    if (cell.is_stable) stableCount++;
    if (cell.color === Colors.White) white++;
    if (cell.color === Colors.Black) black++;
    if (cell.color === Colors.None) none++;
  });

  board.placeableCount = placeableCount;
  board.stableCount = stableCount;
  board.whiteCount = white;
  board.blackCount = black;
  board.finished = none === 0 || white === 0 || black === 0 || (board.lastMove.row < 0 && board.placeableCount === 0);
  board.currentPlayer = board.turn === Colors.Black ? board.blackPlayer : board.whitePlayer;

  board.winner = board.finished
    ? black === white
      ? undefined
      : black > white
      ? board.blackPlayer
      : board.whitePlayer
    : undefined;

  return board;
}

function isOutOfRange(row: number, col: number): boolean {
  return row < 0 || col < 0 || row >= ROWS || col >= COLS;
}

function isCorner(row: number, col: number): boolean {
  const corners = [
    { row: 0, col: 0 },
    { row: 0, col: COLS - 1 },
    { row: ROWS - 1, col: 0 },
    { row: ROWS - 1, col: COLS - 1 },
  ];
  return corners.filter((c) => c.row === row && c.col === col).length > 0;
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

function checkIfStable(board: BoardState, cell: CellState): boolean {
  if (!cell || isOutOfRange(cell.row, cell.col) || cell.color === Colors.None) return false;
  console.log(`Checking if stable ${positionToStr(cell.row, cell.col)}`);

  if (isCorner(cell.row, cell.col)) {
    cell.is_stable = true;
  } else if (!cell.is_stable) {
    const cur_color = cell.color;
    let stable_count = 0;
    let cnt = 0;

    for (let dy = -1; dy <= 0 && cnt < 4; dy++) {
      for (let dx = -1; dx <= 1 && cnt < 4; dx++) {
        const px = cell.col + dx;
        const py = cell.row + dy;
        const isOut = isOutOfRange(py, px);
        // console.log(`(px,py)=${positionToStr(py, px)}, isOut=${isOut}`);
        const c: CellState | null = isOut ? null : board.cells[py][px];

        const cx = cell.col + dx * -1;
        const cy = cell.row + dy * -1;
        const crossIsOut = isOutOfRange(cy, cx);
        // console.log(`(cx,cy)=${positionToStr(cy, cx)}, crossIsOut=${crossIsOut}`);
        const cross: CellState | null = crossIsOut ? null : board.cells[cy][cx];

        if (
          isOut ||
          (c && c.color === cur_color && c.is_stable) ||
          crossIsOut ||
          (cross && cross.color === cur_color && cross.is_stable)
        ) {
          stable_count++;
        }
        cnt++;
      }
    }
    //console.log(`${positionToStr(cell.row, cell.col)} stable_count = ${stable_count}`);
    cell.is_stable = stable_count >= 4;
  }

  if (cell.is_stable) {
    console.log(`${positionToStr(cell.row, cell.col)} is stable.`);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const px = cell.col + dx;
        const py = cell.row + dy;
        const c = isOutOfRange(py, px) ? null : board.cells[py][px];
        if (c && c.color == cell.color && !c.is_stable) {
          checkIfStable(board, c);
        }
      }
    }
  }

  return cell.is_stable;
}

export function filterStableCells(board: BoardState): CellState[] {
  const stableCells: CellState[] = [];
  forAllCells(board, (c: CellState) => {
    if (c.is_stable) stableCells.push(c);
  });
  return stableCells;
}

export function positionToStr(row: number, col: number) {
  if (row < 0 || col < 0) return '(none)';
  return `(${String.fromCharCode('a'.charCodeAt(0) + col)},${row + 1})`;
}

function debugStables(board: BoardState) {
  const list = filterStableCells(board);
  if (list.length === 0) return;
  console.log(`Stable cells: `);
  let msg = '';
  list.forEach((c) => {
    msg += `${positionToStr(c.row, c.col)}, `;
  });
  console.log(msg);
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
  const opponentColor = getReversedColor(turn);
  const nextCell = board.cells[r][c];

  if (nextCell.color === opponentColor) {
    arr.push({ row: nextCell.row, col: nextCell.col });
    return searchTurnableCells(board, dx, dy, nextCell, turn, arr);
  } else if (nextCell.color === turn) {
    return arr;
  }
  return [];
}
