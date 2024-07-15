import { gameFieldObj, figProperties  } from './parameters';

/**
 * Helper function to retrieve the index of a game field with a specific ID.
 * @param {Array} stateArray - The array containing the state of the game field.
 * @param {object} fieldObj - The object representing the field with the specific ID.
 * @returns {number|null} The index of the field with the specified ID if found, or null if not found.
 */
function getIndexOfGameField(stateArray, fieldObj){
    const indexField = stateArray.findIndex((fieldProps) => fieldProps.id === fieldObj.droppableId);
    
    if(indexField !== -1){ 
        return indexField ;
    }else{
        return null;    // If index is not found, return null
    }
}

/**
 * Helper function to retrieve properties of a single field element from a state array.
 * @param {Array} stateArray - The array containing the state of the game field.
 * @param {number} index - The index of the field element in the state array.
 * @returns {object|null} The properties of the specified field element if found, or null if not found.
 */
function getPropsOfGameField(stateArray, index){
    const fieldProps = stateArray[index];
    return fieldProps || null
}

/**
 * Moves a game figure on the game field according to the specified parameters.
 * @param {Array} GameFieldState - The current state of the game field.
 * @param {object} gameSettings - The settings of the game.
 * @param {string} draggableId - The unique identifier of the draggable figure.
 * @param {object} figureStorageState - The state of the figure storage component.
 * @param {number} indexSourceField - The index of the source field from which the figure is being moved.
 * @param {number} indexTargetField - The index of the target field to which the figure is being moved.
 * @returns {Array} An array containing updated states and information about the move:
 *                  - The updated state of the game field.
 *                  - The updated state of the figure storage component.
 *                  - The dragged figure.
 *                  - The winner of any battle that occurred during the move.
 *                  - The loser of any battle that occurred during the move.
 *                  - A boolean indicating whether the move is valid.
 */
function moveFigureOnField(GameFieldState, gameSettings, draggableId, figureStorageState, 
                           indexSourceField, indexTargetField)
{
    // Get field properties of target field
    const targetFieldProps = getPropsOfGameField(GameFieldState, indexTargetField)
    // Initialize a state of figure storage component
    const newFigureStorageState = figureStorageState ; 
    // Get a property parameter of a target field
    const isPlayableField = targetFieldProps.isPlayable; 

    // Identify properties of a dragged figure and corresponding field
    const sourceFieldProps = GameFieldState.find((obj) => {
        return obj.figure && `${obj.figure.color}_${obj.figure.id}` === draggableId;
    });
    const draggedFigure = sourceFieldProps.figure;

    // Maintain a correct moving of a dragged game figure after starting the game
    if(gameSettings.ready2Play){
        // Run the check 
        let isAllowedMovement = checkCorrectMoving(sourceFieldProps, targetFieldProps, draggedFigure)
        if(!isAllowedMovement){
            // If incorrect movement, return without updating the states
            return [GameFieldState, newFigureStorageState] 
        }
    }
    
    // Update the State of the source game field 
    let newGameFieldState = updateGameFieldStateProps(GameFieldState, indexSourceField, [true, null])       

    // Handle the action in case of an occupied field
    let winner = null;
    let loser = null;
    let validTurn = true;

    if(!isPlayableField){
        [winner, loser, validTurn] = handleOccupiedField(targetFieldProps, draggedFigure);

        if(winner !== null && validTurn){
            // Update the State of the target game field 
            if(!winner.isActive && !loser.isActive){
                // Update the State of the target game field 
                newGameFieldState = updateGameFieldStateProps(newGameFieldState, indexTargetField, [true, null]); 
    
                /* TO-DO: Handle removed/dead figures (31.10.2023) 
                1) Put the (dead) figures in an empty list/state of the component 'FigureStorage'
                2) Render the updated component which includes the removed/dead figures */
            }else{   
                newGameFieldState = updateGameFieldStateProps(newGameFieldState, indexTargetField, [false, winner]);
            }            
        }
        else {
            // Reset the source game field to previous state  
            newGameFieldState = updateGameFieldStateProps(newGameFieldState, indexSourceField, [false, draggedFigure]); 
        }
    }
    else {      
        // Update the State of the target game field 
        newGameFieldState = updateGameFieldStateProps(newGameFieldState, indexTargetField, [false, draggedFigure]);
    }

    return [newGameFieldState, newFigureStorageState, draggedFigure, winner, loser, validTurn]   
}

