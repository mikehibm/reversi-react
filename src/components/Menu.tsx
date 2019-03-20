import * as React from 'react';
import store, { PageTag } from '../store';
import humanPlayer from '../players/humanPlayer';
import './Menu.css';

type MenuProps = {
  prevPage: PageTag;
  page: PageTag;
};
type MenuState = {
  hidden: Boolean;
};

const thisPage: PageTag = 'menu';

export default class Menu extends React.Component<MenuProps, MenuState> {
  state = {
    hidden: true,
  };

  componentDidMount() {
    setTimeout(() => {
      this.setState({ hidden: false });
    }, 10);
  }
  componentDidUpdate(prevProps: MenuProps) {
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

  render() {
    const { hidden } = this.state;

    const handleNext = () => store.setPage('setting');
    const handleVSHuman = () => {
      const p1 = humanPlayer('Black');
      const p2 = humanPlayer('White');
      store.startGame(p1, p2);
    };

    return (
      <div className={'Menu ' + (hidden ? 'hidden ' : '')}>
        <h1>Let's start!</h1>
        <ul>
          <li>
            <button className="primary" onClick={handleNext}>
              VS Computer
            </button>
          </li>
          <li>
            <button className="primary" onClick={handleVSHuman}>
              VS Human
            </button>
          </li>
        </ul>
      </div>
    );
  }
}
