import * as React from 'react';
import store from '../store';
import { CellState, positionToStr } from '../reversi';

type Props = {
  x0: number;
  y0: number;
  width: number;
  height: number;
  cell: CellState;
};

export default function Cell({ x0, y0, width, height, cell }: Props) {
  const { board } = store.getState();
  const { currentPlayer, lastMove } = board;
  const isHuman = currentPlayer.isHuman;
  const { row, col, color, placeable, is_stable } = cell;
  const isLastMove = lastMove.row === row && lastMove.col === col;
  const colorNames = ['none', 'black', 'white'];
  const colorName = colorNames[color];
  const cx = x0 + width / 2;
  const cy = y0 + height / 2;
  const r = width * 0.44;
  const cellClass = 'Cell' + (placeable && isHuman ? '-placeable' : '');
  const rectClass = 'Cell-rect' + (placeable && isHuman ? '-placeable' : '');

  return (
    <g className={cellClass} onClick={placeable && isHuman ? () => handleClick(row, col) : undefined}>
      <circle className="Cell-circle" cx={cx} cy={cy} r={r} stroke="none" fill={colorName} />
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
