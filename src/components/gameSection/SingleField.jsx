import React, {useState, useEffect} from 'react';
import GameFigure from './GameFigure';
import * as helperFcn from '../functions/helperFunctions.js'
import { Draggable } from 'react-beautiful-dnd';
import { useOpponentStates } from '../context/OpponentStatesContext.js';
import { useGameStates } from '../context/GameStatesContext.js';

/**
 * This Component renders a single field with a game figure depending on the game state
 * @param {Object} fieldState - Object contains specific configuration parameters of the component (e.g. figure properties)
 * @returns {JSX.Element|null} Returns the JSX element representing a single field or null if figure properties are empty.
 */

const SingleField = ({fieldState, idx}) => {

  const [isDraggable, setIsDraggable] = useState(true);
  const { gameStates } = useGameStates();
  const { opponentStates } = useOpponentStates();

  const figProps = fieldState.figure; 

  useEffect(() => {

    if(figProps){
      // Get only a color of current player
      const [playerColor] = helperFcn.getColorAndNumberOfCurrentPlayer(gameStates.isPlayer1, gameStates.colorPlayer1, gameStates.colorPlayer2);

      // Ednabled drag option depends from the state of the opponent 
      if((gameStates.ready2Play && !opponentStates.ready2Play) || (gameStates.gameIsOver || opponentStates.gameIsOver)){
        setIsDraggable(false);
      }
      // Disabled drag option for 'Flag' and 'Bomb' when the game is started
      else if(gameStates.ready2Play && (figProps.figName === 'Flag.png' || figProps.figName === 'Bomb.png')){
        setIsDraggable(false);

      // Disable drag property for the opponent figures  
      }else if(figProps.color !== playerColor){
        setIsDraggable(false);
      } 
      else{     
        setIsDraggable(true);       
      }
    }
    // Disable drag property during a battle
    if(gameStates.battleModeOn || opponentStates.battleModeOn){
      setIsDraggable(false);
    } 

    // eslint-disable-next-line
  }, [ gameStates.ready2Play, opponentStates.ready2Play, figProps, gameStates.battleModeOn, opponentStates.battleModeOn ])

  // Set style of the component 
  const fieldStyle = {
    alignItems: 'center', 
    justifyContent: 'center', 
  };

  // If empty field, return the function
  if(!figProps){
    return null;
  }

  // Disable animation translate except element is dragging
  function getStyle(style, snapshot) {
    if (!snapshot.isDragging) return {};
    if (!snapshot.isDropAnimating) {
      return style;
    }
    return {
      ...style,
      // cannot be 0, but make it super tiny
      transitionDuration: `0.001s`,
    };
  }

  // Render the game figure on the game field
    return(
          <div style={fieldStyle}>
              {/* Add draggable game figure component here, if 'fieldState' is not empty */}
              <Draggable  draggableId={`${figProps.color}_${figProps.id}`}
                          key= {`${figProps.color}_${figProps.id}`} 
                          index={idx} 
                          isDragDisabled = {!isDraggable}
                          type = "FIGURE"
                          >
                            {(provided, snapshot)=>(
                                  <div className='game-figure'
                                      ref={provided.innerRef} 
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={getStyle(provided.draggableProps.style, snapshot, provided)}
                                      >                           
                                      <GameFigure propsObj={figProps} snapshot = {snapshot}/>
                                  </div>
                            )} 
              </Draggable>
          </div>
    )
};

export default SingleField;