/**
 * Helper function to ensure correct movement of a game figure.
 * @param {object} sourceFieldProps - The properties of the source game field.
 * @param {object} targetFieldProps - The properties of the target game field.
 * @param {object} figureProps - The properties of the game figure being moved.
 * @returns {boolean} True if the movement is allowed, false otherwise.
 */
function checkCorrectMoving(sourceFieldProps, targetFieldProps, figureProps){
    // Start position of dragged figure: [x,y]
    const startPos = [sourceFieldProps.pos_x, sourceFieldProps.pos_y];  
    // End position of dragged figure: [x,y]
    const endPos = [targetFieldProps.pos_x, targetFieldProps.pos_y];    

    // Check direction: It is only allowed to move a game figure vertically or horizontally
    if(!checkMovingDirection(startPos, endPos)){
        return false;
    }
    // Get name of dragged/moving figure
    const figName = figureProps.figName; 
    // It is not allowed to move 'Flag' or 'Bomb' anymore after starting the game
    if(figName.includes("Flag") || figName.includes("Bomb")){
        return false;
    }
    // Get Array with steps in x- and y- direction
    const movedSteps = getMovingSteps(startPos, endPos);
    // If more than one step was made by a figure which is not named as 'Scout'
    if(!figName.includes("Scout") && movedSteps.some(step => step > 1)){
        // Movement is not allowed 
        return false;
    }
    // Movement is allowed 
    else{ return true; }   
}

/**
 * Helper function to check the valid direction of movement.
 * @param {Array} startPos - The starting position of the movement as [x, y].
 * @param {Array} endPos - The ending position of the movement as [x, y].
 * @returns {boolean} True if the movement is allowed in a vertical or horizontal direction, false otherwise.
 */
function checkMovingDirection(startPos, endPos){
    // Initialized parameter, which will be returned as boolean [true or false]
    let isAllowed = true;  
    // Absolute difference between the y-coordinates
    const absDiff_y = Math.abs(endPos[1] - startPos[1]); 
    // Moving in x-direction (allowed)
    if((startPos[0] !== endPos[0]) && absDiff_y === 0){
        isAllowed = true;
    }
    // Moving in y-direction (allowed)
    else if(absDiff_y >= 1 && (startPos[0] === endPos[0])){
        isAllowed = true;
    }
    // Diagonal movement is not allowed
    else{
        isAllowed = false;
    }
 
    return isAllowed
}

/**
 * Helper function to calculate the number of steps moved by a dragged figure.
 * @param {Array} startPos - The starting position of the movement as [x, y].
 * @param {Array} endPos - The ending position of the movement as [x, y].
 * @returns {Array} An array containing the number of steps moved in the x- and y-directions.
 */
function getMovingSteps(startPos, endPos){
    // Array to translate a letter to corresponding number as defined in 'parameters/gameFieldObj'
    const let2num = gameFieldObj.Letters2Numbers;
    // Absolute difference between the x-coordinates
    const x_steps = Math.abs(let2num[endPos[0]] - let2num[startPos[0]]);
    // Absolute difference between the y-coordinates
    const y_steps = Math.abs(endPos[1] - startPos[1]); 
    // Array with steps in x- and y- direction 
    const steps = [x_steps, y_steps]; 
 
    return steps
}    

/**
 * Helper function to handle the interaction in case of an occupied game field.
 * @param {object} targetFieldProps - The properties of the target game field.
 * @param {object} draggedFigure - The game figure being dragged.
 * @returns {Array} Array containing objects of the interaction: [winnerFigure, defeatedFigure, isValidTurn]
 */
