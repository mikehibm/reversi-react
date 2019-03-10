import * as React from 'react';
import store, { Pages, EV_PAGE_CHANGED } from './store';
import Menu from './components/Menu';
import Setting from './components/Setting';
import Game from './components/Game';
import './App.css';

type Props = {};
type State = {
  page: Pages;
};

class App extends React.Component<Props, State> {
  state = { page: 'menu' as Pages };

  onChangeStore = () => {
    const { page } = store.getState();
    this.setState({ page });
  };

  componentDidMount() {
    store.on(EV_PAGE_CHANGED, this.onChangeStore);
  }
  componentWillUnmount() {
    store.off(EV_PAGE_CHANGED, this.onChangeStore);
  }

  public render() {
    const { page } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Reversi</h1>
        </header>
        {page === 'menu' && <Menu />}
        {page === 'setting' && <Setting />}
        {page === 'game' && <Game />}
      </div>
    );
  }
}

export default App;
