import React from 'react';

/* Component of the x-Axis */
const XAxis = ({xAxisArray,singleFieldWidth,gameStates,axisStyle}) => {
  if (!gameStates.isPlayer1){
    xAxisArray = xAxisArray.reverse();
  }

  return (
    <div className="x-axis" style={axisStyle}>
      {xAxisArray.map((letter, index) => (
        <div key={index} style={{alignItems: 'center', width: singleFieldWidth, textAlign: 'center'}}>{letter}</div>
      ))}
    </div>
  );
};

export default XAxis;
