import React from 'react';
import './Buttons.css'

function Button({buttonName, isDisabled, customStyleProps, onCklickFunction}){
    // Default style properties
    let buttonStyle = {
            marginTop: '10px',
            border: '1px solid black',
            textAlign: 'center',
            fontSize:'15px',
        };

    // Add/Change style properties
    if(customStyleProps){
        buttonStyle = {...buttonStyle, ...customStyleProps};
    }
    
    return ( 
        <button style = {buttonStyle} 
                type="button" 
                id = "#highlighted-button" 
                className="btn btn-warning" 
                onClick={onCklickFunction}
                disabled = {isDisabled}>

            {buttonName}
        </button> 
    );
}
export default Button
