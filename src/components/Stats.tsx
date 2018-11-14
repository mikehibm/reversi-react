import * as React from 'react';
import store, { EV_BOARD_CHANGED } from '../store';
import { BoardState } from '../reversi';

interface Props {}
interface State {
  board: BoardState;
}

export default class Stats extends React.Component<Props, State> {
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
    const { currentPlayer, turnCount, blackCount, whiteCount } = board;
    return (
      <>
        <p>
          Turn {turnCount}: {currentPlayer.name}
        </p>
        <p>
          Black: {blackCount}, White: {whiteCount}
        </p>
      </>
    );
  }
}
