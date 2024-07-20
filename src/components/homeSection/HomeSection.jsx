import React, { useState, useEffect } from 'react';
import { useGameStates } from '../context/GameStatesContext.js';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../functions/useLocalStorage.js';
import * as parameters from '../../game-logic/parameters.js';
import Button from '../gameSection/Button.jsx'
import '../gameSection/Buttons.css'
/**
 * - This Component provides user settings to the backend 
 * - The user is going to check into the game
 * 
 * @param {Object} homeSectionProps - Object contains configuration parameters of the component 
 * 
 */

const HomeSection = ({ homeSectionProps = parameters.homeSectionProps }) => {

    const [isInfoVisible, setInfoVisible] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const navigate = useNavigate();
    const { gameStates, setGameStates } = useGameStates();
    const pathToNextPage = "/setUp";
    const { getItem } = useLocalStorage();

    // Get stored states from local storage in case of page reload
    useEffect(() => {
        const storedGameStates = getItem('game-states');
        if(storedGameStates !== null){
            setGameStates(storedGameStates)
        } 
        
        // eslint-disable-next-line
    }, [])

    // Ensure a valid input length of user name  
    useEffect(() => {
        const ensureValidInputLength = () => {
            const userName = gameStates.playerName; 
            if(userName){
                if(userName.length < parameters.genCfg.minInputLength || userName.length >= parameters.genCfg.maxInputLength){
                    setInfoVisible(true)
                    setIsValid(false)
                }
                else{
                    setInfoVisible(false) 
                    setIsValid(true)
                }
            }
        };
        ensureValidInputLength()
        
    }, [gameStates, homeSectionProps]);

    // Handle user input
    const handleChangedPlayerName = (event) => {
        let inputValue = event.target.value;
        
        // Update state to provide player name and remove blank spaces
        setGameStates((prevStates) => ({
            ...prevStates,
            playerName: inputValue.trim(),
        }))                
    };

    const createNewGame = () => {
        setGameStates((prevStates) => ({
            ...prevStates,
            playerNumber: 1,
            isPlayer1: true,
        })) 
        navigate(pathToNextPage)
    }

    const joinGame = () => {
        setGameStates((prevStates) => ({
            ...prevStates,
            playerNumber: 2,
            isPlayer1: false,
        }))
        navigate(pathToNextPage)
    }

    return(
        <div style={homeSectionProps.style}>
            <input  
                style = {{
                    border: isInfoVisible ? '2px solid yellow' : '1px solid black',
                    ...homeSectionProps.inputStyle,
                    }}
                    
                   type='string' 
                   placeholder = {homeSectionProps.inputPlaceHolder} 
                   value={gameStates.playerName}
                   onChange = {handleChangedPlayerName}/>

            {isInfoVisible && (
                <p style={{ fontSize: '15px', color: 'yellow' }}>
                    Please notice that the user name should have at least {parameters.genCfg.minInputLength} and less than {parameters.genCfg.maxInputLength} characters. 
                </p>
            )}    
            <Button buttonName = {"Create New Game"} isDisabled = {isValid ? false : true} onCklickFunction = {createNewGame}/>      
            <Button buttonName = {"Join Game"} isDisabled = {isValid ? false : true} onCklickFunction = {joinGame}/>  

            <div style={parameters.instructionsProps.styleDiv}>
                <a href="/instructions.html" target="_blank" rel="noopener noreferrer" style={parameters.instructionsProps.styleLink}>
                    {parameters.instructionsProps.linkName}
                </a>
            </div>             
        </div>
    )
};

export default HomeSection