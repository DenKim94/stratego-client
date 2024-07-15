import React from 'react';
/* Component of the y-Axis */
const YAxis = ({yAxisArray,axisHeight,gameStates,axisStyle}) => {
  if (!gameStates.isPlayer1){
    yAxisArray = yAxisArray.reverse();
  }

  return (
    <div className="y-axis" style={axisStyle}>
      {yAxisArray.map((number, index) => (
        <div key={index} style={{ lineHeight: `${axisHeight/10}px` }}>{number}</div>
      ))}
    </div>
  );
};

export default YAxis;
