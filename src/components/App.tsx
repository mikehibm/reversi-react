import * as React from 'react';
import store, { PageTag, EV_PAGE_CHANGED } from '../store';
import Menu from './Menu';
import Setting from './Setting';
import Game from './Game';
import './App.css';

type Props = {};
type State = {
  prevPage: PageTag;
  page: PageTag;
};

class App extends React.Component<Props, State> {
  state = { prevPage: 'setting' as PageTag, page: 'menu' as PageTag };

  onPageChange = () => {
    const prevPage = this.state.page;
    const { page } = store.getState();
    this.setState({ prevPage, page });
  };

  componentDidMount() {
    store.on(EV_PAGE_CHANGED, this.onPageChange);
  }
  componentWillUnmount() {
    store.off(EV_PAGE_CHANGED, this.onPageChange);
  }

  public render() {
    const { prevPage, page } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Reversi</h1>
        </header>
        <Game prevPage={prevPage} page={page} />
        <Setting prevPage={prevPage} page={page} />
        <Menu prevPage={prevPage} page={page} />
      </div>
    );
  }
}

export default App;
