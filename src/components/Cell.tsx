import * as React from 'react';
import store, { CellClick } from '../store';

interface Props {
  x0: number;
  y0: number;
  width: number;
  height: number;
  index: number;
  color: number;
}

export default function Cell({ x0, y0, width, height, index, color }: Props) {
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
      <rect
        className="Cell-rect"
        x={x0}
        y={y0}
        width={width}
        height={height}
        stroke="none"
        fill="white"
      />
    </g>
  );
}

function handleClick(index: number) {
  // console.log(`handleClick: ${index}`);
  const payload: CellClick = {
    x: index % 8,
    y: Math.floor(index / 8),
  };
  store.setStone(payload);
}
