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
}

export default function Cell({ x0, y0, width, height, index, color, placeable }: Props) {
  const colorNames = ['none', 'black', 'white'];
  const colorName = colorNames[color];

  return (
    <g className="Cell" onClick={() => handleClick(index)}>
      <circle
        className="Cell-circle"
        cx={x0 + width / 2}
        cy={y0 + height / 2}
        r={width * 0.44}
        stroke="none"
        fill={colorName}
      />
      {placeable && (
        <circle
          className="Cell-placeable"
          cx={x0 + width / 2}
          cy={y0 + height / 2}
          r={width * 0.06}
          stroke="none"
          fill={'yellow'}
        />
      )}
      <rect className="Cell-rect" x={x0} y={y0} width={width} height={height} stroke="none" fill="white" />
    </g>
  );
}

function handleClick(index: number) {
  const payload: Position = {
    row: Math.floor(index / COLS),
    col: index % COLS,
  };
  store.setStone(payload);
}
