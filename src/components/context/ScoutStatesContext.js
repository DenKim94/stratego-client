import { createContext, useContext, useState } from 'react';

const ScoutStatesContext = createContext();

/**
 * React component for providing scout states to its children.
 * @component
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The child components to be wrapped by the ScoutStatesProvider.
 * @returns {JSX.Element} React JSX element representing the ScoutStatesProvider component.
 */
export const ScoutStatesProvider = ({ children }) => {
  const [scoutStates, setScoutStates] = useState({
    isDraggedOverFigure: false,
    sourcePosition: null,
    targetPosition: null,
    isValidMove: true,
  });

  return (
    <ScoutStatesContext.Provider value={{ scoutStates, setScoutStates }}>
      {children}
    </ScoutStatesContext.Provider>
  );
};

/**
 * Custom hook for accessing the scout states from the ScoutStatesContext.
 * @function
 * @returns {ScoutStatesContext} The scout states and the corresponding setScoutStates function.
 * @example
 * const { scoutStates, setScoutStates } = useScoutStates();
 */
export const useScoutStates = () => {
  return useContext(ScoutStatesContext);
};
