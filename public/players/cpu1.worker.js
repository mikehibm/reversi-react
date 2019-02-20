importScripts('../reversi.worker.js');
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
self.addEventListener('message', function (e) {
    console.log('Worker called: ', e.data);
    var board = e.data.board;
    var color = board.turn;
    var placeableCells = [];
    board.cells.forEach(function (row) {
        row.forEach(function (cell) {
            if (cell.placeable) {
                console.log("Evaluating: " + cell.col + "," + cell.row + "...");
                var nextBoard = placeStoneAndGetNextTurn(board, { row: cell.row, col: cell.col });
                if (nextBoard) {
                    cell.value = calcWeightTotal(nextBoard, weightTable, color);
                    console.log("Value (" + cell.col + "," + cell.row + ") = " + cell.value);
                    placeableCells.push(cell);
                }
            }
        });
    });
    if (!placeableCells.length) {
        postMessage({ row: -1, col: -1 }, undefined);
        return;
    }
    placeableCells.sort(function (a, b) {
        return b.value - a.value;
    });
    var topN = Math.random() * 100 <= 30 ? 2 : 1;
    var index = Math.floor(Math.random() * Math.min(topN, placeableCells.length));
    var cell = placeableCells[index];
    postMessage({ row: cell.row, col: cell.col }, undefined);
}, false);
