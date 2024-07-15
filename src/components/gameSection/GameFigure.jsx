import React, { useState, useEffect, useContext } from "react";
import * as parameters from '../../game-logic/parameters.js';
import * as helperFcn from '../functions/helperFunctions.js'
import { useGameStates } from '../context/GameStatesContext.js';
import { GameFieldContext } from "./GameField.jsx";
import './GameFigure.css'

/**
 * React component representing a game figure.
 * 
 * @component
 * @param {Object} props - The component's properties.
 * @param {Object} props.propsObj - Object containing properties of the game figure.
 * @param {Object} props.snapshot - The snapshot object provided by the React DnD library.
 * @param {Object} props.figureStyle - Custom style for the game figure container.
 * @param {Object} props.valueStyle - Custom style for the value displayed on the game figure.
 * @returns {JSX.Element|null} Returns the JSX element representing the game figure or null if propsObj is empty.
 */

const GameFigure = ({propsObj, snapshot, figureStyle = parameters.styleGameFigure, valueStyle = parameters.valueStyleGameFigure}) => {
    
    const { gameStates } = useGameStates();
    const battledFigures = useContext(GameFieldContext)
    const [blinkBorder, setBlinkBorder] = useState(false)

    // Get only a color of current player
    const [playerColor] = helperFcn.getColorAndNumberOfCurrentPlayer(gameStates.isPlayer1, gameStates.colorPlayer1, gameStates.colorPlayer2);

    useEffect(() => {
      if(battledFigures?.winnerFigProps?.isActive && 
        !gameStates.BattleModeOn && 
        battledFigures?.winnerFigProps?.color !== playerColor &&
        propsObj?.id === battledFigures?.winnerFigProps?.id){
        
        const timerBlinkOn = setTimeout(() => {
          setBlinkBorder(true);

        }, parameters.genCfg.timeOutBattle_ms);          
        
        // Set a timer to stop blink animation
        const timerBlinkOff = setTimeout(() => {
            setBlinkBorder(false);
        }, (parameters.genCfg.timeOutBattle_ms + parameters.genCfg.timeOutBlinkBorder_ms));

        // Clean up both timers
        return () => {
          clearTimeout(timerBlinkOn);
          clearTimeout(timerBlinkOff);
        };
      }
      // eslint-disable-next-line
    }, [battledFigures?.winnerFigProps, gameStates.BattleModeOn, propsObj?.id])

    if(!propsObj){
      return null;
    }
  
    const { imgPath, value, figName, color , isActive} = propsObj;

    // Using default border color and image style
    const colorBorder = 'yellow'; 

    const imgStyle = {
      width: '100%', 
      height: '100%', 
      borderRadius: '10%',
      alignItems: 'center', 
      justifyContent: 'center',       
      border: (snapshot !== null && snapshot.isDragging) ? `3px solid ${colorBorder}` : 'none' ,
    };

    let pathIndex

    if(color !== playerColor && isActive){
        // Hide figures of the opponent by showing the back side
        pathIndex = imgPath.findIndex((path) => path.includes('FigureBack'));

    }else if(color === playerColor && isActive){
        pathIndex = imgPath.findIndex((path) => path.includes(playerColor));

    }else{
        pathIndex = imgPath.findIndex((path) => path.includes('dead'));
    } 
    
    return (
      <div style={figureStyle} className={`game-figure ${blinkBorder ? 'blink-border' : ''}`}>
        <img
          src={imgPath[pathIndex]}
          alt={"Name of the game figure: " + figName}
          style={imgStyle}
        />

        {(!figName.includes('Bomb.png')) && (!figName.includes('Flag')) && (!imgPath[pathIndex].includes( 'FigureBack')) && (
          <span style={valueStyle}>{value}</span>
        )}
    </div>
    );   
  };
  
  export default GameFigure;