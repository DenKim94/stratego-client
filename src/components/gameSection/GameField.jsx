import React, {useState, useEffect, useMemo, createContext} from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { ToastContainer, toast } from 'react-toastify';
import './GameField.css'
import * as parameters from '../../game-logic/parameters.js';
import SingleField from './SingleField';
import FigureStorage from './FigureStorage';
import BattleCover from './BattleCover';
import DefeatedFigureStorage from './DefeatedFigureStorage';
import { useButtonStates } from '../context/ButtonStatesContext.js';
import { useGameStates } from '../context/GameStatesContext.js';
import { useScoutStates } from '../context/ScoutStatesContext.js';
import { useOpponentStates } from '../context/OpponentStatesContext.js';
import { useChannelStates } from '../context/ChannelStatesContext.js';
import { useChatContext } from 'stream-chat-react';
import { figProperties } from '../../game-logic/parameters.js';
import * as helperFcn from '../functions/helperFunctions.js'
import * as gameLogic from '../../game-logic/gameLogic.js'
import YAxis from './yAxis';
import XAxis from './xAxis';

/**
 * React component representing the game field and associated game components.
 * 
 * @component
 * @param {Object} parameters - Object with specific parameters for the component
 * @param {Object} gameFieldSettings - Settings for the game field, including dimensions, colors, and non-playable field coordinates.
 * @returns {JSX.Element} Returns the JSX element representing the game field and its components.
 */
export const GameFieldContext = createContext(); 

