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

    console.log('CPU3 Worker called: ', e.data);
    const board: BoardState = e.data.board;

    const placeableCells: CellState[] = getPlaceableCells(board);
    if (!placeableCells.length) {
      postMessage({ row: -1, col: -1 });
      return;
    }

    const depth = 3;
    placeableCells.forEach((cell) => {
      console.log(`Evaluating: ${positionToStr(cell.row, cell.col)} for depth of ${depth}...`);
      // それぞれの候補の評価値を得る
      cell.value = evaluateByMinMax(cell, board, weightTable, depth);
      console.log(`Value ${positionToStr(cell.row, cell.col)} = ${cell.value}`);
    });

    // 評価値の降順にソート
    placeableCells.sort((a, b) => b.value - a.value);

    // 最高の評価値のセルが複数あればそれらの中からランダムに選ぶ。
    const topValue = placeableCells[0].value;
    const topCells = placeableCells.filter((c) => c.value === topValue);
    if (topCells.length > 1) {
      const cell = topCells[Math.floor(Math.random() * topCells.length)];
      postMessage({ row: cell.row, col: cell.col });
      return;
    }

    // // 80%の確率で先頭の候補、20%の確率で先頭から2つのうちどちらかを選ぶ。
    // const topN = Math.random() * 100 <= 20 ? 2 : 1;
    // const index = Math.floor(Math.random() * Math.min(topN, placeableCells.length));
    // const cell = placeableCells[index];
    const cell = placeableCells[0];
    postMessage({ row: cell.row, col: cell.col });
  },
  false
);
