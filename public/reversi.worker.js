var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var Colors;
(function (Colors) {
    Colors[Colors["None"] = 0] = "None";
    Colors[Colors["Black"] = 1] = "Black";
    Colors[Colors["White"] = 2] = "White";
})(Colors || (Colors = {}));
var ROWS = 8;
var COLS = 8;
function initBoard(blackPlayer, whitePlayer) {
    var cells = Array.from(new Array(ROWS).keys()).map(function (_, row) {
        return Array.from(new Array(COLS).keys()).map(function (_, col) {
            return {
                index: row * COLS + col,
                col: col,
                row: row,
                color: Colors.None,
                placeable: false,
                turnableCells: [],
                value: 0,
            };
        });
    });
    var cx = COLS / 2 - 1;
    var cy = ROWS / 2 - 1;
    cells[cy][cx].color = Colors.White;
    cells[cy][cx + 1].color = Colors.Black;
    cells[cy + 1][cx].color = Colors.Black;
    cells[cy + 1][cx + 1].color = Colors.White;
    var board = {
        cells: cells,
        turn: Colors.White,
        turnCount: 0,
        blackCount: 0,
        whiteCount: 0,
        placeableCount: 0,
        finished: false,
        lastMove: { row: -1, col: -1 },
        currentPlayer: blackPlayer,
        blackPlayer: blackPlayer,
        whitePlayer: whitePlayer,
    };
    return getNextTurn(board);
}
function cloneBoard(board) {
    return __assign({}, board, { cells: cloneCells(board.cells), lastMove: board.lastMove && __assign({}, board.lastMove) });
}
function cloneCells(cells) {
    return cells.map(function (row) {
        return row.map(function (cell) { return (__assign({}, cell, { turnableCells: cell.turnableCells.map(function (p) { return (__assign({}, p)); }) })); });
    });
}
function placeStoneAndGetNextTurn(board, _a) {
    var row = _a.row, col = _a.col;
    var newBoard = cloneBoard(board);
    var cell = newBoard.cells[row][col];
    if (!cell.placeable) {
        return null;
    }
    cell.color = newBoard.turn;
    newBoard.lastMove = { row: row, col: col };
    cell.turnableCells.forEach(function (_a) {
        var row = _a.row, col = _a.col;
        newBoard.cells[row][col].color = cell.color;
    });
    return getNextTurn(newBoard);
}
function getReversedColor(color) {
    return color === Colors.Black ? Colors.White : Colors.Black;
}
function getNextTurn(board) {
    board.turnCount++;
    board.turn = getReversedColor(board.turn);
    var countWhite = 0, countBlack = 0, countNone = 0, countPlaceable = 0;
    board.cells.forEach(function (row, rowIndex) {
        row.forEach(function (cell, colIndex) {
            cell.placeable = checkIfPlaceable(board, cell, board.turn);
            if (cell.placeable)
                countPlaceable++;
            if (cell.color === Colors.White)
                countWhite++;
            if (cell.color === Colors.Black)
                countBlack++;
            if (cell.color === Colors.None)
                countNone++;
        });
    });
    board.placeableCount = countPlaceable;
    board.whiteCount = countWhite;
    board.blackCount = countBlack;
    board.finished =
        countNone === 0 || countWhite === 0 || countBlack === 0 || (board.lastMove.row < 0 && board.placeableCount === 0);
    board.currentPlayer = board.turn === Colors.Black ? board.blackPlayer : board.whitePlayer;
    board.winner =
        countBlack === countWhite ? undefined : countBlack > countWhite ? board.blackPlayer : board.whitePlayer;
    return board;
}
function checkIfPlaceable(board, cell, turn) {
    cell.turnableCells = [];
    if (cell.color !== Colors.None)
        return false;
    for (var dy = -1; dy <= 1; dy++) {
        for (var dx = -1; dx <= 1; dx++) {
            var foundCells = searchTurnableCells(board, dx, dy, cell, turn, []);
            cell.turnableCells = cell.turnableCells.concat(foundCells);
        }
    }
    return cell.turnableCells.length > 0;
}
function searchTurnableCells(board, dx, dy, cell, turn, arr) {
    if (dx === 0 && dy === 0)
        return [];
    var r = cell.row + dy;
    var c = cell.col + dx;
    if (r < 0 || c < 0 || r > ROWS - 1 || c > COLS - 1)
        return [];
    var opponentColor = getReversedColor(turn);
    var nextCell = board.cells[r][c];
    if (nextCell.color === opponentColor) {
        arr.push({ row: nextCell.row, col: nextCell.col });
        return searchTurnableCells(board, dx, dy, nextCell, turn, arr);
    }
    else if (nextCell.color === turn) {
        return arr;
    }
    return [];
}
function calcWeightTotal(board, weightTable, color) {
    var total = 0;
    var opponent_color = getReversedColor(color);
    var player_count = 0;
    var opponent_count = 0;
    for (var i = 0; i < ROWS; i++) {
        for (var j = 0; j < COLS; j++) {
            var st = board.cells[i][j].color;
            if (st == color) {
                player_count++;
                total += weightTable[i][j];
            }
            else if (st == opponent_color) {
                opponent_count++;
                total -= weightTable[i][j];
            }
        }
    }
    if (player_count == 0)
        total = -999999;
    if (opponent_count == 0)
        total = 999999;
    return total;
}
