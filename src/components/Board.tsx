import * as React from 'react';
import store, { EV_BOARD_CHANGED, EV_BOARD_FLIPPING, FlippingEvent } from '../store';
import { ROWS, COLS, BoardState } from '../reversi';
import Cell from './Cell';
import spinner from '../spinner.svg';
import './Board.css';

type Props = {
  width: number;
  height: number;
};
type State = {
  board: BoardState;
  flipping: FlippingEvent | null;
};

const HEADER_HEIGHT = 64;

export default class Board extends React.Component<Props, State> {
  state = { board: store.getState().board, flipping: null };

  onChangeStore = () => {
    const { board } = store.getState();
    this.setState({ board, flipping: null });
  };

  onFlipping = (flipping: FlippingEvent) => {
    const { board } = store.getState();
    console.log(flipping.count, flipping.total, board.isFlipping, board.flippingCells);
    this.setState({ board, flipping });
  };

  componentDidMount() {
    store.on(EV_BOARD_CHANGED, this.onChangeStore);
    store.on(EV_BOARD_FLIPPING, this.onFlipping);
  }
  componentWillUnmount() {
    store.off(EV_BOARD_CHANGED, this.onChangeStore);
    store.off(EV_BOARD_FLIPPING, this.onFlipping);
  }

  render() {
    const { board, flipping } = this.state;
    const { finished, currentPlayer, isFlipping } = board;
    const isHuman = currentPlayer.isHuman;
    const { width, height } = this.props;
    const padding = 36;
    const rw = width - padding * 2;
    const rh = height - padding * 2;
    const cw = rw / COLS;
    const ch = rh / ROWS;
    const x0 = padding;
    const y0 = padding;
    const center = { x: x0 + rw / 2, y: y0 + rh / 2 };

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
      const flippingData =
        board.flippingCells &&
        (board.flippingCells.find((c) => c.row === cell.row && c.col === cell.col) ? flipping : undefined);
      return <Cell key={`cell-${i}`} x0={x} y0={y} width={cw} height={ch} cell={cell} flipping={flippingData} />;
    });

    const winnerMsg = board.winner ? (
      <>
        WINNER
        <br />
        IS
        <br />
        {board.winner.name}!!
      </>
    ) : (
      <>DRAW GAME</>
    );

    return (
      <div className="Board">
        {!finished && !isHuman && !isFlipping && (
          <img src={spinner} className="Board-spinner" style={{ top: center.y + HEADER_HEIGHT }} alt="spinner" />
        )}
        {finished && (
          <div className="Board-winner" style={{ top: center.y + HEADER_HEIGHT }}>
            {winnerMsg}
          </div>
        )}
        <svg width={width} height={height}>
          <g>{hletters}</g>
          <g>{vletters}</g>
          <g>
            <rect x={x0} y={y0} width={rw} height={rh} stroke="black" strokeWidth="1" fill="green" />
            {vlines}
            {hlines}
          </g>
          <g>{cells}</g>
        </svg>
      </div>
    );
  }
}
