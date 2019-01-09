import { wait } from '../utils';
import { BoardState, Player, CellState, Position } from '../reversi';
import createWorker from '../createWorker';
declare function postMessage(obj: any): void;

const WAIT_MSEC = 300;

const myWorkerFunc = () => {
  self.addEventListener(
    'message',
    function(e) {
      console.log('Worker called: ', e.data.board);
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
const myWorker = createWorker(myWorkerFunc);

export default function computerPlayer0(name: string): Player {
  return {
    name: name || 'CPU-0',
    isHuman: false,
    think: async (board: BoardState) => {
      return await new Promise<Position>((resolve) => {
        const func = async (result: any) => {
          console.log('result.data=', result.data);
          myWorker.removeEventListener('message', func);
          await wait(WAIT_MSEC);
          resolve(result.data as Position);
        };
        myWorker.addEventListener('message', func);
        myWorker.postMessage({ board: { cells: board.cells } });
      });
    },
  };
}
