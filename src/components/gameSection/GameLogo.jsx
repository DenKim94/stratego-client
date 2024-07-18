import React from 'react';
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

  const sendGameStateUpdates = async (gameStates) => {
    try{
        await channelStates.channelObj.sendEvent({
            type: "click-on-logo",
            data: gameStates,
        })           
    }catch(error){
        console.error(error.message);
    }            
  };

  try{
      channelStates.channelObj.on((event) => {
          if(event.type === "click-on-logo" && event.user.id !== client.userID){        
              // Update state to inform user that the opponent is waiting
              setOpponentStates((prevStates) => ({
                  ...prevStates,
                  ready2Play: event.data.ready2Play,
                  leaveGame: event.data.leaveGame,
                  exitConfirmed: event.data.exitConfirmed,
              }))
          }
      })       
  }catch(error){ 
      console.error(error.message);   
  }

  const handleClick = () => {
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
    navigate('/');      
  };


  return (
    <div className="game-logo" style = {styleGameLogo} onClick={handleClick}>
      <h1 style = {{fontSize: styleGameLogo.fontSize, cursor: 'pointer'}} >Stratego</h1>
    </div>
  );
};

export default GameLogo;
