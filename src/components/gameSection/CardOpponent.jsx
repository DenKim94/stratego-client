import React from 'react';
import { motion, useAnimation } from 'framer-motion'
import * as parameters from '../../game-logic/parameters.js';

const CardOpponent = ({ opponentFigProps, revealed, props = parameters}) => {
    const controls = useAnimation();
    const styleProps = props.CardOpponentProps.style;
    const valueStyle = {...props.CardValueStyle,
                        textAlign: 'center'};
        
    return ( 
        <motion.div
        className="card"
        style={styleProps}
        animate={controls}
        >
        <motion.div
            className="card-face"
            style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                backfaceVisibility: 'hidden',
            }}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: revealed ? 180 : 0,
                       transition: { duration: props.CardOpponentProps.transitionDuration_s }}}
            >
            <img src={opponentFigProps.imgPath[2]} alt="Back" style={{ width: '100%', height: '100%' }} />
        </motion.div>
        <motion.div
            className="card-face"
            style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                backfaceVisibility: 'hidden',
            }}
            initial={{ rotateY: 180 }}
            animate={{
                rotateY: revealed ? 0 : 180,
                transition: { duration: props.CardOpponentProps.transitionDuration_s } 
              }}
            >
            <img src={revealed && !opponentFigProps.isActive ? opponentFigProps.imgPath[1]:opponentFigProps.imgPath[0]} alt="Front" style={{ width: '100%', height: '100%'}} />
            {(!opponentFigProps.figName.includes('Bomb.png')) && (!opponentFigProps.figName.includes('Flag')) && (
                <span style={valueStyle}>{opponentFigProps.value}</span>
            )}
        </motion.div>
</motion.div>
  
  
    );
}
 
export default CardOpponent;