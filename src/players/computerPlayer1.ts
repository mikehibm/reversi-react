import { wait } from '../utils';
import { BoardState, Player, CellState, Position } from '../reversi';
import createWorker, { MyWorker } from '../createWorker';
declare function postMessage(obj: any): void;

const WAIT_MSEC = 400 * 1;

// const thinkProc = () => {
//   self.addEventListener(
//     'message',
//     function(e) {
//       console.log('Worker called: ', e.data);
//       const board: BoardState = e.data.board;
//       const color = board.turn;
//       const placeableCells: CellState[] = [];

//       board.cells.forEach((row) => {
//         row.forEach((cell) => {
//           if (cell.placeable) {
//             console.log(`Evaluating: ${cell.col},${cell.row}...`);
//             // この場所に打った後の盤面を得る
//             const nextBoard = placeStoneAndGetNextTurn(board, { row: cell.row, col: cell.col }) as BoardState;
//             //console.log('nextBoard: ', nextBoard);
//             if (nextBoard) {
//               // 盤面の評価値を得る
//               cell.value = calcWeightTotal(nextBoard, weightTable, color);
//               console.log(`Value (${cell.col},${cell.row}) = ${cell.value}`);
//               placeableCells.push(cell);
//             }
//           }
//         });
//       });

//       if (!placeableCells.length) {
//         postMessage({ row: -1, col: -1 });
//         return;
//       }

//       // 評価値の降順にソート
//       placeableCells.sort((a, b) => {
//         return b.value - a.value;
//       });

//       // 70%の確率で先頭の候補を選ぶ。30%の確率で先頭から2つのうちどちらかを選ぶ。
//       const topN = Math.random() * 100 <= 30 ? 2 : 1;
//       const index = Math.floor(Math.random() * Math.min(topN, placeableCells.length));
//       const cell = placeableCells[index];
//       postMessage({ row: cell.row, col: cell.col });
//     },
//     false
//   );
// };
//const thinkWorker = createWorker(thinkProc);
const thinkWorker = new MyWorker(new Worker('players/cpu1.worker.js'));

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
