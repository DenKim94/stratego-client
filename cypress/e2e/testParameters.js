export const paramSet_generic = {
    selectorInputPlayerName: 'input[id="inputPlayerName"]',
    selectorButton: 'button[id="#highlighted-button"]',
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
    validOpponentName: 'Groot',
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
    buttonNameJoinGame: 'Join Game',
    SetUp_URL: "https://stratego-server-tykz.onrender.com/setup" || "http://localhost:3001/setup", 
    expectedURL: 'http://localhost:3000/setUp',
};

export const paramSet_Req03 = {
  
}