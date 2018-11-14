import { BoardState, Player } from '../reversi';

const WAIT_MSEC = 150;

export default function computerPlayer0(name: string): Player {
  return {
    name: name || 'CPU-0',
    isHuman: false,
    think: async (board: BoardState) => {
      let result = { row: -1, col: -1 };
      board.cells.forEach((row) => {
        row.forEach((cell) => {
          if (cell.placeable) result = { row: cell.row, col: cell.col };
        });
      });
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, WAIT_MSEC);
      });

      return result;
    },
  };
}
