import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Chat } from 'stream-chat-react'
import { ButtonStatesProvider } from './components/context/ButtonStatesContext';
import { GameStatesProvider } from './components/context/GameStatesContext';
import { OpponentStatesProvider } from './components/context/OpponentStatesContext';
import { ChannelStatesProvider } from './components/context/ChannelStatesContext';
import { StreamChat } from 'stream-chat' 
import Cookies from 'universal-cookie'
import './App.css';
import * as parameters from './game-logic/parameters';
import GameLogo from './components/gameSection/GameLogo';  
import HomeSection from './components/homeSection/HomeSection';
import WaitingRoom from './components/homeSection/WaitingRoom';
import GameSection from './components/gameSection/GameSection';
import ExitSection from './components/exitSection/ExitSection';  
import PageNotFound from './components/PageNotFound';
import SetUp from './components/homeSection/SetUp';
import { useLocalStorage } from './components/functions/useLocalStorage';

// ******************************************************************* 
/** 
 * Main component of the application "Stratego-Web" 
 * 
 * - Developer: D.Kim 
 * - Version: 1.0.0 
 * - Date of last changes: 17.07.2024
*/
// *******************************************************************  
const App = () => {
    const cookies = useMemo(() => new Cookies(), []);
    const apiKey = process.env.REACT_APP_API_KEY; 

    const { setItem, getItem } = useLocalStorage();

    // Client side authentication to the Chat-API with a valid key
    const client = StreamChat.getInstance(apiKey); 
    const [userConnected, setUserConnected] = useState(false);
    const [userCreated, setUserCreated]     = useState(false);
    const [tokenRef, setTokenRef]           = useState(null);

    // Get stored states from local storage in case of page reload
    useEffect(() => {
        const storedUserConnected = getItem('userConnected');

        if(storedUserConnected !== null){
            setUserConnected(storedUserConnected)
        } 
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        const maxConnectionAttempts   = parameters.genCfg.maxConnectionAttempts;
        let connectionAttemptsCounter = 0;

        if(userCreated && tokenRef){
            // Connect the user to the Chat-API/Platform with a valid token
            const connectUser = async () => {
                try {
                    await client.connectUser({
                        id: cookies.get("userID"),
                        name: cookies.get("playerName"),
                        playerNumber: cookies.get("playerNumber"),
                    }, tokenRef);
            
                    setUserConnected(true);
                    connectionAttemptsCounter = 0;
                    console.log(">> User connected.");

                } catch (error) {
                    console.error(error.message);

                    // Try to reconnect the user if maximum attempts currently not exceeded
                    if (connectionAttemptsCounter <= maxConnectionAttempts) {
                        connectionAttemptsCounter += 1;
                        connectUser();
                    } else {
                        console.error("Connecting user: Maximum number of attempts exceeded.");
                    }
                }
            };       
            if(!userConnected){
                connectUser();
            }
        }
        setItem('userConnected', userConnected)

        // eslint-disable-next-line
        }, [client, userConnected, cookies, userCreated, tokenRef]);

        return(
            <Router>
                <div className = "App"> 
                    <ButtonStatesProvider>
                        <GameStatesProvider>  
                            <ChannelStatesProvider>
                                <OpponentStatesProvider> 
                                    <Chat client={client}>  
                                        <GameLogo/>            
                                        <Routes>
                                            <Route path = "/" element={ <HomeSection /> }/>
                                            <Route path = "/setUp/*" element={ <SetUp setToken = {setTokenRef} 
                                                                                    userCreated = {userCreated} 
                                                                                    setUserCreated = {setUserCreated} 
                                                                                    setUserConnected = {setUserConnected}/>}/>
                                                                                    
                                            <Route path = "/waitingRoom" element={ <WaitingRoom /> }/>
                                            <Route path = "/gameSection" element={ <GameSection /> }/>
                                            <Route path = "/exitSection" element={ <ExitSection /> }/> 

                                            <Route path = "*" element={ <PageNotFound />} />                    
                                        </Routes> 
                                    </Chat> 
                                </OpponentStatesProvider> 
                            </ChannelStatesProvider>    
                        </GameStatesProvider>
                    </ButtonStatesProvider>                                             
                </div> 
            </Router>      
        )
};
 
export default App;