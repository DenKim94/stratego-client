import React, { useState, useEffect, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useChatContext } from 'stream-chat-react';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Button from '../gameSection/Button.jsx'
import './CustomToastStyle.css'
import axios from 'axios';
import Cookies from 'universal-cookie'
import CustomTimerButton from './CustomTimerButton.jsx'
import DropDownButton from './DropDownButton.jsx'
import WaitingRoom from './WaitingRoom';
import * as parameters from '../../game-logic/parameters.js';
import * as helperFcn from '../functions/helperFunctions.js'
import { useGameStates } from '../context/GameStatesContext.js';
import { useChannelStates } from '../context/ChannelStatesContext.js';
import { useLocalStorage } from '../functions/useLocalStorage.js';
import { restoreChannel } from '../functions/restoreChannel.js';

/**
 * React component responsible for managing the setup phase before the game starts.
 * @component
 * @param {function} setToken - Function to set authentication token.
 * @param {boolean} userCreated - Indicates if the user is created.
 * @param {function} setUserCreated - Function to set user creation status.
 * @param {function} setUserConnected - Function to set user connection status.
 * @param {Object} setUpProps - Additional setup properties (default to parameters.setUpProps)
 * @param {Object} setUpProps.style - Custom styles for the component.
 */
const SetUp = ({ setToken,
                 userCreated, 
                 setUserCreated, 
                 setUserConnected,
                 setUpProps = parameters.setUpProps}) => {

    const { client } = useChatContext();
    const cookies = useMemo(() => new Cookies(), []);
    const { gameStates, setGameStates } = useGameStates();
    const [isReadyToStart, setReadyToStart] = useState(false);
    const { channelStates, setChannelStates } = useChannelStates();
    const { setItem, getItem, clearLocalStorage } = useLocalStorage();

    const navigate = useNavigate();
    // const SETUPURL = process.env.REACT_APP_SETUP_URL || "http://localhost:3001/setup";
    const SETUPURL = "https://stratego-server-tykz.onrender.com/setup" || "http://localhost:3001/setup";

    // Get stored states from local storage in case of page reload                
    useEffect(() => {
        const storedGameState = getItem('game-states');
        const storedUserCreated = getItem('userCreated');

        if(storedGameState !== null){
            setGameStates(storedGameState)
        } 
        if(storedUserCreated !== null){
            setUserCreated(storedUserCreated)
        } 
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        const setUserProps = async () => {

            try {
                // Get data from backend
                const res = await axios.post(SETUPURL, { gameStates });
                const { userProps, token } = res.data;
                    
                // Setting cookies
                cookies.set("token", token);              
                cookies.set("userID", userProps.userID);
                cookies.set("playerName", userProps.playerName);
                cookies.set("playerNumber", userProps.playerNumber);
                setToken(token);

            }catch(error){
                console.error(error.message);

                // Error Handling
                toast.error("Network error, please try again!", {
                    autoClose: parameters.genCfg.timeOutAutoClose_ms, // Optional: Timeout for closing the pop-up
                  });

                // Timeout for closing navigate back to the home section
                setTimeout(() => {
                    navigate("/");
                }, parameters.genCfg.timeOutErrorHandling_ms);
            }

            setUserCreated(true)
        }
        // Get user properties to set cookies 
        if(!userCreated){
            setUserProps() 
        }

        // Ensure complete game settings provided by player 1 and player 2
        if(gameStates.isPlayer1 && gameStates.opponentName.length > parameters.genCfg.minInputLength && 
            gameStates.colorPlayer1 && gameStates.timePerTurn_ms){
            setReadyToStart(true)

        }else if(!gameStates.isPlayer1 && gameStates.opponentName.length > parameters.genCfg.minInputLength){
            setReadyToStart(true)
        }
        
        // eslint-disable-next-line
    },[gameStates, setReadyToStart, userCreated, setUserCreated, SETUPURL, cookies, setToken])

    // Store channel ID for reconnection in case of page reload
    useEffect(() => {
        if(channelStates.channelObj !== null){
            setItem('channel-id', channelStates.channelObj.id)
        }
        // eslint-disable-next-line
    }, [channelStates])

    // Function to create a channel
    const createChannel = async () => {
        try{
            // Search user with defined opponent name
            const response = await client.queryUsers({name: { $eq: gameStates.opponentName }}); 
        
            const foundUser = response.users.filter( props => 
                props.online === true &&
                props.playerNumber !== gameStates.playerNumber
            )

            // If opponent was not found by entered name
            if(foundUser.length === 0){
                toast.info("Opponent not found! Please try again!", {
                    autoClose: parameters.genCfg.timeOutAutoClose_ms, // Optional: Timeout for closing the pop-up
                }); 
                            
                return null
            }

            // Create a channel for both players
            if(client.userID !== foundUser[0].id){
                const newChannel = client.channel("messaging", {
                    members: [client.userID, foundUser[0].id],
                });

                await newChannel.watch() // Listening to the channel

                setChannelStates((prevStates) => ({
                    ...prevStates,
                    channelObj: newChannel,
                })) 

                // Add cookie properties to the channel state
                if(cookies.cookies){
                    setChannelStates((prevStates) => ({
                        ...prevStates,
                        cookieObj: cookies,
                    })) 
                } 

                // Put the channel ID to local storage
                if(getItem('channelMember-id') === null){
                    setItem('channelMember-id', [client.userID, foundUser[0].id])
                }                           
            }
        }catch(error){
            // Error handling
            toast.error("Network error, please cancel and try again!", {
                autoClose: parameters.genCfg.timeOutAutoClose_ms, 
              }); 
            console.error(error.message)
        }
    };

    // Restore established channel in case of page reload
    useEffect(() => {
        const storedChannelID = getItem('channel-id');
        if(storedChannelID !== null){
            console.log(">> [@SetUp]: reconnect ...")

            restoreChannel(client, cookies, storedChannelID)
            .then((channel) => {
              if (channel) {
                setChannelStates((prevStates) => ({
                  ...prevStates,
                  channelObj: channel,
                  cookieObj: cookies,
                }));
              }
            })
            .catch(error => {
              console.error(error.message);
            });
        } 
    // eslint-disable-next-line
    }, [])

    // Update the state with opponent name
    const handleChangedName = (event) => {
        const inputValue = event.target.value;
        setGameStates((prevStates) => ({
            ...prevStates,
            opponentName: inputValue.trim(),
        }))           
    };

    // Handle action for player 1
    const startGame = () => {
        createChannel()
    }

    // Handle action for player 2
    const joinGame = () => {
        createChannel()
    }

    // Handle cancel
    const handleCancel = async () => {
        const homePath = "/";

        clearLocalStorage()
        await helperFcn.disconnectUser(client); 
        setUserConnected(false)
        setUserCreated(false)
        navigate(homePath);
    }
     
    return (
        <div style={setUpProps.style}>
            
                {channelStates.channelObj ? (   
                    // Rendered section if channel is established 
                    <WaitingRoom />
                ) : (
                    // Rendered section if channel is not established
                    <>
                        <p style={{ fontSize: '15px', 
                            color: 'rgb(248, 202, 45)', 
                            textAlign: 'center',
                            marginBottom: "20px"}}>

                            Welcome {gameStates.playerName}! 
                            <br/> {gameStates.isPlayer1 ? (setUpProps.messages.player1) : (setUpProps.messages.player2)}
                        </p>                    
                        <div className='game-settings' style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input
                                style={setUpProps.inputStyle}
                                type='string'
                                placeholder="Name of opponent"
                                value={gameStates.opponentName}
                                onChange={handleChangedName}
                            />
                            {gameStates.isPlayer1 ? (
                                <>
                                    <DropDownButton />
                                    <CustomTimerButton />
                                    <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                        <Button
                                            buttonName={'Start Game'}
                                            isDisabled={isReadyToStart ? false : true}
                                            customStyleProps={{ width: '120px', marginTop: '20px' }}
                                            onCklickFunction={startGame}
                                        />
                                        <Button
                                            buttonName={'Cancel'}
                                            isDisabled={false}
                                            customStyleProps={{ width: '120px', marginTop: '20px' }}
                                            onCklickFunction={handleCancel}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                    <Button
                                        buttonName={'Join Game'}
                                        isDisabled={isReadyToStart ? false : true}
                                        customStyleProps={{ width: '120px', marginTop: '20px' }}
                                        onCklickFunction={joinGame}
                                    />
                                    <Button
                                        buttonName={'Cancel'}
                                        isDisabled={false}
                                        customStyleProps={{ width: '120px', marginTop: '20px' }}
                                        onCklickFunction={handleCancel}
                                    />
                                </div>
                                
                            )}

                            <div style={parameters.instructionsProps.styleDiv}>
                                <a href="/instructions.html" target="_blank" rel="noopener noreferrer" style={parameters.instructionsProps.styleLink}>
                                    {parameters.instructionsProps.linkName}
                                </a>
                            </div> 
                            <ToastContainer position='top-right' />
                        </div>
                    </>
                )}          
        </div> 
    );
}
 
export default SetUp;
