import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie'
import * as parameters from '../../game-logic/parameters.js';
import GameField from './GameField';  
import Countdown from "./Countdown.jsx";
import { useButtonStates } from '../context/ButtonStatesContext.js';
import { useGameStates } from '../context/GameStatesContext.js';
import { useOpponentStates } from '../context/OpponentStatesContext.js';
import { ScoutStatesProvider } from '../context/ScoutStatesContext';
import { useChatContext } from 'stream-chat-react';
import { useChannelStates } from '../context/ChannelStatesContext.js';
import { useLocalStorage } from '../functions/useLocalStorage.js';
import { restoreChannel } from '../functions/restoreChannel.js';
import Cover from './Cover';
import './Buttons.css'

/**
 * React component responsible for managing game interactions.
 * @component
 */
const GameSection = () => {

    const { buttonStates, setButtonStates } = useButtonStates();
    const { channelStates, setChannelStates } = useChannelStates();
    const { gameStates, setGameStates } = useGameStates();
    const { opponentStates, setOpponentStates } = useOpponentStates();
    const { client } = useChatContext();
    const { setItem, getItem } = useLocalStorage();
    const [stateIsUpdated, setStateIsUpdated] = useState(false);

    const cookies = useMemo(() => new Cookies(), []);
    const navigate = useNavigate();

    // Get stored states from local storage in case of page reload                
    useEffect(() => {
        const storedGameState     = getItem('game-states');
        const storedOpponentState = getItem('opponent-states');
        const storedIsUpdated     = getItem('state-isUpdated');
        const storedButtonStates  = getItem('button-states') 
        
        if(storedGameState !== null){
            setGameStates(storedGameState)
        } 
        if(storedOpponentState !== null){
            setOpponentStates(storedOpponentState)
        }         
        if(storedIsUpdated !== null){
            setStateIsUpdated(storedIsUpdated)
        } 
        if(storedButtonStates !== null){
            setButtonStates(storedButtonStates)
        } 

        // eslint-disable-next-line
    }, [])

    // Update states between both players
    useEffect(() => {
        const sendGameStateUpdates = async (gameStates) => {
            try{
                await channelStates.channelObj.sendEvent({
                    type: "game-state-update",
                    data: gameStates,
                })           
            }catch(error){
                console.error(error.message);
            }            
        };

         // Function to provide states, which shall be updated
        const updateStates = async () => {
            try{
                await sendGameStateUpdates(gameStates);
            }catch(error){
                console.error(error.message);
            }
        };       
        if(!stateIsUpdated){      
            updateStates();           
        }

    }, [gameStates, setGameStates, channelStates, stateIsUpdated]);

    useEffect(() => {
        // Inform player if the opponent has left the game
        if(opponentStates.exitConfirmed){
            setGameStates((prevStates) => ({
                ...prevStates,
                ready2Play: false,
            }));   
            // Save states in local storage
            setItem('game-states', gameStates)                   
        }

        if(gameStates.exitConfirmed){
            // Navigate the player to the exit section
            navigate("/exitSection")
        }

        // eslint-disable-next-line
    }, [gameStates.exitConfirmed, stateIsUpdated, setGameStates, opponentStates.exitConfirmed])

    // Exchange game states between players 
    try{
        channelStates.channelObj.on((event) => {
            if(event.type === "game-state-update" && event.user.id !== client.userID){        
                if(!stateIsUpdated){ 
                    // Update state to inform user that the opponent is waiting
                    setOpponentStates((prevStates) => ({
                        ...prevStates,
                        ready2Play: event.data.ready2Play,
                        pausedGame: event.data.isPaused,
                        exitConfirmed: event.data.exitConfirmed,
                    }))
                    setStateIsUpdated(true);
                }
            }
        })       
        setItem('state-isUpdated', stateIsUpdated)
        setItem('opponent-states', opponentStates)

    }catch(error){ 
        console.error(error.message);   
    }

    // Restore established channel in case of reloaded page
    useEffect(() => {
        const storedChannelID = getItem('channel-id');

        if(storedChannelID !== null && !client.userID){
            console.log(">> [@GameSection]: reconnect... ")

            restoreChannel(client, cookies, storedChannelID)
            .then((channel) => {
              if (channel) {
                setChannelStates((prevStates) => ({
                  ...prevStates,
                  channelObj: channel,
                  cookieObj: cookies,
                }));
              }
            })
            .catch(error => {
              console.error(error.message);
            });
        } 
        
    // eslint-disable-next-line
    }, [client])
    
    /**
     * Function to be executed when the "Start Game" button is clicked.
     * If the game is not paused, sets the 'ready2Play' parameter to true and disables the button.
     * @function
     */
    function startGame(){
        if(gameStates.isPaused){
            return
        }
        // Set parameter 'ready2Play' to 'true'
        setGameStates((prevStates) => ({
            ...prevStates,
            ready2Play: true,
        }));

        // Disable the start button after first usage and increase counter
        setButtonStates((prevStates) => ({
            ...prevStates,
            counterUsedStartButton: prevStates.counterUsedStartButton + 1,
        })); 

        setStateIsUpdated(false);

        // Save states in local storage
        setItem('button-states', buttonStates)
        setItem('game-states', gameStates)
        setItem('state-isUpdated', stateIsUpdated)
    }
    /**
     * Function to be executed when the "Pause/Proceed Game" button is clicked.
     * If the game is not paused, it pauses the game and changes the button text to "Proceed Game".
     * If the game is paused, it proceeds the game and changes the button text to "Pause Game".
     * @function
     */
    function pauseGame(){
        if(!gameStates.isPaused){
            // After pausing the game, change the button text of 'Pause Game' to 'Proceed Game'
            setButtonStates((prevStates) => ({
                ...prevStates,
                pauseButtonText: "Proceed Game",
            }));

            setGameStates((prevStates) => ({
                ...prevStates,
                ready2Play: false,
                isPaused: true,              
            })); 
            
            setStateIsUpdated(false);
            setItem('state-isUpdated', stateIsUpdated)
        }
        else{
            // After proceeding the game, change the button text of 'Proceed Game' to 'Pause Game'
            setButtonStates((prevStates) => ({
                ...prevStates,
                pauseButtonText: "Pause Game",
            }));            

            setGameStates((prevStates) => ({
                ...prevStates,
                ready2Play: buttonStates.counterUsedStartButton === 0 ? false : true,
                isPaused: false, 
            }));             
        }

        // Save states in local storage
        setItem('button-states', buttonStates)
        setItem('game-states', gameStates)
    }

    /**
     * Function to be executed when the "Leave Game" button is clicked.
     * Triggers the exit process of the game
     * @function
     */
    function exitGame(){
        // Set ready2Play = false to exit game
        setGameStates((prevStates) => ({
            ...prevStates,
            ready2Play: false,
            leaveGame: true,       
        }));     
        setStateIsUpdated(false)

        // Save states in local storage
        setItem('button-states', buttonStates)
    }

    /**
     * Effect hook to disable the Start Button after first use to start the game.
     * @function
     */
    useEffect(() => {

        const disableStartButton = () => {
            if (buttonStates.counterUsedStartButton > 0) {
                setButtonStates((prevStates) => ({
                    ...prevStates,
                    disabledStartButton: true,
                }));
            }
        }; 
        
        if(!buttonStates.disabledStartButton){
            disableStartButton()
            // Save states in local storage
            setItem('button-states', buttonStates)
        }
    // eslint-disable-next-line
    }, [buttonStates.counterUsedStartButton, buttonStates.disabledStartButton])
  
    return(
        <>
            <div className="ui-container" >
            {(!gameStates.ready2Play || !opponentStates.ready2Play ) && (<Cover/>)}
                <div className="btn-container" style = {parameters.styleButtonContainer}>
                    <button type="button" 
                            id={!buttonStates.disabledStartButton ? "highlighted-button": ''}
                            className = "btn btn-warning"
                            style={parameters.styleButtonText}
                            onClick={startGame} 
                            disabled = {gameStates.leaveGame || 
                                opponentStates.pausedGame || 
                                gameStates.isPaused || 
                                opponentStates.leaveGame ? true : buttonStates.disabledStartButton}>

                        {buttonStates.startButtonText}
                    </button> 
                    <button type="button" 
                            className="btn btn-warning" 
                            style={parameters.styleButtonText} 
                            onClick={pauseGame}
                            disabled = {gameStates.leaveGame || 
                                        opponentStates.pausedGame || 
                                        opponentStates.leaveGame || 
                                        opponentStates.exitConfirmed || opponentStates.timeIsOut || 
                                        gameStates.timeIsOut || gameStates.battleModeOn || 
                                        opponentStates.battleModeOn || gameStates.gameIsOver || 
                                        opponentStates.gameIsOver ? true : false}>

                        {buttonStates.pauseButtonText}
                    </button>  
                    <button type="button" 
                            className="btn btn-warning" 
                            style={parameters.styleButtonText} 
                            onClick={exitGame}
                            disabled = {gameStates.isPaused || opponentStates.pausedGame || 
                                        gameStates.leaveGame || gameStates.battleModeOn || 
                                        opponentStates.battleModeOn ? true : false}>
                        {buttonStates.exitButtonText}
                    </button>                                                            
                </div>
                <ScoutStatesProvider> 
                    <GameField /> 
                </ScoutStatesProvider> 

                <Countdown />
            </div>
        </>
    )
};
export default GameSection