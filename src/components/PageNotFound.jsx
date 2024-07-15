import React from "react";
import * as parameters  from '../game-logic/parameters.js';

/**
 * React component rendered for the "Page Not Found" scenario.
 * @component
 * @param {Object} pageNotFoundProps - Additional properties for the PageNotFound component.
 * @returns {JSX.Element} - React JSX element representing the PageNotFound component.
 */
const PageNotFound = ({props = parameters.pageNotFoundProps}) => {

    return ( 
        <div style={props.style}>
            {props.message}
        </div>
     );
}

export default PageNotFound;