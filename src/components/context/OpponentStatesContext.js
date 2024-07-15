import { createContext, useContext, useState } from 'react';


const OpponentStatesContext = createContext();

/**
 * React component for providing game states of the opponent to its children.
 * @component
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The child components to be wrapped by the OpponentStatesProvider.
 * @returns {JSX.Element} React JSX element representing the OpponentStatesProvider component.
 */
export const OpponentStatesProvider = ({ children }) => {

    const [opponentStates, setOpponentStates] = useState({
        ready2Play: false,
        pausedGame: false,
        leaveGame: false,        
        exitConfirmed: false,
        timeIsOut: false,
        battleModeOn: false,
        gameIsOver: false,
    });

  return (
    <OpponentStatesContext.Provider value={{ opponentStates, setOpponentStates }}>
      {children}
    </OpponentStatesContext.Provider>
  );
};

/**
 * Custom hook for accessing the opponent game states from the OpponentStatesContext.
 * @function
 * @returns {OpponentStatesContext} The opponent game states and the corresponding setOpponentStates function.
 * @example
 * const { opponentStates, setOpponentStates } = useOpponentStates();
 */
export const useOpponentStates = () => {
  return useContext(OpponentStatesContext);
};
