/// <reference path="../reversi.worker.ts" />
importScripts('../reversi.worker.js');

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

self.addEventListener(
  'message',
  function(e: any) {
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
      postMessage({ row: -1, col: -1 }, undefined);
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
    postMessage({ row: cell.row, col: cell.col }, undefined);
  },
  false
);
