import React, { useEffect }  from "react";
import * as parameters from '../../game-logic/parameters.js';
import * as helperFcn from '../functions/helperFunctions.js'
import { useChatContext } from 'stream-chat-react';
import { useGameStates } from '../context/GameStatesContext.js';
import { useChannelStates } from '../context/ChannelStatesContext.js';
import { useLocalStorage } from '../functions/useLocalStorage.js';

/**
 * React component rendered after the user leaves the game.
 * @component
 * @param {Object} exitSectionProps - Additional exit section properties (default to parameters.exitSectionProps).
 * @param {Object} exitSectionProps.style - Custom styles for the component.
 * @returns {JSX.Element} - React JSX element representing the ExitSection component.
 */
const ExitSection = ({exitSectionProps = parameters.exitSectionProps}) => {
    
    const { channelStates } = useChannelStates();
    const { gameStates } = useGameStates();
    const { client } = useChatContext();
    const cookiesObj = channelStates?.cookieObj;
    const { clearLocalStorage } = useLocalStorage();

    useEffect(() => {
        const checkoutUser = async () => {
            // Disconnect user and delete all saved cookies 
            helperFcn.deleteCookies(cookiesObj)
            await helperFcn.disconnectUser(client);
        };

        if(gameStates.exitConfirmed){
            checkoutUser()
            clearLocalStorage()
        }
        // eslint-disable-next-line
    },[client, cookiesObj, gameStates.exitConfirmed])

    return(
        <div style={exitSectionProps.style}>
            {exitSectionProps.message}
        </div>
    )
};

export default ExitSection