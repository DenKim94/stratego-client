import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import * as parameters from '../../game-logic/parameters.js';
import { useChatContext } from 'stream-chat-react';
import { useGameStates } from '../context/GameStatesContext.js';
import { useChannelStates } from '../context/ChannelStatesContext.js';
import { useLocalStorage } from '../functions/useLocalStorage.js';

/**
 * React component for waiting for both players to join the game and navigating them to the game section afterward.
 * @component
 */
const WaitingRoom = () => {

    const navigate = useNavigate();
    const { channelStates } = useChannelStates();
    const { gameStates, setGameStates } = useGameStates();
    const { client } = useChatContext();
    const { clearLocalStorage } = useLocalStorage();

    // Synchronize states between players
    const [statesSynced, setStatesSynced] = useState(false);
    try{
        // Update states of player 2
        channelStates.channelObj.on((event) => {
            if(event.type === "game-state-sync" && event.user.id !== client.userID){
                if(event.data.isPlayer1){
                    setGameStates((prevStates) => ({
                        ...prevStates,
                        colorPlayer1: event.data.colorPlayer1,
                        colorPlayer2: event.data.colorPlayer2,
                        timePerTurn_ms: event.data.timePerTurn_ms,
                    })) 
                }
            }
        })   
    }catch(error){
        console.error(error.message)
        // Error handling
        toast.error("Connection failed, please restart the game.", {
            autoClose: parameters.genCfg.timeOutAutoClose_ms, 
        });   
        clearLocalStorage()          
    }

    // State to ensure that both players joined the game
    const [connectedPlayers, setConnectedPlayers] = useState(() => {
        try {
            return channelStates.channelObj.state.watcher_count === 2;
        } catch (error) {
            console.error("Error accessing channelObj: ", error);
            return false;
        }
    });
    
    // Tracking changes on the channel 
    try{
        channelStates.channelObj.on("user.watching.start", (event) => {
            setConnectedPlayers(event.watcher_count === 2)
        })
    }catch(error){
        console.error(error.message)               
    }   

    // Synchronize states between both players
    useEffect(() => {
        // Function to provide states, which shall be synchronized 
        const sendGameStateSync = async (gameStates) => {
            await channelStates.channelObj.sendEvent({
                type: "game-state-sync",
                data: gameStates,
            })
        };

        const syncStates = async () => {
            if (!statesSynced && connectedPlayers) {
                await sendGameStateSync(gameStates);
    
                if(gameStates.colorPlayer1 && gameStates.colorPlayer2){
                    setStatesSynced(true);
                }
            }
        };
        syncStates();

        // eslint-disable-next-line    
    }, [gameStates, setGameStates, channelStates, statesSynced, connectedPlayers, setStatesSynced]);

    useEffect(() => {
        const provideUserToGame = () => {
            if(connectedPlayers && statesSynced){
                // Navigate user to the game field
                const pathToNextPage = "/gameSection";
                navigate(pathToNextPage)
            }
        }

        provideUserToGame()
        // eslint-disable-next-line 
    }, [connectedPlayers, statesSynced])
 
    return ( 
        <div>
            {!statesSynced ? ( 
                <div> Waiting for the opponent... </div>
            ):(
                null)
            }
             <ToastContainer position='top-right' />
        </div>
        
     );
}
 
export default WaitingRoom;