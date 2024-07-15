import React, { useRef } from 'react';
import { useGameStates } from '../context/GameStatesContext.js';
import { useOpponentStates } from '../context/OpponentStatesContext.js';
import DuellCards from './DuellCards.jsx'
import './Cover.css'
import * as parameters from '../../game-logic/parameters.js';

const BattleCover = ({winnerFigProps, defeatedFigProps, styleProps = parameters.styleBattleCover}) => {
    
    const { opponentStates } = useOpponentStates();
    const { gameStates }     = useGameStates();
    
    const playerFigureRef    = useRef(null);
    const opponentFigureRef  = useRef(null);

    const coverStyle = {
        ...styleProps,
        opacity: (gameStates.ready2Play &&  
                  opponentStates.ready2Play) ? 1 : 0,  
      };
    
    const styleMessage = {
        display: 'flex',
        position: 'absolute', 
        textAlign: 'center',
        color: 'white',  
        top: '25px',         
    };  

    if(winnerFigProps !== null && defeatedFigProps !== null){
            
        let playerFigure   = null;
        let opponentFigure = null;

        if(gameStates.isPlayer1){
            if(gameStates.colorPlayer1 === winnerFigProps.color){
                playerFigure   = winnerFigProps;
                opponentFigure = defeatedFigProps;
    
            }else{
                playerFigure   = defeatedFigProps; 
                opponentFigure = winnerFigProps;
            }
        }else{
            if(gameStates.colorPlayer2 === winnerFigProps.color){
                playerFigure   = winnerFigProps;
                opponentFigure = defeatedFigProps;
    
            }else{
                playerFigure   = defeatedFigProps; 
                opponentFigure = winnerFigProps;
            }        
        }

        playerFigureRef.current = playerFigure;
        opponentFigureRef.current = opponentFigure;
    }
    
    return ( 
        <div className = 'battle-cover-section' style={coverStyle}>
            <p style={styleMessage}> ***! Battle !*** </p>
            {((playerFigureRef.current && opponentFigureRef.current) && <DuellCards playerFigProps = {playerFigureRef.current} opponentFigProps = {opponentFigureRef.current} />)}
        </div> 
    );
}
 
export default BattleCover;