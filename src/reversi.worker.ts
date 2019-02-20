enum Colors {
  None = 0,
  Black = 1,
  White = 2,
}

const ROWS = 8;
const COLS = 8;

interface MyPosition {
  row: number;
  col: number;
}

interface CellState {
  index: number;
  row: number;
  col: number;
  color: Colors; // 0=None, 1=Black, 2=White
  placeable: boolean;
  turnableCells: MyPosition[];
  value: number;
}

interface Player {
  name?: string;
  isHuman: boolean;
  think?: (board: BoardState) => Promise<MyPosition>;
}

interface BoardState {
  cells: CellState[][];
  turn: Colors; // 1=Black, 2=White
  turnCount: number;
  blackCount: number;
  whiteCount: number;
  placeableCount: number;
  finished: boolean;
  lastMove: MyPosition;
  currentPlayer: Player;
  winner?: Player;
  blackPlayer: Player;
  whitePlayer: Player;
}

function initBoard(blackPlayer: Player, whitePlayer: Player): BoardState {
  const cells = Array.from(new Array(ROWS).keys()).map((_, row) => {
    return Array.from(new Array(COLS).keys()).map((_, col) => {
      return {
        index: row * COLS + col,
        col: col,
        row: row,
        color: Colors.None,
        placeable: false,
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
    finished: false,
    lastMove: { row: -1, col: -1 },
    currentPlayer: blackPlayer,
    blackPlayer: blackPlayer,
    whitePlayer: whitePlayer,
  };

  return getNextTurn(board);
}

function cloneBoard(board: BoardState): BoardState {
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

function placeStoneAndGetNextTurn(board: BoardState, { row, col }: MyPosition): BoardState | null {
  const newBoard = cloneBoard(board);

  const cell = newBoard.cells[row][col];
  if (!cell.placeable) {
    return null;
  }

  // Place a stone.
  cell.color = newBoard.turn;
  newBoard.lastMove = { row, col };

  // Turn all the stones that are in the middle.
  cell.turnableCells.forEach(({ row, col }) => {
    newBoard.cells[row][col].color = cell.color;
  });

  return getNextTurn(newBoard);
}

function getReversedColor(color: Colors) {
  return color === Colors.Black ? Colors.White : Colors.Black;
}

function getNextTurn(board: BoardState): BoardState {
  board.turnCount++;
  board.turn = getReversedColor(board.turn);

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
  arr: MyPosition[]
): MyPosition[] {
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

function calcWeightTotal(board: BoardState, weightTable: number[][], color: Colors) {
  let total = 0;
  const opponent_color = getReversedColor(color);
  let player_count = 0;
  let opponent_count = 0;

  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const st = board.cells[i][j].color;
      if (st == color) {
        player_count++;
        total += weightTable[i][j];
      } else if (st == opponent_color) {
        opponent_count++;
        total -= weightTable[i][j];
      }
    }
  }

  //自分の全滅は最低の評価値にする。
  if (player_count == 0) total = -999999;

  //相手の全滅は最高の評価値にする。
  if (opponent_count == 0) total = 999999;

  return total;
}