function handleOccupiedField(targetFieldProps, draggedFigure){ 
    // Get properties of placed figure [object]
    const placedFigure = targetFieldProps.figure;

    // If 'placedFigure' does not exist, return null
    if(!placedFigure){
        return [null, null, false]; 
    }
    // If the destination field is occupied by an opponent --> battle
    if (placedFigure.color !== draggedFigure.color){
        const [winner, loser] = battleFigures(draggedFigure, placedFigure);

        return [winner, loser, true]
    }
    // If the target field is occupied by own figure or is just not playable, return null
    else{ 
        return [null, null, false];  
    }   
}

/**
 * Helper function to handle the battle between two game figures.
 * @param {object} figObj_1 - The first game figure object.
 * @param {object} figObj_2 - The second game figure object.
 * @returns {object} Figure objects containing the winning and losing game figure properties
 */
function battleFigures(figObj_1, figObj_2){
    let winner = figObj_1; 
    let loser  = figObj_2;

    // Identify special cases
    const spyVsMarshal = ((figObj_1.figName.includes("Spy") || figObj_2.figName.includes("Spy")) && 
                         (figObj_1.figName.includes("Marshal") || figObj_2.figName.includes("Marshal"))) ? true : false ;

    const minerVsBomb = ((figObj_1.figName.includes("Miner") || figObj_2.figName.includes("Miner")) && 
                        (figObj_1.figName.includes("Bomb") || figObj_2.figName.includes("Bomb"))) ? true : false ; 

    try {
        if((figObj_1.value > figObj_2.value && !spyVsMarshal && !minerVsBomb) 
            || (figObj_1.figName.includes("Spy") && spyVsMarshal) 
            || (figObj_1.figName.includes("Miner") && minerVsBomb)){

            winner = figObj_1;
            loser = figObj_2;
            loser.isActive = false;
    
        }else if((figObj_1.value < figObj_2.value && !spyVsMarshal && !minerVsBomb) 
                || (figObj_2.figName.includes("Spy") && spyVsMarshal) 
                || (figObj_2.figName.includes("Miner") && minerVsBomb)){

            winner = figObj_2;
            loser = figObj_1;
            loser.isActive = false;
       
        }else{
            // If the compared values are equal 
            winner.isActive = false;
            loser.isActive = false;
        }
        return [winner, loser]       

    } catch (error) {
        console.error(error)
    }
}

/**
 * Helper function to update the properties of a specific field in the game field.
 *
 * @function
 * @param {Array<Object>} FieldState - The array representing the current state of the game field.
 * @param {number} indexField - The index of the field in the array to be updated.
 * @param {Array} props - An array containing the properties to be updated [isPlayable, figureObj].
 * @param {boolean} props [0]: The updated value for the 'isPlayable' property.
 * @param {Object} props [1]: The updated value for the 'figure' property.
 * @returns {Array<Object>} The updated game field state with modified properties.
 * @throws {Error} Throws an error if the provided index is out of bounds.
 *
 * @example
 * const updatedFieldState = updateGameFieldStateProps(gameFieldState, 2, [true, { id: 1, imgPath: '', ... }]);
 */
function updateGameFieldStateProps(FieldState, indexField, props){
    FieldState[indexField] = {
        ...FieldState[indexField],
        isPlayable: props[0],
        figure: props[1],
    };
    return FieldState;
}

/**
 * Function to handle the drag and drop process and ensure correct game logic.
 *
 * @param {Object} results - The results object containing information about the drag and drop action.
 * @param {Array<Object>} gameFieldState - The current state of the game field.
 * @param {Array<Object>} figureStorageState - The current state of the figure storage.
 * @param {string} prefixSingleFieldID - The prefix used to identify a single field in the game.
 * @param {Object} gameSettings - The current game settings.
 * @param {boolean} gameSettings.isPaused - Indicates if the game is paused.
 * @param {boolean} gameSettings.leaveGame - Indicates if a player has left the game.
 * @returns {?Object} An object containing the updated game field and figure storage states, or null if no update is needed.
 *
 * @example
 * const results = { source: {...}, destination: {...}, type: "FIGURE", draggableId: "white_knight" };
 * const updatedStates = handleDragDrop(results, gameFieldState, figureStorageState, "field_", gameSettings);
 */
