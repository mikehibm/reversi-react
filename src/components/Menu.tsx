import * as React from 'react';
import store from '../store';

export default function Menu() {
  const handleStart = () => {
    store.setPage('game');
  };

  return (
    <div>
      <h1>Let's start!</h1>
      <button className="primary" onClick={handleStart}>
        Start
      </button>
    </div>
  );
}
