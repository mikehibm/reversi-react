import * as React from 'react';
import store, { PageTag } from '../store';
import { Player, Colors } from '../reversi';
import humanPlayer from '../players/humanPlayer';
import computerPlayer from '../players/computerPlayer';
import './Setting.css';

type SettingProps = {
  prevPage: PageTag;
  page: PageTag;
};

type SettingState = {
  p1: Player;
  p2: Player;
  hidden: Boolean;
};

const thisPage: PageTag = 'setting';

export default class Setting extends React.Component<SettingProps, SettingState> {
  constructor(props: SettingProps) {
    super(props);

    this.blackPlayers = [humanPlayer('You'), computerPlayer('cpu1'), computerPlayer('cpu2'), computerPlayer('cpu3')];
    this.whitePlayers = [humanPlayer('You'), computerPlayer('cpu1'), computerPlayer('cpu2'), computerPlayer('cpu3')];

    this.state = {
      p1: this.blackPlayers[0],
      p2: this.whitePlayers[1],
      hidden: true,
    };
  }
  blackPlayers: Player[];
  whitePlayers: Player[];

  handleBack = () => store.setPage('menu');

  handleSelect = (p: Player, color: Colors) => {
    const newState = {
      ...this.state,
      p1: color === Colors.Black ? p : this.state.p1,
      p2: color === Colors.White ? p : this.state.p2,
    };
    this.setState(newState);
  };

  componentDidUpdate(prevProps: SettingProps) {
    const { prevPage, page } = this.props;

    // When this screen becomes hidden
    if (prevPage === thisPage && prevProps.prevPage !== thisPage) {
      this.setState({ hidden: true });
    }

    // When this screen becomes visible
    if (page === thisPage && prevProps.page !== thisPage) {
      this.setState({ hidden: false });
    }
  }

  handleStart = () => {
    const { p1, p2 } = this.state;
    if (p1.name === p2.name) {
      p1.name = 'Black';
      p2.name = 'White';
    }
    store.startGame(p1, p2);
  };

  renderPlayers(color: Colors) {
    const { p1, p2 } = this.state;
    const players = color === Colors.Black ? this.blackPlayers : this.whitePlayers;
    return players.map((p, ix) => {
      let classNames = `primary ${color === Colors.Black ? 'black' : 'white'}`;
      if (p === p1) classNames += ' active';
      if (p === p2) classNames += ' active';
      return (
        <button key={ix} className={classNames} onClick={() => this.handleSelect(p, color)}>
          {p.isHuman ? p.name : ix}
        </button>
      );
    });
  }

  render() {
    const className =
      'Setting ' + (this.state.hidden ? (this.props.page === 'game' ? 'hidden-left ' : 'hidden-right ') : '');

    return (
      <div className={className}>
        <div className="Setting-header">
          <button className="" onClick={this.handleBack}>
            Back
          </button>
        </div>
        <ul>
          <li className="playerLabel">
            <h3>Black</h3>
          </li>
          <li className="levels">{this.renderPlayers(Colors.Black)}</li>
          <li className="playerLabel">
            <h3>White</h3>
          </li>
          <li className="levels">{this.renderPlayers(Colors.White)}</li>
          <li>
            <button className="primary start" onClick={() => this.handleStart()}>
              Start
            </button>
          </li>
        </ul>
      </div>
    );
  }
}
