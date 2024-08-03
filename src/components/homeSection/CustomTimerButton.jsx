import React from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { useGameStates } from '../context/GameStatesContext.js';

const CustomTimerButton = () => {

    const { setGameStates } = useGameStates();

    const handleTimeSelection = (timeLimitString_s) => {
        // Convert and calculate input to number in ms
        const timeLimitNumber_ms = Number(timeLimitString_s)*1000;

        // Update state to provide value of time limit 
        setGameStates((prevStates) => ({        
          ...prevStates,
          timePerTurn_ms: timeLimitNumber_ms,
        }));
      };

    const itemStyle = {
        margin: '4px', 
        textAlign: 'center'
    };

    return ( 
        <DropdownButton
        as={ButtonGroup}
        key={'end'}
        id={'dropdown-button-drop-end'}
        drop={'end'}
        variant="secondary"
        title={'Set time limit per turn'}
        onSelect={handleTimeSelection}
        >
            <Dropdown.Item eventKey="15">
                <div>
                    <p style={itemStyle}> 15 sec. </p>
                </div>
            </Dropdown.Item>
            <Dropdown.Item eventKey="30">
                <div>
                    <p style={itemStyle}> 30 sec. </p>
                </div>
            </Dropdown.Item>
            <Dropdown.Item eventKey="60">
                <div>
                    <p style={itemStyle}> 1 min. </p>
                </div>
            </Dropdown.Item>   
        </DropdownButton>
     );
}
 
export default CustomTimerButton;