export function handleDragDrop(results, gameFieldState, figureStorageState, prefixSingleFieldID, gameSettings) 
{   
    // Extract the properties after the DnD action
    const { source, destination, type, draggableId } = results;

    // If the game is paused, do nothing
    if(gameSettings.isPaused || gameSettings.leaveGame || gameSettings.timeIsOut){
        return null;
    }
    // If destination doesn't exist, do nothing 
    if(!destination){
        return null;        
    } 
    // If source and destination are equal, do nothing 
    if(source.droppableId === destination.droppableId && source.index === destination.index) 
        return null; 

    /**********************************************/
    // Preallocation
    let draggedFigure = null;                      // Placeholder for object properties of a dragged game figure  
    let winner = null;                             // Placeholder for object properties of a winner game figure 
    let loser = null;                              // Placeholder for object properties of a defeated game figure 
    let validTurn = true;
    let newFigureList = [...figureStorageState];   // Updated state of the list, which contains the game figures in starting position
    let newGameFieldState = [...gameFieldState];   // Updated state of the game-field-array
    let newFigureStorageState = null;              // Placeholder for an filtered array with removed game figures

    // Identify the index [number] of source and target game field
    const indexSourceField = getIndexOfGameField(gameFieldState, source); 
    const indexTargetField = getIndexOfGameField(gameFieldState, destination); 

    // Get properties of the target field object
    const targetFieldProps = getPropsOfGameField(gameFieldState, indexTargetField); 

    /****** Logic for moving game figures in different use-cases ******/
    // If properties of 'targetFieldProps' Object don't exist, do nothing
    if(!targetFieldProps){
        return null;
    }
    // It's only allowed to place game figures on the own half (before starting the game) 
    if (!gameSettings.ready2Play){
        switch(gameSettings.isPlayer1){
            case true:
                // Limitation of moving area from perspective of player 1
                if (targetFieldProps.pos_y > 4){
                    return null;
                } 
                break;
            case false:
                // Limitation of moving area from perspective of player 2
                if (targetFieldProps.pos_y < 7){
                    return null;
                } 
                break;

            default:    
        }
    } 
    /* *** Updating the States of figures and game field after dragging *** */
    if(type === "FIGURE" && source.droppableId !== destination.droppableId){
                        
        // Placing figures from storage zone on the game field (starting positions)
        if(newFigureList.length > 0 && source.droppableId === "storageZone"){

            // Return if target field is not playable or occupied by own figure
            if(!newGameFieldState[indexTargetField].isPlayable){ return null; } 
            // Identify dragged figure
            draggedFigure = newFigureList.find((figProps) => `${figProps.color}_${figProps.id}` === draggableId);
            // Remove dropped figure from the origin figure list (if not empty)
            newFigureStorageState = figureStorageState.filter((props) => props.id !== draggedFigure.id);
            // Update the State of the game field 
            newGameFieldState[indexTargetField] = {
                ...newGameFieldState[indexTargetField],
                isPlayable: false,
                figure: draggedFigure,
            };
        }
        // Moving figures inside the game field
        else if(destination.droppableId.includes(prefixSingleFieldID) && source.droppableId !== "storageZone"){
            [newGameFieldState, newFigureStorageState, draggedFigure, winner, loser, validTurn] = moveFigureOnField(newGameFieldState, gameSettings, 
                                                                           draggableId, figureStorageState, 
                                                                           indexSourceField, indexTargetField)
        }  
    }
    // Return updates states
    return {
        draggedFigure: draggedFigure,
        gameFieldState: newGameFieldState,
        figureStorageState: newFigureStorageState,
        winnerFigure: winner,
        defeatedFigure : loser, 
        isValidTurn: validTurn,       
      };       
}

/**
 * Retrieves properties of opponent figures that have been moved on the game field.
 * @param {object} movedFigObj - Object containing information about the moved figure, including its properties and source/destination fields.
 * @param {Array} currentGameFieldState - The current state of the game field.
 * @returns {object} An object containing properties of the moved opponent figure:
 *                   - figureProps: The properties of the moved figure.
 *                   - indexDestField: The index of the destination field in the game field state.
 *                   - destFieldID: The ID of the destination field.
 *                   - indexSourceField: The index of the source field in the game field state.
 */
