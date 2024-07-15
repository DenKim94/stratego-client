import { createContext, useContext, useState } from 'react';

const ChannelStatesContext = createContext();

/**
 * React component for providing channel states to its children.
 * @component
 * @param {Object} channelObj - Channel properties
 * @param {Object} cookieObj - Cookie properties
 * @param {React.ReactNode} props.children - The child components to be wrapped by the ChannelStatesProvider.
 * @returns {JSX.Element} React JSX element representing the ChannelStatesProvider component.
 */
export const ChannelStatesProvider = ({ children }) => {
  const [channelStates, setChannelStates] = useState({
    channelObj: null,
    cookieObj: null,
  });

  return (
    <ChannelStatesContext.Provider value={{ channelStates, setChannelStates }}>
      {children}
    </ChannelStatesContext.Provider>
  );
};

/**
 * Custom hook for accessing the channel states from the ChannelStatesContext.
 * @function
 * @returns {ChannelStatesContext} The channel states and the corresponding setChannelStates function.
 * @example
 * const { channelStates, setChannelStates } = useChannelStates();
 */
export const useChannelStates = () => {
  return useContext(ChannelStatesContext);
  
};
