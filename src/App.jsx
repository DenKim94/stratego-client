import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Chat } from 'stream-chat-react'
import { ButtonStatesProvider } from './components/context/ButtonStatesContext';
import { GameStatesProvider } from './components/context/GameStatesContext';
import { OpponentStatesProvider } from './components/context/OpponentStatesContext';
import { ChannelStatesProvider } from './components/context/ChannelStatesContext';
import { StreamChat } from 'stream-chat' 
import './App.css';
import * as parameters from './game-logic/parameters.js';
import GameLogo from './components/gameSection/GameLogo';  
import HomeSection from './components/homeSection/HomeSection';
import WaitingRoom from './components/homeSection/WaitingRoom';
import GameSection from './components/gameSection/GameSection';
import ExitSection from './components/exitSection/ExitSection';  
import PageNotFound from './components/PageNotFound';
import SetUp from './components/homeSection/SetUp';

// ******************************************************************* 
/** 
 * Main component of the application "Stratego-Web" 
 * 
 * - Developer: D.Kim 
 * - Version: 1.3.0 
 * - Date of last changes: 23.02.2025
*/
// *******************************************************************  
const App = () => {
    const apiKey = process.env.REACT_APP_API_KEY; 

    useEffect(() => {
        const wakeUpServer = () => {
          fetch(`${parameters.genCfg.SERVER_URL}/wakeup`)
            .then((response) => response.json())
            .then((data) => console.log(data.message))
            .catch((error) => console.error(error.message));
        };
        // Aufwecken des Servers in Intervallen
        wakeUpServer();
    
        // Intervall einrichten (in Millisekunden)
        const interval = setInterval(wakeUpServer, parameters.genCfg.SERVER_WAKEUP_INTERVAL_min * 60 * 1000);
    
        // Cleanup-Funktion, um das Intervall zu löschen, wenn die Komponente nicht mehr im DOM ist
        return () => clearInterval(interval);
      }, []);

    // Client side authentication to the Chat-API with a valid key
    const client = StreamChat.getInstance(apiKey); 
 
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
                                            <Route path = "/setUp/*" element={ <SetUp />}/>
                                                                                    
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