export function getMovedOpponentFigureOnField(movedFigObj, currentGameFieldState){
    // Default Object
    let movedOpponentFigure = {
        figureProps: null,
        indexDestField: null,
        destFieldID: null,
        indexSourceField: null,
    };

    const indexSourceField = getIndexOfGameField(currentGameFieldState, movedFigObj.source); 
    const indexTargetField = getIndexOfGameField(currentGameFieldState, movedFigObj.destination); 

    if(indexTargetField !== null){       
        const targetFieldID = currentGameFieldState[indexTargetField].id;

        movedOpponentFigure = {
            figureProps: movedFigObj.figureProps,
            indexDestField: indexTargetField,
            destFieldID: targetFieldID,
            indexSourceField: indexSourceField,
        };
    }

    return movedOpponentFigure
}

/**
 * Adds an additional image path for the back side of a game figure.
 * @param {object} movedFigObj - Object containing information about the moved figure, including its properties and image paths.
 * @param {object} defaultFigProps - Optional parameter. Object containing default figure properties. Default value is imported from 'parameters.js'.
 * @returns {object} An object representing the moved figure with an additional path for the back side:
 *                   - If the back side path is added successfully, returns the updated figure object.
 *                   - If the back side path already exists or cannot be found in the default figure properties, returns the original figure object.
 */
export function addPathFigureBack(movedFigObj, defaultFigProps = figProperties){

    // Get a path of the corresponding image to hide the figure of the opponent
    const indexFigureBack = defaultFigProps.findIndex((figProps) => figProps.figName === "FigureBack.png" && figProps.color === movedFigObj.color);

    if(indexFigureBack !== -1){
        let currentFigurePaths = movedFigObj.imgPath;
        const containsPath = currentFigurePaths.some(path => path.includes("FigureBack"));

        if(!containsPath){
            const imgFigureBackPath = defaultFigProps[indexFigureBack].imgPath[0];
            currentFigurePaths.push(imgFigureBackPath);

            const movedFigureProps = {
                ...movedFigObj,
                imgPath: currentFigurePaths,
            };
            return movedFigureProps

        }else{
            return movedFigObj
        }
    }

return movedFigObj;
}

/**
 * Merges the field states of the opponent into the game field states of the current player.
 * @param {Array} addedOpponentFieldState - The field states of the opponent to be merged.
 * @param {Array} gameFieldState - The current game field states of the player.
 * @returns {Array} The updated game field states after merging the opponent's field states.
 */
export function mergeGameFieldStates(addedOpponentFieldState, gameFieldState){

    // Copy input state arrays to avoid changes on the input array
    const copiedAddedOpponentFieldState = [...addedOpponentFieldState];
    const copiedGameFieldState          = [...gameFieldState];

    copiedAddedOpponentFieldState.forEach(addedProps => {
        let foundIndex = copiedGameFieldState.findIndex((fieldProps) => fieldProps.id === addedProps.id);
        
        if(foundIndex !== -1){
            copiedGameFieldState[foundIndex] = addedProps;
        }
    }) 

    return copiedGameFieldState
}

/**
 * Tracks and provides updates of the opponent field states.
 * @param {Array} prevFieldStateArray - The previous array of opponent field states.
 * @param {object} providedFieledState - The provided field state update.
 * @returns {Array} The updated array of opponent field states after tracking/providing updates.
 */
export function trackOpponentFieldStateUpdates(prevFieldStateArray, providedFieledState){

    let opponentFieldStates = [...prevFieldStateArray];
    const foundElemIndex = opponentFieldStates.findIndex(obj => obj.figure.id === providedFieledState.figure.id);

    if(foundElemIndex !== -1){
        opponentFieldStates[foundElemIndex] = providedFieledState;
    }
    else{
        opponentFieldStates.push(providedFieledState);
    }
 
    return opponentFieldStates
}