/**
 * Helper function to set properties for a single game field
 * 
 * @function
 * @param {boolean} isPlayer1 - Boolean for player 1
 * @param {number} arrayLengthGameFields - Length of the array
 * @param {string} prefixSingleFieldID - Prefix for the unique identifier of the single field.
 * @param {number} index - Index of the single field.
 * @param {Array} fieldCoordinates - Coordinates of the single field [column, row].
 * @param {number} sizeSingleField - Size of the single field (width and height).
 * @param {string} backgroundColor - Background color of the single field.
 * @returns {Object} singleFieldProps: Properties for a single game field.
 * @property {string} singleFieldProps.id - Unique identifier for the single field.
 * @property {number} singleFieldProps.pos_x - X-coordinate of the single field (column).
 * @property {number} singleFieldProps.pos_y - Y-coordinate of the single field (row).
 * @property {boolean} singleFieldProps.isPlayable - Boolean for a playable field
 */
export const setProps4SingleField = (isPlayer1, arrayLengthGameFields, 
                                    prefixSingleFieldID, index, fieldCoordinates, 
                                    sizeSingleField, backgroundColor) => {
    let ID = null; 
    if(isPlayer1){
        ID = `${prefixSingleFieldID}_${index}`;
    }else
    // Reverse game field IDs for player 2
    {
        ID = `${prefixSingleFieldID}_${arrayLengthGameFields - 1 - index}`;  
    }
    const singleFieldProps = {
        id: ID,
        pos_x: fieldCoordinates[0],
        pos_y: fieldCoordinates[1],
        isPlayable: true,
        figure: null,
        style: {
            width: sizeSingleField,
            height: sizeSingleField,
            backgroundColor: backgroundColor, // set background color of a single field
            border: '1px solid black'         // set black border of the field 
        }       
    };
    return singleFieldProps
};

/**
 * Helper function to get coordinates for each field based on column and row arrays
 * 
 * @function
 * @param {Array} xCoordArray - Array of letters [string]
 * @param {Array} yCoordArray - Array of numbers [string]
 * @param {boolean} isPlayer1 - Indicates whether the coordinates are for Player 1
 * @returns {Array} coordinatesArray: Array of coordinates [column, row]
 */
export function getCoordinatesArray(xCoordArray,yCoordArray, isPlayer1){

    let coordinatesArray = yCoordArray.flatMap((yVal) => 
        xCoordArray.map((xVal) => [xVal, Number(yVal)])
    );
    if(!isPlayer1){
        coordinatesArray = coordinatesArray.reverse(); 
    }
    
    return coordinatesArray
};

/**
 * Helper function to set properties of non-playable fields based on specified coordinates
 * 
 * @function
 * @param {Object} singleFieldProps - Properties of a single game field.
 * @param {Array} currentCoordinates - Coordinates of the current field [column, row].
 * @param {Array} coordsNonPlayableFields - Array of coordinates for non-playable fields.
 * @param {string} color - Color to be set for non-playable fields.
 * @returns {Object} singleFieldProps: Modified properties of the single game field.
 * @property {boolean} singleFieldProps.isPlayable - Indicates whether the field is playable.
 * @property {string} singleFieldProps.style.border - Border style of the single field.
 * @property {string} singleFieldProps.style.backgroundColor - Background color of the single field.
 */
export function setNonPlayableFields(singleFieldProps,
                                     currentCoordinates,
                                     coordsNonPlayableFields,
                                     color){
    /* Check for coordinates of non playable fields 
          and modify the properties if neccessary */ 
    const containsCoordinates = coordsNonPlayableFields.some(coords =>
        arraysAreEqual(coords, currentCoordinates)
    );
    if(containsCoordinates){
        singleFieldProps.isPlayable = false;
        singleFieldProps.style.border = '0';
        singleFieldProps.style.backgroundColor = color;
      }

    return singleFieldProps  
}
/**
 *  Helper function to check if the coordinates are equal
*/
function arraysAreEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}