function GameField({ gameFieldSettings = parameters.gameFieldObj })
  {
    const { buttonStates, setButtonStates } = useButtonStates();
    const { scoutStates, setScoutStates } = useScoutStates();
    const { opponentStates, setOpponentStates } = useOpponentStates();
    const { channelStates } = useChannelStates();
    const { client } = useChatContext();
    const { gameStates, setGameStates } = useGameStates();

    // States to provide updates of moved figures to each player
    const [movedFigure, setMovedFigure] = useState( 
        { 
            player: null,
            figureProps: null,
            source: null,
            destination: null,
            isValidTurn: null,
        }
    );

    const [battledFigures, setBattledFigures] = useState( 
      { 
          winnerFigProps: null,
          defeatedFigProps: null,
      }
    );

    // Set player to make a first turn 
    // --> A player who is ready to start the game first, can make the first turn 
    const [firstTurn, setFirstTurn] = useState(null);
    const [counterFirstTurn, setCounterFirstTurn ] = useState(0); 

    useEffect(() => {
      if(opponentStates.ready2Play && !gameStates.ready2Play && counterFirstTurn === 0){
        if(gameStates.isPlayer1){
          setFirstTurn(2);
        }else{
          setFirstTurn(1);
        }
        setCounterFirstTurn(counterFirstTurn+1)

      }else if(!opponentStates.ready2Play && gameStates.ready2Play && counterFirstTurn === 0){    
          if(gameStates.isPlayer1){
            setFirstTurn(1);
          }else{
            setFirstTurn(2);
          }
          setCounterFirstTurn(counterFirstTurn+1)
      } 
      
    // eslint-disable-next-line  
    },[opponentStates.ready2Play, gameStates.ready2Play, gameStates.isPlayer1, counterFirstTurn])

    // State to set the correct turn of a player 
    const [turnPlayer, setTurnPlayer] = useState(firstTurn); 

    /* ********************************************************************* */
    const fieldWidth = gameFieldSettings.fieldWidth;
    const fieldHeight = gameFieldSettings.fieldHeight;
    const backgroundColor = gameFieldSettings.backgroundColor;
    const coordsNonPlayableFields = gameFieldSettings.coordsNonPlayableFields; 
    const colorNonPlayableFields = gameFieldSettings.colorNonPlayableFields;
    const prefixSingleFieldID = gameFieldSettings.prefixID;
    const arrayLengthAxis = gameFieldSettings.arrayLengthAxis;
    const arrayLengthGameFields = gameFieldSettings.arrayLengthGameFields;
    /* ********************************************************************* */

    const sizeSingleField = Math.abs(fieldWidth)/arrayLengthAxis;
    const fieldStyle = {
      width: fieldWidth,
      height: fieldHeight,
      display: 'grid',

      // Separate the game field into single patterns 
      gridTemplateColumns: `repeat(${arrayLengthAxis}, ${sizeSingleField}px)`,
      gridTemplateRows: `repeat(${arrayLengthAxis}, ${sizeSingleField}px)`
    };
  
    // Create an array (Strings) for the x-Axis 
    const xAxisLetters = Array.from({ length: arrayLengthAxis }, (_, index) => String.fromCharCode(65 + index)); 

    // Create an array (Numbers) for the y-Axis 
    const yAxisNumbers = Array.from({ length: arrayLengthAxis }, (_, index) => (arrayLengthAxis - index));
    
    // Merging the axis arrays into a new array of coordinates 
    let fieldCoordinates = helperFcn.getCoordinatesArray(xAxisLetters,yAxisNumbers, gameStates.isPlayer1);
    
    // Get color and number of current player
    const [playerColor, playerNumber] = helperFcn.getColorAndNumberOfCurrentPlayer(gameStates.isPlayer1, gameStates.colorPlayer1, gameStates.colorPlayer2);
    
    /* ********************************************************************* */
    // Set properties of a single field and store them in an array
    const defaultFieldState = useMemo(() => {
  
      return Array.from({ length: arrayLengthGameFields }).map((_, index) => {
        let singleFieldProps = helperFcn.setProps4SingleField(
          gameStates.isPlayer1,
          arrayLengthGameFields,
          prefixSingleFieldID,
          index,
          fieldCoordinates[index],
          sizeSingleField,
          backgroundColor
        );
  
        // Define non playable fields and modify the properties
        helperFcn.setNonPlayableFields(
          singleFieldProps,
          fieldCoordinates[index],
          coordsNonPlayableFields,
          colorNonPlayableFields
        );
  
        return singleFieldProps;
      });
      // eslint-disable-next-line 
    }, [arrayLengthGameFields]);

    //State as array to store and set game field properties 
    const [gameFieldState, setGameFieldState] = useState(defaultFieldState); 

    // State as array to store and set game figure properties
    const playerFigures = helperFcn.getFiguresOfPlayer(figProperties, playerColor);
    const [figureStorageState, setFigureStorageState] = useState([...playerFigures]); 

    // State as array to store defeated game figures
    const [defeatedFigureStorage, setDefeatedFigureStorage] = useState([]); 

    const addDefeatedFigure = (newDefeatedFigure) => {
      setDefeatedFigureStorage((prevState) => {
        // Check if the newDefeatedFigure's id already exists in prevState
        const idExists = prevState.some(figProps => figProps.id === newDefeatedFigure.id);
        if (idExists) {
          // If id already exists, return prevState without adding newDefeatedFigure
          return prevState;
        } else {
          // If id does not exist, add newDefeatedFigure to the array
          return [...prevState, newDefeatedFigure];
        }
      });
    };
    // State of added figures on field due to the opponent
    const [addedOpponentFieldState, setAddedOpponentFieldState] = useState([]);

    // Send updates to channel
    useEffect(() => {
      const provideUpdatesToChannel = async (gameFieldStates, movedFigure, battledFigures) => 
      {   
        try{
          gameLogic.addPathFigureBack(movedFigure.figureProps);

          if(!turnPlayer){ 
            const providedGameFieldState = gameFieldStates.filter((props) => props.id === movedFigure.destination.droppableId);
            await channelStates.channelObj.sendEvent({
              type: "set-up-figures",
              data: {providedFieldState: providedGameFieldState[0]},
            })

          }else{
            if(turnPlayer === playerNumber){
              // Change turn of current player 
              setTurnPlayer(playerNumber === 1 ? 2:1)
              
              setGameStates((prevStates) => ({ 
                ...prevStates,
                turnPlayer: playerNumber === 1 ? 2:1,
              }));

              await channelStates.channelObj.sendEvent({
                  type: "moved-figure",
                  data: {movedFigure, turnPlayer, battledFigures},
              })
            }
          }

        }catch(error){
          console.error(error.message);
        }
      }

      if(movedFigure.figureProps !== null && movedFigure.isValidTurn){
          provideUpdatesToChannel(gameFieldState, movedFigure, battledFigures)
          
          // Reset states of moved figure
          setMovedFigure((prevStates) => ({
            ...prevStates,
            figureProps: null,
            source: null,
            destination: null,
          }));
      } 

    // eslint-disable-next-line
    }, [movedFigure.figureProps, movedFigure.isValidTurn, playerNumber, battledFigures, turnPlayer, channelStates.channelObj])

    useEffect(() => {
      const handleChannelEvent = (event) => {

        if(event.user.id !== client.userID) {
          switch(event.type){
            case "moved-figure":
                setTurnPlayer(event.data.movedFigure.player === 1 ? 2:1)
                setGameStates((prevStates) => ({ 
                  ...prevStates,
                  turnPlayer: event.data.movedFigure.player === 1 ? 2:1,
                  battleModeOn: (event.data.battledFigures.winnerFigProps !== null && event.data.battledFigures.defeatedFigProps !== null) ? true : false,
                }));
                
                setOpponentStates((prevStates) => ({
                  ...prevStates,
                  battleModeOn: (event.data.battledFigures.winnerFigProps !== null && event.data.battledFigures.defeatedFigProps !== null) ? true : false,
                }));  

                const movedOpponentFigure = gameLogic.getMovedOpponentFigureOnField(event.data.movedFigure, gameFieldState);
                const indexSourceField = movedOpponentFigure.indexSourceField;
                const indexTargetField = movedOpponentFigure.indexDestField;

                if(event.data.battledFigures.winnerFigProps !== null && 
                  event.data.battledFigures.winnerFigProps.value !== event.data.battledFigures.defeatedFigProps.value){ 

                  setGameFieldState((prevStates) => {
                    const updatedState = [...prevStates];
  
                    updatedState[indexSourceField] = {
                      ...updatedState[indexSourceField],
                      figure: null,
                      isPlayable: true,
                    };    
  
                    updatedState[indexTargetField] = {
                      ...updatedState[indexTargetField],
                      figure: movedOpponentFigure.figureProps,
                      isPlayable: false,
                    };                  
                    return updatedState;
                  });

                  if(event.data.battledFigures.defeatedFigProps.color !== playerColor){ 
                    addDefeatedFigure(event.data.battledFigures.defeatedFigProps)
                  }

                }else if(event.data.battledFigures.winnerFigProps !== null && 
                  event.data.battledFigures.winnerFigProps.value === event.data.battledFigures.defeatedFigProps.value){

                  setGameFieldState((prevStates) => {
                    const updatedState = [...prevStates];

                    updatedState[indexSourceField] = {
                      ...updatedState[indexSourceField],
                      figure: null,
                      isPlayable: true,
                    };    

                    updatedState[indexTargetField] = {
                      ...updatedState[indexTargetField],
                      figure: null,
                      isPlayable: true,
                    };
                    return updatedState;
                  });
                  
                  addDefeatedFigure(event.data.battledFigures.defeatedFigProps)
                }else{
                    setGameFieldState((prevStates) => {
                    const updatedState = [...prevStates];
  
                    updatedState[indexSourceField] = {
                      ...updatedState[indexSourceField],
                      figure: null,
                      isPlayable: true,
                    };    
  
                    updatedState[indexTargetField] = {
                      ...updatedState[indexTargetField],
                      figure: movedOpponentFigure.figureProps,
                      isPlayable: false,
                    };
                    return updatedState;
                    });
                }

                setBattledFigures((prevStates) => ({
                  ...prevStates,
                  winnerFigProps: event.data.battledFigures.winnerFigProps,
                  defeatedFigProps: event.data.battledFigures.defeatedFigProps,
                }));
                break;

            case "set-up-figures":
                const providedFieldState = event.data.providedFieldState;
                const opponentFieldState = gameLogic.trackOpponentFieldStateUpdates(addedOpponentFieldState, providedFieldState);
                setAddedOpponentFieldState(opponentFieldState)
                break;

            default:       
          }
        }
      };
      
      try{
        channelStates.channelObj.on(handleChannelEvent);
      }catch(error){
        console.error(error.message);  
      }

    // eslint-disable-next-line
    }, [gameFieldState, addedOpponentFieldState, client.userID, channelStates.channelObj]); 
  
    // Rendering all igures of the game when both players are ready to play
    useEffect(() => {

      if(gameStates.ready2Play && opponentStates.ready2Play && buttonStates.counterUsedStartButton === 1){
        const mergedSetUpFieldState = gameLogic.mergeGameFieldStates(addedOpponentFieldState, gameFieldState);

        setTurnPlayer(firstTurn)
        setGameStates((prevStates) => ({ 
          ...prevStates,
          turnPlayer: firstTurn,
        }));

        setButtonStates((prevStates) => ({
          ...prevStates,
          counterUsedStartButton: prevStates.counterUsedStartButton + 1,
        })); 

        // Update 'gameFieldState' to render hidden opponent and own game figures
        setGameFieldState(mergedSetUpFieldState)
      }

      // eslint-disable-next-line
    },[gameStates.ready2Play, 
       opponentStates.ready2Play, 
       firstTurn,
       buttonStates.counterUsedStartButton])

    // Enable the button to start the game, when the figure storage list is empty
    useEffect(() => {
      const updateStartButton = () => {
        // Check if figure storage list is empty
        if (figureStorageState.length === 0 && buttonStates.counterUsedStartButton < 1) {
            setButtonStates((prevStates) => ({
              ...prevStates,
              disabledStartButton: false,
            }));
        }
      }; 

      updateStartButton()
      // eslint-disable-next-line
    }, [figureStorageState, buttonStates.counterUsedStartButton, setButtonStates]);
    
    // Function to handle changes while dragging and ensure valid movement of the scout 
    const handleDragUpdate = ( update, fieldState, playerNumber) => {

      const { source, destination } = update;
      // Indentify 'Scout' and get figure properties
      const figureProps = helperFcn.identifyScoutFigure(source, fieldState); 
      // Indentify a figure which has been dragged over and get properties
      const draggedOverFigure = helperFcn.getDraggedOverFigure(destination, fieldState);
      // Get position of destination field 
      const targetFieldPosition = helperFcn.getFieldPosition(destination, fieldState);
      
      // Update states in case of a found figure which was dragged over by the figure 'Scout'
      if(figureProps.isScoutFigure && targetFieldPosition && gameStates.ready2Play){

        setScoutStates((prevStates) => ({
          ...prevStates, 
          isDraggedOverFigure: draggedOverFigure.figure ? true:false, 
          sourcePosition: figureProps.sourcePosition,
          targetPosition: targetFieldPosition,       
        }))
      }
      // Check if the move made by the figure 'Scout' is valid and update state
      if(figureProps.sourcePosition && targetFieldPosition && gameStates.ready2Play){
        const isValidMove = helperFcn.checkValidScoutMove(figureProps.sourcePosition, 
                                                          targetFieldPosition,  
                                                          gameFieldState,
                                                          playerNumber);

        setScoutStates((prevStates) => ({
          ...prevStates,
          isValidMove: isValidMove,
        })); 
      }   
    }

    return(
      <DragDropContext onDragUpdate = { (update) => {
                                    handleDragUpdate(update, gameFieldState, playerNumber)}}

                       onDragEnd = {(result) => {
                                  // Don't execute if specific scout move is not allowed and reset states
                                  if(!scoutStates.isValidMove){
                                    setScoutStates((prevStates) => ({
                                      ...prevStates,
                                      isDraggedOverFigure: false,  
                                      sourcePosition: null,
                                      targetPosition: null,       
                                      isValidMove: true,
                                    }))  
                                    return null                           
                                  }        
                                  
                                  if(turnPlayer !== null && turnPlayer !== playerNumber && gameStates.ready2Play){
                                      toast.info("It's not your turn!", {
                                        autoClose: 900, 
                                    }); 
                                    return null
                                  }
                                  
                                  if(opponentStates.exitConfirmed){
                                    return null
                                  }  
                 
                                  const updatedStates = gameLogic.handleDragDrop(result, gameFieldState, figureStorageState, prefixSingleFieldID, gameStates);
                                
                                  if(updatedStates !== null && !opponentStates.pausedGame){                                  

                                    const { draggedFigure, gameFieldState: newGameFieldState, figureStorageState: newFigureStorageState, winnerFigure, defeatedFigure, isValidTurn} = updatedStates;
                                    
                                    if(draggedFigure){
                                      const isDraw = (winnerFigure !== null && winnerFigure.value === defeatedFigure.value) ? true : false;

                                      if(isDraw){ 
                                        draggedFigure.isActive = false; 
                                        addDefeatedFigure(defeatedFigure)
                                      }
                                                                                                        
                                      if(winnerFigure !== null){
                                        setMovedFigure((prevStates) => ({
                                          ...prevStates,
                                          player: playerNumber,
                                          figureProps: isDraw ? draggedFigure : winnerFigure,
                                          source: result.source,
                                          destination: result.destination,
                                          isValidTurn: isValidTurn,
                                        }))
                                                                                
                                        setGameStates((prevStates) => ({ 
                                          ...prevStates,
                                          battleModeOn: true,
                                        }));

                                        setOpponentStates((prevStates) => ({
                                          ...prevStates,
                                          battleModeOn: true,
                                        }));    
                                        
                                        if(defeatedFigure.color !== playerColor){ 
                                          addDefeatedFigure(defeatedFigure)
                                        } 
                                      }
                                      else{
                                        setMovedFigure((prevStates) => ({
                                          ...prevStates,
                                          player: playerNumber,
                                          figureProps: draggedFigure,
                                          source: result.source,
                                          destination: result.destination,
                                          isValidTurn: isValidTurn,
                                        }))                                                                           
                                      }

                                      setBattledFigures((prevStates) => ({
                                        ...prevStates,
                                        winnerFigProps: winnerFigure,
                                        defeatedFigProps: defeatedFigure,
                                      })) 

                                    }else{ return null } 

                                    setGameFieldState(newGameFieldState);         // Update the State of the game field 
                                    setFigureStorageState(newFigureStorageState); // Update the State of the figure storage
                                  }
                                  else{ return null }                             
                                }}>
                    
         <div className = "dnd-container" style={parameters.styleDnDContainer}>
         {(gameStates.battleModeOn && opponentStates.battleModeOn) && (<BattleCover winnerFigProps = {battledFigures.winnerFigProps} defeatedFigProps = {battledFigures.defeatedFigProps}/>)}
          <div className = "game-field-container" style={parameters.styleGameFieldContainer}>

              <YAxis yAxisArray = {yAxisNumbers} 
                     axisHeight = {fieldHeight}
                     gameStates = {gameStates} 
                     axisStyle = {parameters.styleYAxis}/>

              <GameFieldContext.Provider value = {battledFigures}>
                <div className="game-field" style={fieldStyle}>
                  {gameFieldState.map((fieldProps, index) => {   
                    return (
                      <Droppable droppableId={defaultFieldState[index].id} 
                      key={`${prefixSingleFieldID}_${index}`}
                      type = "FIGURE"
                      > 
                      {(provided) => (             
                        <div
                          style={fieldProps.style}
                          key={index}
                          className={"single-field"}
                          ref={provided.innerRef} 
                          {...provided.droppableProps}
                        >
                          <SingleField fieldState={fieldProps} idx = {index}/>
                          {provided.placeholder}                        
                        </div>
                      )}
                      </Droppable>                    
                    )
                  })}
                </div>
              </GameFieldContext.Provider>
              
              <XAxis xAxisArray = {xAxisLetters} 
                     singleFieldWidth = {sizeSingleField} 
                     gameStates = {gameStates} 
                     axisStyle={parameters.styleXAxis}/>
          </div>
            <FigureStorage figStateArray = {figureStorageState} />    
            <DefeatedFigureStorage defFigStateArray = {defeatedFigureStorage}
                                   currentDefFig = {battledFigures.defeatedFigProps}
                                   figStorageState = {figureStorageState} />

            <ToastContainer position='top-right' />                           
        </div> 
      </DragDropContext>
    )     
};

export default GameField;
