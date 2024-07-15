import React from 'react';
import { motion } from 'framer-motion'
import * as parameters from '../../game-logic/parameters.js';

const CardPlayer = ({ playerFigProps, revealed, props = parameters}) => {

    const styleProps = props.CardPlayerProps.style;
    const valueStyle = props.CardValueStyle;
 
    return ( 
        <motion.div
        className="card"
        style={styleProps}
        >
            <motion.div
                className="card-face"
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                }}
                >
                <motion.img src={revealed && !playerFigProps.isActive ? playerFigProps.imgPath[1]:playerFigProps.imgPath[0]} alt="Front" 
                     style={{ 
                        width: '100%', 
                        height: '100%', 
                        transition: { duration: props.CardPlayerProps.transitionDuration_s }
                     }} />
                {(!playerFigProps.figName.includes('Bomb.png')) && (!playerFigProps.figName.includes('Flag')) && (
                    <span style={valueStyle}>{playerFigProps.value}</span>
                )}
            </motion.div>
        </motion.div>
  
    );
}
 
export default CardPlayer;