/** 
 * Helper function to get stored keys of a map
*/
export function getObjArrayKeys(objArray){
    let keysArray = [];
    objArray.forEach(obj => {
        const keys = Object.keys(obj);
        keysArray.push(keys)
      });
    return keysArray    
}

/**
 * Helper function to sort and return game figures of a specific player based on color.
 * 
 * @function
 * @param {Array} figList - List of game figure properties.
 * @param {string} colorPlayer - Color of the player for whom to retrieve the figures.
 * @returns {Array|null} playerFigures: Array of game figures for the specified player or null if none found.
 */
export function getFiguresOfPlayer(figList, colorPlayer){
    
    // Filter the list to get figures with corrresponding color by ignoring 'FigureBack.png'
    const playerFigures = figList.filter((figProps) => {
        return figProps.color === colorPlayer && figProps.figName !== 'FigureBack.png'
    }); 
    return playerFigures || null
}

/**
 * Helper function to get a color of the player based on the game states
 * 
 * @function
 * @param {Object} gameStates - Object containing game-related states.
 * @property {boolean} gameStates.isPlayer1 - Indicates whether the current player is Player 1.
 * @property {string} gameStates.colorPlayer1 - Color chosen by Player1
 * @returns {string|null} colorPlayer: Color of the current player or null if not determined.
 */
export function getColorOfPlayer(gameStates){
    // Returned variable as string
    let colorPlayer  
    // Chosen color of player 1
    if (gameStates.isPlayer1){ 
        colorPlayer = gameStates.colorPlayer1;
    }
    else {
        // Color of player 2 depends on the chosen color by player 1
        switch (gameStates.colorPlayer1){
            case 'red':
                colorPlayer = 'blue';
                break;

            case 'blue':
                colorPlayer = 'red';
                break;
            
            default:
                colorPlayer = null;    
        }
    }
    return colorPlayer 
}

/**
 * Retrieves information about the figure that is being dragged over a target field.
 *
 * @param {Object} targetFieldProps - Properties of the target field where the figure is being dragged.
 * @param {Object} fieldStates - Object-Array of field states containing information about different fields.
 * @param {string} targetFieldProps.droppableId - The unique identifier of the target field.
 * @param {number} fieldStates.id - The unique identifier of a field in the fieldStates array.
 * @param {number} fieldStates.pos_x - The x-coordinate position of the field.
 * @param {number} fieldStates.pos_y - The y-coordinate position of the field.
 * @param {Object} fieldStates.figure - The figure object associated with the field.
 *
 * @returns {Object} figureProps - Information about the dragged-over figure.
 * @returns {string} figureProps.fieldID - The unique identifier of the field over which the figure is dragged.
 * @returns {number} figureProps.position - The x and y coordinate position of the field.
 * @returns {Object} figureProps.figure - The figure object associated with the dragged-over field.
 */
export function getDraggedOverFigure(targetFieldProps, fieldStates){
    let figureProps = {
        fieldID: null,
        position: null,
        figure: null,
    }
    if(targetFieldProps && fieldStates){
        // Filter fieldStates to find the target field with a non-null figure
        const foundFieldProps = fieldStates.filter((props) => {
            return targetFieldProps.droppableId === props.id && props.figure
        });      
        
        if(foundFieldProps[0]){
            // Fill figureProps with information from the found field
            figureProps.fieldID = foundFieldProps[0].id;
            figureProps.position = [foundFieldProps[0].pos_x, foundFieldProps[0].pos_y];
            figureProps.figure = foundFieldProps[0].figure;
        }
    }

    return figureProps
}

