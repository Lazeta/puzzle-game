import React from 'react';
import './App.css';
import { Grid } from './components/Grid';

const App: React.FC= () => {
  return (
    <div className="App">
      <header className="App-header">
        <h2>Puzzle game</h2>
        
        <Grid/>
      </header>
    </div>
  );
}

export default App;
