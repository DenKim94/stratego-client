export const paramSet_generic = {
    selectorInputPlayerName: 'input[id="inputPlayerName"]',
    selectorButton: 'button[id="#highlighted-button"]',
    waitTime_ms: 1000,
    localStorage:{
        paramName_bool: "userConnected",
        expectedParamValue: false,
    },
};

export const paramSet_Req01 = {
    invalidPlayerNames: ['A', 'PlayerNameCouldBeTooLong'],
    expectedButtonNames: ['Create New Game', 'Join Game'],
    selectorInfoLine: 'p[id="infoPlayerName"]',
    selectorGameLogo: 'div.game-logo',
    h1TagGameLogo: 'div.game-logo h1',
    valueGameLogo: 'Stratego',
};

export const paramSet_Req02 = {
    validPlayerName: 'Rocket',
    selectorWelcomeText: 'p[id="welcomeText"]',
    selectorInputOpponentName: 'input[id="inputOpponentName"]',
    placeholderOpponentName: 'Name of opponent',
    selectorDropDownColor: '#dropdown-button-drop-start',
    titleDropDownColor: 'Chose your color',
    selectorDropDownTimeLimit: '#dropdown-button-drop-end',
    titleDropDownTimeLimit: 'Set time limit per turn',
    expectedStartButtonName: 'Start Game', 
    expectedCancelButtonName: 'Cancel', 
    buttonNameNewGame: 'Create New Game',
    SetUp_URL: "https://stratego-server-tykz.onrender.com/setup" || "http://localhost:3001/setup", 
    expectedURL: 'http://localhost:3000/setUp',
    selectorInstictionsLink: 'a[href*="instructions"]', 
};

export const paramSet_Req03 = {
    validPlayerName: 'Obelix',
    validOpponentName: 'Asterix',    
    buttonNameJoinGame: 'Join Game',
    colorPlayer1: 'Red',
    colorPlayer2: 'Blue',
    valueTimer_s: "15",
    selectorPopUp: '.toast-container-setup',
    expectedPopUpMessage: "Opponent not found! Please try again!",
}