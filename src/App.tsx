import * as React from 'react';
import store, { Pages } from './store';
import Menu from './components/Menu';
import Game from './components/Game';
import './App.css';

interface Props {}
interface State {
  page: Pages;
}

class App extends React.Component<Props, State> {
  state = { page: 'menu' as Pages };

  onChangeStore = () => {
    const { page } = store.getState();
    this.setState({ page });
  };

  componentDidMount() {
    store.on('page_changed', this.onChangeStore);
  }
  componentWillUnmount() {
    store.off('page_changed', this.onChangeStore);
  }

  public render() {
    const { page } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Reversi</h1>
        </header>
        {page === 'game' ? <Game /> : <Menu />}
      </div>
    );
  }
}

export default App;
