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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var Colors;
(function (Colors) {
    Colors[Colors["None"] = 0] = "None";
    Colors[Colors["Black"] = 1] = "Black";
    Colors[Colors["White"] = 2] = "White";
})(Colors || (Colors = {}));
var ROWS = 8;
var COLS = 8;
var MAX_SCORE = 999999999;
var STABLE_SCORE = 500;
function forAllCells(board, func) {
    board.cells.forEach(function (row) {
        row.forEach(func);
    });
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
    if (!isOutOfRange(row, col)) {
        var cell_1 = newBoard.cells[row][col];
        if (cell_1.placeable) {
            cell_1.color = newBoard.turn;
            var turnableCells = cell_1.turnableCells.map(function (p) { return newBoard.cells[p.row][p.col]; });
            turnableCells.forEach(function (c) { return (c.color = cell_1.color); });
            __spread([cell_1], turnableCells).forEach(function (c) { return checkIfStable(newBoard, c); });
        }
    }
    newBoard.lastMove = { row: row, col: col };
    return getNextTurn(newBoard);
}
function getReversedColor(color) {
    return color === Colors.Black ? Colors.White : Colors.Black;
}
function getNextTurn(board) {
    board.turnCount++;
    board.turn = getReversedColor(board.turn);
    var white = 0, black = 0, none = 0, placeableCount = 0, stableCount = 0;
    forAllCells(board, function (cell) {
        cell.placeable = checkIfPlaceable(board, cell, board.turn);
        if (cell.placeable)
            placeableCount++;
        if (cell.is_stable)
            stableCount++;
        if (cell.color === Colors.White)
            white++;
        if (cell.color === Colors.Black)
            black++;
        if (cell.color === Colors.None)
            none++;
    });
    board.placeableCount = placeableCount;
    board.stableCount = stableCount;
    board.whiteCount = white;
    board.blackCount = black;
    board.finished = none === 0 || white === 0 || black === 0 || (board.lastMove.row < 0 && board.placeableCount === 0);
    board.currentPlayer = board.turn === Colors.Black ? board.blackPlayer : board.whitePlayer;
    board.winner = board.finished
        ? black === white
            ? undefined
            : black > white
                ? board.blackPlayer
                : board.whitePlayer
        : undefined;
    return board;
}
function isOutOfRange(row, col) {
    return row < 0 || col < 0 || row >= ROWS || col >= COLS;
}
function isCorner(row, col) {
    var corners = [
        { row: 0, col: 0 },
        { row: 0, col: COLS - 1 },
        { row: ROWS - 1, col: 0 },
        { row: ROWS - 1, col: COLS - 1 },
    ];
    return corners.filter(function (c) { return c.row === row && c.col === col; }).length > 0;
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
function checkIfStable(board, cell) {
    if (!cell || isOutOfRange(cell.row, cell.col) || cell.color === Colors.None)
        return false;
    console.log("Checking if stable (" + cell.col + "," + cell.row + ")");
    if (isCorner(cell.row, cell.col)) {
        cell.is_stable = true;
    }
    else if (!cell.is_stable) {
        var cur_color = cell.color;
        var stable_count = 0;
        var cnt = 0;
        for (var dy = -1; dy <= 1; dy++) {
            for (var dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0)
                    continue;
                var px = cell.col + dx;
                var py = cell.row + dy;
                var isOut = isOutOfRange(py, px);
                var c = isOut ? null : board.cells[py][px];
                if (isOut || (c && c.color === cur_color && c.is_stable)) {
                    var cx = cell.col + dx * -1;
                    var cy = cell.row + dy * -1;
                    var crossIsOut = isOutOfRange(cy, cx);
                    var cross = crossIsOut ? null : board.cells[cy][cx];
                    if (isOut || ((cross && cross.color !== cur_color) || (cross && !cross.is_stable))) {
                        stable_count++;
                        if (stable_count >= 4)
                            dy = dx = 2;
                    }
                }
                cnt++;
            }
        }
        cell.is_stable = stable_count >= 4;
    }
    if (cell.is_stable) {
        console.log("(" + cell.col + "," + cell.row + ") is stable.");
        for (var dy = -1; dy <= 1; dy++) {
            for (var dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0)
                    continue;
                var px = cell.col + dx;
                var py = cell.row + dy;
                var c = isOutOfRange(py, px) ? null : board.cells[py][px];
                if (c && c.color == cell.color && !c.is_stable) {
                    checkIfStable(board, c);
                }
            }
        }
    }
    return cell.is_stable;
}
function filterStableCells(board) {
    var stableCells = [];
    forAllCells(board, function (c) {
        if (c.is_stable)
            stableCells.push(c);
    });
    return stableCells;
}
function debugStables(board) {
    var list = filterStableCells(board);
    if (list.length === 0)
        return;
    console.log("Stable cells: ");
    var msg = '';
    list.forEach(function (c) {
        msg += "(" + c.col + "," + c.row + "), ";
    });
    console.log(msg);
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
function getPlaceableCells(board) {
    var placeableCells = [];
    board.cells.forEach(function (row) {
        Array.prototype.push.apply(placeableCells, row.filter(function (cell) { return cell.placeable; }));
    });
    return placeableCells;
}
function getWeight(cell, tbl, row, col, color) {
    if (cell.color === color) {
        return cell.is_stable ? STABLE_SCORE : tbl[row][col];
    }
    else {
        return cell.is_stable ? STABLE_SCORE * -1 : tbl[row][col];
    }
}
function evaluateByWeight(board, weightTable, color) {
    var total = 0;
    var opponent_color = getReversedColor(color);
    var player_count = 0;
    var opponent_count = 0;
    for (var i = 0; i < ROWS; i++) {
        for (var j = 0; j < COLS; j++) {
            var cell = board.cells[i][j];
            var st = cell.color;
            if (st === color) {
                player_count++;
                total += getWeight(cell, weightTable, i, j, color);
            }
            else if (st == opponent_color) {
                opponent_count++;
                total -= getWeight(cell, weightTable, i, j, opponent_color);
            }
        }
    }
    if (player_count == 0)
        total = -MAX_SCORE;
    if (opponent_count == 0)
        total = MAX_SCORE;
    return total;
}
var CalcType;
(function (CalcType) {
    CalcType[CalcType["weightTable"] = 0] = "weightTable";
    CalcType[CalcType["WinOrLose"] = 1] = "WinOrLose";
})(CalcType || (CalcType = {}));
function evaluateByMinMax(cell, board, weightTable, depth) {
    var nextBoard = placeStoneAndGetNextTurn(board, { row: cell.row, col: cell.col });
    if (depth <= 0) {
        return evaluateByWeight(nextBoard, weightTable, nextBoard.turn) * -1;
    }
    var placeableCells = getPlaceableCells(nextBoard);
    if (!placeableCells.length) {
        return evaluateByMinMax({ row: -1, col: -1 }, nextBoard, weightTable, depth - 1) * -1;
    }
    placeableCells.forEach(function (cell) {
        cell.value = evaluateByMinMax(cell, nextBoard, weightTable, depth - 1) * -1;
        console.log("Depth: " + depth + " (" + cell.col + "," + cell.row + ") v = " + cell.value);
    });
    placeableCells.sort(function (a, b) { return b.value - a.value; });
    var topCell = placeableCells[0];
    console.log("Depth: " + depth + " Top cell is (" + topCell.col + "," + topCell.row + ") v = " + topCell.value);
    return topCell.value;
}
