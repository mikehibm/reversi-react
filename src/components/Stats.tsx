import * as React from 'react';
import store, { BoardState } from '../store';

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
    store.on('board_changed', this.onChangeStore);
  }
  componentWillUnmount() {
    store.off('board_changed', this.onChangeStore);
  }

  render() {
    const { board } = this.state;
    const { currentPlayerName, turnCount, blackCount, whiteCount } = board;
    return (
      <>
        <p>
          Turn {turnCount}: {currentPlayerName}
        </p>
        <p>
          Black: {blackCount}, White: {whiteCount}
        </p>
      </>
    );
  }
}