/**
 * Identifies whether the figure on the source field is a scout figure and provides related information.
 *
 * @param {Object} sourceFieldProps - Properties of the source field containing the figure to be identified.
 * @param {Object} fieldStates - Array of field states containing information about different fields.
 * @param {string} sourceFieldProps.droppableId - The unique identifier of the source field.
 * @param {number} fieldStates.id - The unique identifier of a field in the fieldStates array.
 * @param {number} fieldStates.pos_x - The x-coordinate position of the field.
 * @param {number} fieldStates.pos_y - The y-coordinate position of the field.
 * @param {Object} fieldStates.figure - The figure object associated with the field.
 * @param {string} fieldStates.figure.figName - The name of the figure, used for identification.
 *
 * @returns {Object} scoutFigureProps - Information about the identified scout figure.
 * @returns {boolean} scoutFigureProps.isScoutFigure - Indicates whether the figure is a scout figure (true/false).
 * @returns {number} scoutFigureProps.sourcePosition - The x and y coordinate position of the source field.
 */
export function identifyScoutFigure(sourceFieldProps, fieldStates){
    let scoutFigureProps = {
        isScoutFigure: false,
        sourcePosition: null,
    };

    if(sourceFieldProps && fieldStates){
        // Filter fieldStates to find the source field with a scout figure
        const foundScoutProps = fieldStates.filter((props) => {
            return props.id === sourceFieldProps.droppableId && props.figure && props.figure.figName.includes('Scout')
        });      

        if(foundScoutProps[0]){
            // Fill scoutFigureProps with information from the found scout figure
            scoutFigureProps.isScoutFigure = true;
            scoutFigureProps.sourcePosition = [foundScoutProps[0].pos_x, foundScoutProps[0].pos_y];
        }
    }

    return scoutFigureProps  
}

/**
 * Checks the validity of a move for a scout figure on a game board.
 * @param {Array} startPos - The starting position [x (string), y (number)] of the scout figure
 * @param {Array} endPos   - The ending position [x (string), y (number)] where the scout figure is being moved
 * @param {Object} fieldStates  - Object-Array of field states containing information about single game fields
 * @param {number} playerNumber - Number of current player 
 *
 * @returns {boolean} isValidMove - Indicates whether the move of the scout figure is valid 
 */
export function checkValidScoutMove(startPos, endPos, fieldStates, playerNumber){

    const copiedGameFieldState = JSON.parse(JSON.stringify(fieldStates));

    let isValidMove = true;

    if(startPos[0] === endPos[0]){ // vertical movement: constant value of x-coordinate
        const foundArrayElements = copiedGameFieldState.filter(item => item.pos_x === startPos[0] && item.figure);
        
        if(playerNumber === 1){
            for (const elementProps of foundArrayElements){

                if(elementProps.pos_y !== startPos[1]){ // Ignore the same scout figure
                   if(elementProps.pos_y > startPos[1] && elementProps.pos_y < endPos[1]){ // scout 'jumped over' another figure from bottom to top
                     isValidMove = false;
                     break;

                   }else if(elementProps.pos_y < startPos[1] && elementProps.pos_y > endPos[1]){ // scout 'jumped over' another figure from top to bottom
                    isValidMove = false;
                    break;
                   }                   
                }
            }

        }else{
            for (const elementProps of foundArrayElements){

                if(elementProps.pos_y !== startPos[1]){ // Ignore the same scout figure
                   if(elementProps.pos_y < startPos[1] && elementProps.pos_y > endPos[1]){ // scout 'jumped over' another figure from bottom to top
                     isValidMove = false;
                     break;

                   }else if(elementProps.pos_y > startPos[1] && elementProps.pos_y < endPos[1]){ // scout 'jumped over' another figure from top to bottom
                    isValidMove = false;
                    break;
                   }                   
                }
            }
        }

    }else{ // horizontal movement: constant value of y-coordinate
        const foundArrayElements = copiedGameFieldState.filter(item => item.pos_y === startPos[1] && item.figure);

        if(playerNumber === 1){
            for (const elementProps of foundArrayElements){
                
                if(elementProps.pos_x !== startPos[0]){ // Ignore the same scout figure
                   if(elementProps.pos_x > startPos[0] && elementProps.pos_x < endPos[0]){ // scout 'jumped over' another figure from left to right
                     isValidMove = false;
                     break;

                   }else if(elementProps.pos_x < startPos[0] && elementProps.pos_x > endPos[0]){ // scout 'jumped over' another figure from right to left
                    isValidMove = false;
                    break;
                   }                   
                }
            }

        }else{
            for (const elementProps of foundArrayElements){

                if(elementProps.pos_x !== startPos[0]){ // Ignore the same scout figure
                   if(elementProps.pos_x < startPos[0] && elementProps.pos_x > endPos[0]){ // scout 'jumped over' another figure from left to right
                     isValidMove = false;
                     break;

                   }else if(elementProps.pos_x > startPos[0] && elementProps.pos_x <= endPos[0]){ // // scout 'jumped over' another figure from right to left
                    isValidMove = false;
                    break;
                   }                   
                }
            }
        }
    }

    return isValidMove
}   

