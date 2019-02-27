/// <reference path="../reversi.worker.ts" />
importScripts('../reversi.worker.js');
declare function postMessage(obj: any): void;

self.addEventListener(
  'message',
  function(e: any) {
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

    console.log('CPU2 Worker called: ', e.data);
    const board: BoardState = e.data.board;
    const color = board.turn;

    const placeableCells: CellState[] = getPlaceableCells(board);
    if (!placeableCells.length) {
      postMessage({ row: -1, col: -1 });
      return;
    }

    const depth = 1;
    placeableCells.forEach((cell) => {
      console.log(`Evaluating: ${cell.col},${cell.row} for depth of ${depth}...`);
      // それぞれの候補の評価値を得る
      cell.value = evaluateByMinMax(cell, board, weightTable, depth);
      console.log(`Value (${cell.col},${cell.row}) = ${cell.value}`);
    });

    // 評価値の降順にソート
    placeableCells.sort((a, b) => b.value - a.value);

    // // 80%の確率で先頭の候補、20%の確率で先頭から2つのうちどちらかを選ぶ。
    // const topN = Math.random() * 100 <= 20 ? 2 : 1;
    // const index = Math.floor(Math.random() * Math.min(topN, placeableCells.length));
    const cell = placeableCells[0];
    postMessage({ row: cell.row, col: cell.col });
  },
  false
);
