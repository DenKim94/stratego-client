import { createContext, useContext, useState } from 'react';


const GameStatesContext = createContext();

/**
 * React component for providing game states to its children.
 * @component
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The child components to be wrapped by the GameStatesProvider.
 * @returns {JSX.Element} React JSX element representing the GameStatesProvider component.
 */
export const GameStatesProvider = ({ children }) => {
  const [gameStates, setGameStates] = useState({

    playerName: '', 
    isPlayer1: false,               
    opponentName: '',         
    colorPlayer1: '',       // Figure-Color of Player 1
    colorPlayer2: '',       // Figure-Color of Player 2
    ready2Play: false,
    isPaused: false,
    leaveGame: false,
    exitConfirmed: false,
    exitCanceled: false,
    timePerTurn_ms: null,   // Time limit per turn for each player in ms
    timeIsOut: false,
    turnPlayer: null,
    battleModeOn: false,
    gameIsOver: false,
  });

  return (
    <GameStatesContext.Provider value={{ gameStates, setGameStates }}>
      {children}
    </GameStatesContext.Provider>
  );
};

/**
 * Custom hook for accessing the game states from the GameStatesContext.
 * @function
 * @returns {GameStatesContext} The game states and the corresponding setGameStates function.
 * @example
 * const { gameStates, setGameStates } = useGameStates();
 */
export const useGameStates = () => {
  return useContext(GameStatesContext);
};
