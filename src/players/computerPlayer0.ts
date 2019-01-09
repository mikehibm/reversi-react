import { wait } from '../utils';
import { BoardState, Player, CellState, Position } from '../reversi';
import createWorker from '../createWorker';
declare function postMessage(obj: any): void;

const WAIT_MSEC = 300;

const thinkProc = () => {
  self.addEventListener(
    'message',
    function(e) {
      console.log('Worker called: ', e.data);
      const board: BoardState = e.data.board;
      let result = { row: -1, col: -1 };
      const placeableCells: CellState[] = [];

      board.cells.forEach((row) => {
        row.forEach((cell) => {
          if (cell.placeable) placeableCells.push(cell);
        });
      });

      if (placeableCells.length) {
        const index = Math.floor(Math.random() * placeableCells.length);
        const cell = placeableCells[index];
        result = { row: cell.row, col: cell.col };
      }
      postMessage(result);
    },
    false
  );
};
const myWorker = createWorker(thinkProc);

export default function computerPlayer0(name: string): Player {
  return {
    name: name || 'CPU-0',
    isHuman: false,
    think: async (board: BoardState) => {
      const result = await myWorker.execute({ board: { cells: board.cells } });
      await wait(WAIT_MSEC);
      return result as Position;
    },
  };
}
