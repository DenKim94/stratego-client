import React from "react";
import * as parameters from '../../game-logic/parameters.js';
import GameFigure from './GameFigure';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import "./FigureStorage.css";

/**
 * React component representing a storage container for game figures.
 *
 * @component
 * @param {Object} props - The component's properties.
 * @param {Array} props.figStateArray - An array containing the state of game figures to be displayed in the storage.
 * @param {Object} props.styleStorageTopic - Custom style for the storage topic.
 * @returns {JSX.Element|null} Returns the JSX element representing the figure storage or null if figStateArray is empty.
 */

const FigureStorage = ({ figStateArray, 
                         styleStorageTopic = parameters.styleStorageTopic,
                        }) => {

    // *** Handle Early Return *** 
    if(!figStateArray || figStateArray.length === 0){
        return null;
    }

    return(
        <div className="figure-storage">
            <p id="storage-name" style={styleStorageTopic}> * My Game Figures * </p>
            <Droppable droppableId="storageZone" type = "FIGURE"> 
            {/* *** Storage of Game Figures *** */}
            {(provided) => (
                <div 
                {...provided.droppableProps}
                ref={provided.innerRef}
                >
                    <div data-bs-spy="scroll" 
                         data-bs-target="#navbar-example2" 
                         data-bs-offset="0" 
                         className="scrollspy-example" 
                         tabIndex="0">
                            {/* Store the draggable Figure-Components */}
                            {figStateArray.map((figProps, idx) => (
                                <Draggable draggableId={`${figProps.color}_${figProps.id}`} 
                                key= {`${figProps.color}_${figProps.id}`} 
                                index={idx} 
                                type = "FIGURE"
                                >
                                    {(provided,snapshot)=>(
                                        <div className='game-figure'
                                            ref={provided.innerRef} 
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            >
                                                <GameFigure propsObj={figProps} snapshot = {snapshot}/>
                                        </div>
                                    )} 
                                </Draggable>  
                                ))}                  
                    </div> 
                    {provided.placeholder}                                          
                </div>
                )}                           
            </Droppable>  
        </div>
    )
};

export default FigureStorage;