import React from 'react';
import { styleGameLogo } from '../../game-logic/parameters.js';

/** 
 * React component renders the title of the game 
 * @component
 */
const GameLogo = () => {
  return (
    <div className="game-logo" style = {styleGameLogo}>
      <h1 style = {{fontSize: styleGameLogo.fontSize}} >Stratego</h1>
    </div>
  );
};

export default GameLogo;
