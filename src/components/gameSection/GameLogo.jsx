import React, { useEffect }from 'react';
import { styleGameLogo } from '../../game-logic/parameters.js';
import { useGameStates } from '../context/GameStatesContext.js';
import { useChannelStates } from '../context/ChannelStatesContext.js';
import { useChatContext } from 'stream-chat-react';
import { useNavigate } from 'react-router-dom';
import { useOpponentStates } from '../context/OpponentStatesContext.js';
import { useLocalStorage } from '../functions/useLocalStorage.js';
import * as helperFcn from '../functions/helperFunctions.js'

/** 
 * React component renders the title of the game 
 * @component
 */
const GameLogo = () => {
  const { channelStates } = useChannelStates();
  const { gameStates, setGameStates } = useGameStates();
  const { client } = useChatContext();
  const { clearLocalStorage } = useLocalStorage();
  const { setOpponentStates } = useOpponentStates();

  const navigate = useNavigate();
  const cookiesObj = channelStates?.cookieObj;

  const checkoutUser = async () => {
    // Disconnect user and delete all saved cookies 
    helperFcn.deleteCookies(cookiesObj)
    await helperFcn.disconnectUser(client);
  };

  const sendGameStateUpdates = async (data) => channelStates.channelObj?.sendEvent({ type: "click-on-logo", data });
  
  useEffect(() => {
    const handleOpponentLogoClick = (event) => {
      if (event.type === "click-on-logo" && event.user.id !== client.userID) {
        setOpponentStates((prevStates) => ({
          ...prevStates,
          ready2Play: event.data.ready2Play,
          leaveGame: event.data.leaveGame,
          exitConfirmed: event.data.exitConfirmed,
        }));
      }
    };
    channelStates.channelObj?.on("click-on-logo", handleOpponentLogoClick);

    return () => {
      channelStates.channelObj?.off("click-on-logo", handleOpponentLogoClick);
    };
  }, [channelStates.channelObj, client.userID, setOpponentStates]);

  const handleClick = () => {    
    if(!channelStates.channelObj.disconnected){
      const updatedGameStates = {
        ...gameStates,
        ready2Play: false,
        leaveGame: true,
        exitConfirmed: true,
      };
  
      setGameStates(updatedGameStates);
      sendGameStateUpdates(updatedGameStates);   
  
      checkoutUser()
      clearLocalStorage()
    }     
    navigate('/'); 
  };

  return (
    <div className="game-logo" style = {styleGameLogo} onClick={handleClick}>
      <h1 style = {{fontSize: styleGameLogo.fontSize, cursor: 'pointer'}} >Stratego</h1>
    </div>
  );
};

export default GameLogo;
