import React, { useState, useEffect }  from 'react';
import { useGameStates } from '../context/GameStatesContext.js';
import * as parameters from '../../game-logic/parameters.js';
import { useChannelStates } from '../context/ChannelStatesContext.js';
import { useChatContext } from 'stream-chat-react';
import { useOpponentStates } from '../context/OpponentStatesContext.js';
import { useButtonStates } from '../context/ButtonStatesContext.js';

/**
 * React component representing an exit confirmation box with options to confirm or cancel.
 * 
 * @component
 * @param {Object} gameStates - Object containing game-related states.
 * @property {boolean} gameStates.exitConfirmed - Indicates whether the exit is confirmed.
 * @property {boolean} gameStates.exitCanceled - Indicates whether the exit is canceled.
 * @param {Function} updateGameStates - Function to update game states.
 * @param {Object} exitBoxProps - Additional properties for styling the exit box.
 * @property {Object} exitBoxProps.styleParamsBox - Style parameters for the exit box container.
 * @property {Object} exitBoxProps.styleParamsMessage - Style parameters for the exit box message.
 * @property {Object} exitBoxProps.styleParamsButtons - Style parameters for the exit box buttons container.
 * @property {string} exitBoxProps.message - Message displayed in the exit box.
 * @returns {JSX.Element} Returns the JSX element representing the exit box.
 */
const ExitBox = ({ exitBoxProps = parameters.exitBoxProps }) => {

    const { gameStates, setGameStates } = useGameStates();
    const { buttonStates } = useButtonStates();
    const [confirmedState, setConfirmedState] = useState(gameStates.exitConfirmed)
    const [canceledState, setCanceledState] = useState(gameStates.exitCanceled)
    const { opponentStates, setOpponentStates } = useOpponentStates();
    const { channelStates } = useChannelStates();
    const { client } = useChatContext();

    try{
        channelStates.channelObj.on((event) => {
            if(event.type === "exit-update" && event.user.id !== client.userID){
    
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

    // Update states between both players
    const sendGameStateUpdates = async (gameStates) => {
        try{
            await channelStates.channelObj.sendEvent({
                type: "exit-update",
                data: gameStates,
            })
        }catch(error){
            console.error(error.message);
        }
    };

    function handleConfirm(){
        setConfirmedState(true)
    }   
    function handleCancel(){
        setCanceledState(true)  
    }

    useEffect(() => {
        const handleExit = async () => {
            if(confirmedState) {   
                setGameStates((prevStates) => ({
                    ...prevStates,
                    exitConfirmed: true,
                }))             

                await sendGameStateUpdates({  
                    ...gameStates,  
                    exitConfirmed: true,
                });
            }
            
            if(canceledState){
                if(buttonStates.counterUsedStartButton > 0){
                    setGameStates((prevStates) => ({
                        ...prevStates,
                        leaveGame: false,
                        exitCanceled: true,
                    }))
                     
                    await sendGameStateUpdates({  
                        ...gameStates,
                        ready2Play: ((!gameStates.timeIsOut && !opponentStates.timeIsOut) && (!gameStates.gameIsOver && !opponentStates.gameIsOver)) ? true : false,
                        leaveGame: false,
                        exitCanceled: true,
                    });                 
                }
                else{
                    setGameStates((prevStates) => ({
                        ...prevStates, 
                        leaveGame: false,
                        exitCanceled: true,
                    })) 

                    await sendGameStateUpdates({  
                        ...gameStates,  
                        leaveGame: false,
                        exitCanceled: true,
                    });
                }              
            }
        }; 
    
        handleExit()
        // eslint-disable-next-line
        }, [canceledState, confirmedState, 
            gameStates.timeIsOut, opponentStates.timeIsOut, 
            buttonStates.counterUsedStartButton, gameStates.gameIsOver, opponentStates.gameIsOver])    

    return(
        <div className="exit-box" style={exitBoxProps.styleParamsBox}>
            <p style={exitBoxProps.styleParamsMessage}>{exitBoxProps.message}</p>
            <div style={exitBoxProps.styleParamsButtons}>
                <button onClick={handleConfirm} style={{borderRadius: '5px'}}> Yes </button>
                <button onClick={handleCancel} style={{borderRadius: '5px'}}> No </button>
            </div>
      </div>        
    )
};
export default ExitBox