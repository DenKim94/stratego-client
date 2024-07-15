import React from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { useGameStates } from '../context/GameStatesContext.js';

/**
 * React component representing a drop down button.
 * A color of player figures is going to be set by the user
 * @component
 */

const DropDownButton = () => {

    const { setGameStates } = useGameStates();
    
    // Update state to provide chosen color 
    const handleColorSelection = (selectedColor) => {

        // Color of player 2 depends on the chosen color by player 1
        let colorOfPlayer2 

        switch (selectedColor){
            case 'red':
                colorOfPlayer2 = 'blue';
                break;

            case 'blue':
                colorOfPlayer2 = 'red';
                break;  

            default:
                colorOfPlayer2 = '';                  
        }

        // Update gamestates
        setGameStates((prevStates) => ({        
          ...prevStates,
          colorPlayer1: selectedColor,
          colorPlayer2: colorOfPlayer2,
        }));

    };

    const styleItem_1 = {
        color: 'red', 
        margin: 'auto',
        textAlign: 'center'

    };

    const styleItem_2 = {
        color: 'rgb(21, 104, 219)', 
        margin: 'auto',
        textAlign: 'center'
    };

    return ( 
        <DropdownButton
            as={ButtonGroup}
            key={'start'}
            id={'dropdown-button-drop-start'}
            drop={'start'}
            variant="secondary"
            title={'Chose your color'}
            onSelect={handleColorSelection}>

            <Dropdown.Item eventKey="red">
                <div>
                    <p style={styleItem_1}> Red </p>
                </div>
            </Dropdown.Item>
            <Dropdown.Item eventKey="blue">
                <div>
                    <p style={styleItem_2}> Blue </p>
                </div>
            </Dropdown.Item>
        </DropdownButton>
     );
}
 
export default DropDownButton;