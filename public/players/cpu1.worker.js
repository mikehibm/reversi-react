importScripts('../reversi.worker.js');
self.addEventListener('message', function (e) {
    var weightTable = [
        [100, -50, 10, 0, 0, 10, -50, 100],
        [-50, -70, -5, -10, -10, -5, -70, -50],
        [10, -5, -10, -5, -5, -10, -5, 10],
        [0, -10, -5, 0, 0, -5, -10, 0],
        [0, -10, -5, 0, 0, -5, -10, 0],
        [10, -5, -10, -5, -5, -10, -5, 10],
        [-50, -70, -5, -10, -10, -5, -70, -50],
        [100, -50, 10, 0, 0, 10, -50, 100],
    ];
    console.log('CPU1 Worker called: ', e.data);
    var board = e.data.board;
    var placeableCells = getPlaceableCells(board);
    if (!placeableCells.length) {
        postMessage({ row: -1, col: -1 });
        return;
    }
    var depth = 1;
    placeableCells.forEach(function (cell) {
        console.log("Evaluating: " + positionToStr(cell.row, cell.col) + " for depth of " + depth + "...");
        cell.value = evaluateByMinMax(cell, board, weightTable, depth);
        console.log("Value " + positionToStr(cell.row, cell.col) + " = " + cell.value);
    });
    placeableCells.sort(function (a, b) { return b.value - a.value; });
    var topValue = placeableCells[0].value;
    var topCells = placeableCells.filter(function (c) { return c.value === topValue; });
    if (topCells.length > 1) {
        var cell_1 = topCells[Math.floor(Math.random() * topCells.length)];
        postMessage({ row: cell_1.row, col: cell_1.col });
        return;
    }
    var topN = Math.random() * 100 <= 20 ? 2 : 1;
    var index = Math.floor(Math.random() * Math.min(topN, placeableCells.length));
    var cell = placeableCells[index];
    postMessage({ row: cell.row, col: cell.col });
}, false);
