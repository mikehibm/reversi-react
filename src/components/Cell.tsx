import * as React from 'react';
import store from '../store';
import { Position, Colors, COLS } from '../reversi';

interface Props {
  x0: number;
  y0: number;
  width: number;
  height: number;
  index: number;
  color: Colors;
  placeable: boolean;
  is_stable: boolean;
  is_human: boolean;
}

export default function Cell({ x0, y0, width, height, index, color, placeable, is_stable, is_human }: Props) {
  const colorNames = ['none', 'black', 'white'];
  const colorName = colorNames[color];
  const cx = x0 + width / 2;
  const cy = y0 + height / 2;
  const r = width * 0.44;
  const cellClass = placeable && is_human ? 'Cell-placeable' : 'Cell';
  const rectClass = placeable && is_human ? 'Cell-rect-placeable' : 'Cell-rect';

  return (
    <g className={cellClass} onClick={placeable ? () => handleClick(index) : undefined}>
      <circle className="Cell-circle" cx={cx} cy={cy} r={r} stroke="none" fill={colorName} />
      {placeable && (
        <circle className="Cell-marker-placeable" cx={cx} cy={cy} r={width * 0.06} stroke="none" fill={'yellow'} />
      )}
      {is_stable && <circle className="Cell-stable" cx={cx} cy={cy} r={width * 0.12} stroke="none" fill={'gray'} />}
      <rect className={rectClass} x={x0} y={y0} width={width} height={height} stroke="none" fill="white" />
    </g>
  );
}

function handleClick(index: number) {
  const payload: Position = {
    row: Math.floor(index / COLS),
    col: index % COLS,
  };
  const board = store.getState().board;
  if (!board.currentPlayer.isHuman) {
    return;
  }
  store.setStone(board, payload);
}
