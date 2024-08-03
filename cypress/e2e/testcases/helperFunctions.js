import {paramSet_generic, paramSet_Req02, paramSet_Req03} from '../testParameters.js'

function typeUserName(userName){
    try{
        cy.get(paramSet_generic.selectorInputPlayerName).clear()
        cy.get(paramSet_generic.selectorInputPlayerName).type(userName)
        cy.get(paramSet_generic.selectorInputPlayerName).should('have.value', userName)        
    }catch(err){
        console.error(err.message);
    } 
}

export function createNewGame(validPlayerName){
    try{
        typeUserName(validPlayerName)
        cy.contains('button', paramSet_Req02.buttonNameNewGame).should('not.be.disabled').click();
        cy.wait(paramSet_generic.waitTime_ms)

    }catch(err){
        console.error(err.message);
    } 
}

export function joinGame(validPlayerName){
    try{
        typeUserName(validPlayerName)
        cy.contains('button', paramSet_Req03.buttonNameJoinGame).should('not.be.disabled').click();
        cy.wait(paramSet_generic.waitTime_ms)

    }catch(err){
        console.error(err.message);
    } 
}

export function clickOnStartGameButton(){
    try{
        cy.get(paramSet_generic.selectorButton).each(($button) => {
            cy.wrap($button).invoke('text').then((buttonName) => {
                if(buttonName.trim() === paramSet_Req02.expectedStartButtonName){
                  cy.wrap($button).should('not.be.disabled');  
                  cy.wrap($button).click();
                }
            });                        
          });   
          cy.wait(paramSet_generic.waitTime_ms) 

    }catch(err){
        console.error(err.message);
    }  
}

export function clickOnCancelButton(){
    try{
        cy.get(paramSet_generic.selectorButton).each(($button) => {
            cy.wrap($button).invoke('text').then((buttonName) => {
                if(buttonName.trim() === paramSet_Req02.expectedCancelButtonName){
                  cy.wrap($button).click();
                }
            });                        
          });
        cy.wait(paramSet_generic.waitTime_ms) 

    }catch(err){
        console.error(err.message);
    }  
}

export function trackServerResponse(url){
    try{
        cy.intercept('POST', url, (req) => {
            req.reply((res) => {
              expect(res.statusCode).to.eq(200); 
            });
        }).as('postSetup');

    }catch(err){
        console.error(err.message);
    }
}

export function setUpNewGame(){
    try{
        // Set a valid name of the opponent
        cy.get(paramSet_Req02.selectorInputOpponentName).type(paramSet_Req03.validOpponentName)
        // Set color of player 1
        cy.get(paramSet_Req02.selectorDropDownColor).each(($button) => {
            cy.wrap($button).click();   
            cy.contains(paramSet_Req03.colorPlayer1).click();         
        }) 
        // Set time for each turn
        cy.get(paramSet_Req02.selectorDropDownTimeLimit).each(($button) => {
            cy.wrap($button).click();   
            cy.contains(paramSet_Req03.valueTimer_s).click();         
        })    
        
    }catch(err){
        console.error(err.message);
    }
}

export function setUpJoinGame(validOpponentName){
    try{
        // Set a valid name of the opponent
        cy.get(paramSet_Req02.selectorInputOpponentName).type(validOpponentName)
        // Trigger event by clicking the button
        cy.get(paramSet_generic.selectorButton).each(($button) => {
            cy.wrap($button).invoke('text').then((buttonName) => {
                if(buttonName.trim() === paramSet_Req03.buttonNameJoinGame){
                  cy.wrap($button).should('not.be.disabled');  
                  cy.wrap($button).click();
                }
            });                        
          });   
          cy.wait(paramSet_generic.waitTime_ms) 

    }catch(err){
        console.error(err.message);
    }
}

export function checkForPopUps(selector, expectedMessage, timeOut_ms){
    cy.get(selector)
    .should('be.visible')
    .should('contain.text', expectedMessage);

    cy.wait(timeOut_ms)
    cy.get(selector).should('not.exist')    
}

