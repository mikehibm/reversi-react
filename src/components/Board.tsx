import * as React from 'react';
import store, { EV_BOARD_CHANGED } from '../store';
import { ROWS, COLS, BoardState } from '../reversi';
import Cell from './Cell';
import thinking from '../thinking.svg';

interface Props {
  width: number;
  height: number;
}
interface State {
  board: BoardState;
}

export default class Board extends React.Component<Props, State> {
  state = { board: store.getState().board };

  onChangeStore = () => {
    const { board } = store.getState();
    this.setState({ board });
  };
  componentDidMount() {
    store.on(EV_BOARD_CHANGED, this.onChangeStore);
  }
  componentWillUnmount() {
    store.off(EV_BOARD_CHANGED, this.onChangeStore);
  }

  render() {
    const { board } = this.state;
    const isHuman = board.currentPlayer.isHuman;
    const { width, height } = this.props;
    const padding = 30;
    const rw = width - padding * 2;
    const rh = height - padding * 2;
    const cw = rw / COLS;
    const ch = rh / ROWS;
    const x0 = padding;
    const y0 = padding;

    const vlines = Array.from(new Array(8).keys()).map((_, i) => (
      <line
        key={`v-${i}`}
        x1={x0 + cw * (i + 1)}
        y1={y0}
        x2={x0 + cw * (i + 1)}
        y2={y0 + rh}
        strokeWidth="1"
        stroke="black"
      />
    ));

    const hlines = Array.from(new Array(ROWS).keys()).map((_, i) => (
      <line
        key={`h-${i}`}
        x1={x0}
        y1={y0 + ch * (i + 1)}
        x2={x0 + rw}
        y2={y0 + ch * (i + 1)}
        strokeWidth="1"
        stroke="black"
      />
    ));

    const hletters = Array.from(new Array(COLS).keys()).map((_, i) => (
      <text key={`h-${i}`} x={cw * i + cw / 2 + padding - 6} y={padding / 2 + 7} fontSize="16" stroke="black">
        {String.fromCharCode('a'.charCodeAt(0) + i)}
      </text>
    ));

    const vletters = Array.from(new Array(ROWS).keys()).map((_, i) => (
      <text key={`v-${i}`} x={padding / 2 - 4} y={ch * i + ch / 2 + padding + 7} fontSize="16" stroke="black">
        {String.fromCharCode('1'.charCodeAt(0) + i)}
      </text>
    ));

    const cells = Array.from(new Array(ROWS * COLS).keys()).map((_, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = x0 + cw * col;
      const y = y0 + ch * row;
      const cell = board.cells[row][col];
      return <Cell key={`cell-${i}`} x0={x} y0={y} width={cw} height={ch} cell={cell} />;
    });

    return (
      <>
        {!isHuman && <img src={thinking} className="Game-thinking" alt="thinking" />}
        <svg className="Board" width={width} height={height}>
          <g>{hletters}</g>
          <g>{vletters}</g>
          <g>
            <rect x={x0} y={y0} width={rw} height={rh} stroke="black" strokeWidth="1" fill="green" />
            {vlines}
            {hlines}
          </g>
          <g>{cells}</g>
        </svg>
      </>
    );
  }
}
