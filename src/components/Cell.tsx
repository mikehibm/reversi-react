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
}

export default function Cell({ x0, y0, width, height, index, color, placeable, is_stable }: Props) {
  const colorNames = ['none', 'black', 'white'];
  const colorName = colorNames[color];
  const cx = x0 + width / 2;
  const cy = y0 + height / 2;
  const r = width * 0.44;

  return (
    <g className="Cell" onClick={() => handleClick(index)}>
      <circle className="Cell-circle" cx={cx} cy={cy} r={r} stroke="none" fill={colorName} />
      {placeable && (
        <circle className="Cell-placeable" cx={cx} cy={cy} r={width * 0.06} stroke="none" fill={'yellow'} />
      )}
      {is_stable && <circle className="Cell-stable" cx={cx} cy={cy} r={width * 0.12} stroke="none" fill={'gray'} />}
      <rect className="Cell-rect" x={x0} y={y0} width={width} height={height} stroke="none" fill="white" />
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
