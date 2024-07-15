import { createContext, useContext, useState } from 'react';

const ButtonStatesContext = createContext();

/**
 * React component for providing button states to its children.
 * @component
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The child components to be wrapped by the ButtonStatesProvider.
 * @returns {JSX.Element} React JSX element representing the ButtonStatesProvider component.
 */
export const ButtonStatesProvider = ({ children }) => {
  const [buttonStates, setButtonStates] = useState({
    pauseButtonText: "Pause Game",
    startButtonText: "Start Game",
    exitButtonText: "Leave Game",
    disabledStartButton: true,
    counterUsedStartButton: 0,
  });

  return (
    <ButtonStatesContext.Provider value={{ buttonStates, setButtonStates }}>
      {children}
    </ButtonStatesContext.Provider>
  );
};

/**
 * Custom hook for accessing the button states from the ButtonStatesContext.
 * @function
 * @returns {ButtonStatesContext} The button states and the corresponding setButtonStates function.
 * @example
 * const { buttonStates, setButtonStates } = useButtonStates();
 */
export const useButtonStates = () => {
  return useContext(ButtonStatesContext);
};

