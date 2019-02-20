import { wait } from '../utils';
import { BoardState, Player, CellState, Position } from '../reversi';
import createWorker from '../createWorker';
import { finished } from 'stream';
declare function postMessage(obj: any): void;

const WAIT_MSEC = 400 * 1;

const thinkProc = () => {
  //場所毎の重み付け
  const weightTable = [
    [100, -50, 10, 0, 0, 10, -50, 100],
    [-50, -70, -5, -10, -10, -5, -70, -50],
    [10, -5, -10, -5, -5, -10, -5, 10],
    [0, -10, -5, 0, 0, -5, -10, 0],
    [0, -10, -5, 0, 0, -5, -10, 0],
    [10, -5, -10, -5, -5, -10, -5, 10],
    [-50, -70, -5, -10, -10, -5, -70, -50],
    [100, -50, 10, 0, 0, 10, -50, 100],
  ];

  enum Colors {
    None = 0,
    Black = 1,
    White = 2,
  }

  const ROWS = 8;
  const COLS = 8;

  function cloneBoard(board: BoardState): BoardState {
    return Object.assign({
      cells: cloneCells(board.cells),
      turn: board.turn,
      turnCount: board.turnCount,
      blackCount: board.blackCount,
      whiteCount: board.whiteCount,
      placeableCount: board.placeableCount,
      finished: board.finished,
      lastMove: board.lastMove && Object.assign({ lastMove: board.lastMove }),
    });
  }

  function cloneCells(cells: CellState[][]): CellState[][] {
    return cells.map((row) => {
      return row.map((cell) =>
        Object.assign({}, cell, {
          turnableCells: cell.turnableCells.map((p) => Object.assign({ row: p.row, col: p.col })),
        })
      );
    });
  }
  function getReversedColor(color: Colors) {
    return color === Colors.Black ? Colors.White : Colors.Black;
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

  function getNextTurn(board: BoardState): BoardState {
    board.turnCount++;
    board.turn = getReversedColor(board.turn);

    let countWhite = 0,
      countBlack = 0,
      countNone = 0,
      countPlaceable = 0;

    board.cells.forEach((row) => {
      row.forEach((cell) => {
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

  function placeStoneAndGetNextTurn(board: BoardState, { row, col }: Position): BoardState | null {
    const newBoard = cloneBoard(board);
    console.log('Cloned board: ', newBoard);

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

  self.addEventListener(
    'message',
    function(e) {
      console.log('Worker called: ', e.data);
      const board: BoardState = e.data.board;
      const color = board.turn;
      const placeableCells: CellState[] = [];

      board.cells.forEach((row) => {
        row.forEach((cell) => {
          if (cell.placeable) {
            console.log(`Evaluating: ${cell.col},${cell.row}...`);
            // この場所に打った後の盤面を得る
            const nextBoard = placeStoneAndGetNextTurn(board, { row: cell.row, col: cell.col }) as BoardState;
            //console.log('nextBoard: ', nextBoard);
            if (nextBoard) {
              // 盤面の評価値を得る
              cell.value = calcWeightTotal(nextBoard, weightTable, color);
              console.log(`Value (${cell.col},${cell.row}) = ${cell.value}`);
              placeableCells.push(cell);
            }
          }
        });
      });

      if (!placeableCells.length) {
        postMessage({ row: -1, col: -1 });
        return;
      }

      // 評価値の降順にソート
      placeableCells.sort((a, b) => {
        return b.value - a.value;
      });

      // 70%の確率で先頭の候補を選ぶ。30%の確率で先頭から2つのうちどちらかを選ぶ。
      const topN = Math.random() * 100 <= 30 ? 2 : 1;
      const index = Math.floor(Math.random() * Math.min(topN, placeableCells.length));
      const cell = placeableCells[index];
      postMessage({ row: cell.row, col: cell.col });
    },
    false
  );
};
const thinkWorker = createWorker(thinkProc);

export default function(name?: string): Player {
  return {
    name: name || 'CPU-1',
    isHuman: false,
    think: async (board: BoardState) => {
      const payload = {
        board: {
          cells: board.cells,
          turn: board.turn,
          turnCount: board.turnCount,
          blackCount: board.blackCount,
          whiteCount: board.whiteCount,
          placeableCount: board.placeableCount,
          finished: board.finished,
          lastMove: board.lastMove,
        },
      };
      const result = (await thinkWorker.execute(payload)) as Position;
      await wait(WAIT_MSEC);
      return result;
    },
  };
}