/**
 * Retrieves the position of a field on the game board based on its unique identifier.
 *
 * @param {Object} targetFieldProps - Properties of the target field for which the position is to be retrieved.
 * @param {Object} fieldStates - Array of field states containing information about different fields.
 * @param {string} targetFieldProps.droppableId - The unique identifier of the target field.
 * @param {number} fieldStates.id - The unique identifier of a field in the fieldStates array.
 * @param {number} fieldStates.pos_x - The x-coordinate position of the field.
 * @param {number} fieldStates.pos_y - The y-coordinate position of the field.
 *
 * @returns {number} fieldPosition - The x and y coordinate position of the target field.
 *   - Returns null if the target field or its properties are not found.
 */
export function getFieldPosition(targetFieldProps, fieldStates){
    let fieldPosition = null;

    if(targetFieldProps && fieldStates){
        // Extract the unique identifier of the target field
        const fieldID = targetFieldProps.droppableId;

        // Filter fieldStates to find the target field properties based on its unique identifier
        const fieldProps = fieldStates.filter((props) => {
            return props.id === fieldID 
        });  
        
        // If the target field properties are found, retrieve and set its position in fieldPosition
        if(fieldProps[0]){
            fieldPosition = [fieldProps[0].pos_x, fieldProps[0].pos_y]
        }
    }

    return fieldPosition
}

/** 
 * Function to disconnect a user  
 * 
*/
export async function disconnectUser(clientObj) {
    try {
        await clientObj.disconnectUser();
        console.log(">> User disconnected.") 

    } catch (error) {
        console.error(error.message);
    }

    return [clientObj]
}

/** 
 * Function to delete all saved cookies
 * 
*/
export function deleteCookies(cookiesObj){
    try {
        const allCookies = cookiesObj.getAll();
        const cookieNames = Object.keys(allCookies);

        cookieNames.forEach(cookieName => {
            cookiesObj.remove(cookieName, { path: '/' });
          });
          console.log(">> Saved cookies removed.")  

    } catch(error) {
        console.error(error.message);
    }

    return [cookiesObj]
}

/**
 * Determines the color and number of the current player based on the specified parameters.
 * @param {boolean} isPlayer1 - Indicates whether the current player is Player 1.
 * @param {string} colorPlayer1 - The color assigned to Player 1.
 * @param {string} colorPlayer2 - The color assigned to Player 2.
 * @returns {Array} An array containing the color and number of the current player:
 *                  - The color of the current player.
 *                  - The number of the current player (1 or 2).
 */
export function getColorAndNumberOfCurrentPlayer(isPlayer1, colorPlayer1, colorPlayer2){
    
    let playerColor; 
    let playerNumber;

    if(isPlayer1){
        playerColor  = colorPlayer1;
        playerNumber = 1;
    }
    else{
        playerColor  = colorPlayer2;
        playerNumber = 2;
    }  
      
    return [playerColor, playerNumber];
}