import { wait } from '../utils';
import { BoardState, Player, Position } from '../reversi';
import { WorkerWrapper } from '../WorkerWrapper';

const WAIT_MSEC = 400 * 1;

export default function(name: string): Player {
  const thinkWorker = new WorkerWrapper(new Worker(`players/${name}.worker.js`));
  return {
    name: name.toUpperCase(),
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
