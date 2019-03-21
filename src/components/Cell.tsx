import * as React from 'react';
import store, { FlippingEvent } from '../store';
import { CellState, positionToStr, getReversedColor, Colors } from '../reversi';

type Props = {
  x0: number;
  y0: number;
  width: number;
  height: number;
  cell: CellState;
  flipping?: FlippingEvent | null | undefined;
};

export default function Cell({ x0, y0, width, height, cell, flipping }: Props) {
  const { board } = store.getState();
  const { currentPlayer, lastMove, isFlipping, flippingCells } = board;
  const isHuman = currentPlayer.isHuman;
  const { row, col, placeable, is_stable } = cell;

  const isLastMove = lastMove.row === row && lastMove.col === col;
  const cx = x0 + width / 2;
  const cy = y0 + height / 2;
  const r = width * 0.44;
  const cellClass = 'Cell' + (placeable && isHuman ? '-placeable' : '');
  const rectClass = 'Cell-rect' + (placeable && isHuman ? '-placeable' : '');

  const flipProgress = flipping ? flipping.count / flipping.total : 0;
  //const opacity = flipping ? Math.abs(flipProgress * 2 - 1) : 1;
  const wrate = flipping ? Math.abs(flipProgress * 2 - 1) : 1;
  const color = flipping && flipProgress < 0.5 ? getReversedColor(cell.color) : cell.color;
  const colorNames = ['none', 'black', 'white'];
  const colorName = colorNames[color];

  return (
    <g
      className={cellClass}
      // opacity={opacity}
      onClick={placeable && isHuman && !isFlipping ? () => handleClick(row, col) : undefined}>
      <ellipse className="Cell-circle" cx={cx} cy={cy} rx={r * wrate} ry={r} stroke="none" fill={colorName} />
      {placeable && (
        <circle className="Cell-marker-placeable" cx={cx} cy={cy} r={width * 0.06} stroke="none" fill={'yellow'} />
      )}
      {/* {is_stable && <circle className="Cell-stable" cx={cx} cy={cy} r={width * 0.12} stroke="none" fill={'gray'} />} */}
      {isLastMove && (
        <rect
          className="Cell-last"
          x={x0 + 2}
          y={y0 + 2}
          width={width - 4}
          height={height - 4}
          rx={width * 0.2}
          ry={width * 0.2}
          strokeWidth="2"
          stroke="red"
          fill="none"
        />
      )}
      <rect className={rectClass} x={x0} y={y0} width={width} height={height} stroke="none" fill="white" />
    </g>
  );
}

function handleClick(row: number, col: number) {
  store.setStone({ row, col });
}
