import * as parameters from '../../../src/game-logic/parameters.js';
import {paramSet_generic, paramSet_Req01, paramSet_Req02, paramSet_Req03} from '../testParameters.js'
import * as tstFcn from './helperFunctions.js'

// E2E-Testcases derived from Testspec 'PRJ_Req_Stratego.xlsx' 

export function run_Req01_testCase(){
  it('Req_01: Test invalid player names and disabled buttons', () => {

      paramSet_Req01.invalidPlayerNames.forEach( entry => {
        cy.get(paramSet_generic.selectorInputPlayerName).clear();
        cy.get(paramSet_generic.selectorInputPlayerName).type(entry);
        cy.get(paramSet_generic.selectorInputPlayerName).should('have.value', entry)
          .then(($input) => {
            if($input.val().length < parameters.genCfg.minInputLength || $input.val().length >= parameters.genCfg.maxInputLength){
              // Check for visible info text (a)
              cy.get('#infoPlayerName').should('be.visible');
              // Check for disabled buttons (b)
              cy.get(paramSet_generic.selectorButton).each(($button) => {
                  cy.wrap($button).should('be.disabled');
                  cy.wrap($button).invoke('text').then((buttonName) => {
                      expect(paramSet_Req01.expectedButtonNames).to.include(buttonName.trim());
                  });                        
              });                    
            }
          });
      })
      // Check for existing game logo with correct text (c)
      cy.get(paramSet_Req01.selectorGameLogo).should('exist');   
      cy.get(paramSet_Req01.h1TagGameLogo).should('have.text', 'Stratego');          
    });
}

export function run_Req02_testCase(){
    it('Req_02: Test create and cancel new game', () => {

          // Check a valid server response (b)
          tstFcn.trackServerResponse(paramSet_Req02.SetUp_URL);
          cy.visit('/');
          tstFcn.createNewGame(paramSet_Req02.validPlayerName);

          // Check a correct url (a)
          cy.url().should('eq', paramSet_Req02.expectedURL);

          // Checking existing cookies (c)
          cy.wait('@postSetup').then(() => {
            cy.getCookie('token').should('exist');
            cy.getCookie('userID').should('exist');
            cy.getCookie('playerName').should('exist');          
            // Check a correct player number  
            cy.getCookie('playerNumber').should('have.property', 'value', '1'); 
          });
  
          // Checking welcome text (d)
          cy.get(paramSet_Req02.selectorWelcomeText)
            .should('be.visible') 
            .and('contain', `Welcome ${paramSet_Req02.validPlayerName}!`) 
            .and('contain', parameters.setUpProps.messages.player1);     

          // Checking placeholder property and titles of dropdown buttons (e) 
          cy.get(paramSet_Req02.selectorInputOpponentName).should('have.attr', 'placeholder', paramSet_Req02.placeholderOpponentName);
          cy.get(paramSet_Req02.selectorDropDownColor).each(($button) => {
              cy.wrap($button).should('not.be.disabled').and('be.visible');  
              cy.wrap($button).invoke('text').then((buttonName) => {
                expect(paramSet_Req02.titleDropDownColor).to.include(buttonName.trim());
              });             
          })
          cy.get(paramSet_Req02.selectorDropDownTimeLimit).each(($button) => {
            cy.wrap($button).should('not.be.disabled').and('be.visible');  
            cy.wrap($button).invoke('text').then((buttonName) => {
              expect(paramSet_Req02.titleDropDownTimeLimit).to.include(buttonName.trim());
            });             
          })   

          // Checking disabled 'Start Game' button and enabled 'Cancel' button (f) & (g)
          cy.get(paramSet_generic.selectorButton).each(($button) => {
            cy.wrap($button).invoke('text').then((buttonName) => {
                if(buttonName.trim() === paramSet_Req02.expectedStartButtonName){
                  cy.wrap($button).should('be.visible').and('be.disabled');
                }else if(buttonName.trim() === paramSet_Req02.expectedCancelButtonName){
                  cy.wrap($button).should('be.visible').and('not.be.disabled');
                }
            });                        
          });

          // Checking disconnecting user (h)
          tstFcn.clickOnCancelButton();
          cy.window().then((window) => {
            const item = JSON.parse(window.localStorage.getItem(paramSet_generic.localStorage.paramName_bool));
            item.length === 1 ? expect(item[0]).to.equal(paramSet_generic.localStorage.expectedParamValue) : expect(item).to.equal(paramSet_generic.localStorage.expectedParamValue);
          });

          // Checking a valid link to instructions document in a new tab (i)
          cy.get(paramSet_Req02.selectorInstictionsLink).should('be.visible')
            .and('contain.text', parameters.instructionsProps.linkName).and('have.attr', 'target', '_blank');
          
          cy.get(paramSet_Req02.selectorInstictionsLink).then($link => {
            const href = $link.prop('href');
            cy.wrap($link).invoke('removeAttr', 'target').click();
            cy.url().should('eq', href);
          });  
          cy.visit('/')
      });      
}

export function run_Req03_testCase() {
  it('Req_03: Test multiplayer', () => {
    // Create a new game as player 1
    createGamePlayer1()

    // Create a new game as player 2
    joinGamePlayer2()
  });

}

function createGamePlayer1(){
  cy.session('player_1', () => {
    tstFcn.trackServerResponse(paramSet_Req02.SetUp_URL);
    cy.visit('/');
    tstFcn.createNewGame(paramSet_Req03.validPlayerName);

    cy.wait('@postSetup').then(() => {
      cy.getCookie('playerNumber').should('have.property', 'value', '1');
    });

    tstFcn.setUpNewGame();
    tstFcn.clickOnStartGameButton();
  });
}

function joinGamePlayer2(){
  cy.session('player_2', () => {
    tstFcn.trackServerResponse(paramSet_Req02.SetUp_URL);
    cy.visit('/');
    tstFcn.joinGame(paramSet_Req03.validOpponentName);

    // Check a correct url
    cy.url().should('eq', paramSet_Req02.expectedURL);

    // Checking welcome text
    cy.get(paramSet_Req02.selectorWelcomeText)
      .should('be.visible')
      .and('contain', `Welcome ${paramSet_Req03.validOpponentName}!`)
      .and('contain', parameters.setUpProps.messages.player2);

    // Checking existing cookies
    cy.wait('@postSetup').then(() => {
      cy.getCookie('token').should('exist');
      cy.getCookie('userID').should('exist');
      cy.getCookie('playerName').should('exist');
      cy.getCookie('playerNumber').should('have.property', 'value', '2');
    });

    // Checking disabled 'Join Game' button and enabled 'Cancel' button
    cy.get(paramSet_generic.selectorButton).each(($button) => {
      cy.wrap($button).invoke('text').then((buttonName) => {
        if (buttonName.trim() === paramSet_Req03.buttonNameJoinGame) {
          cy.wrap($button).should('be.visible').and('be.disabled');
        } else if (buttonName.trim() === paramSet_Req02.expectedCancelButtonName) {
          cy.wrap($button).should('be.visible').and('not.be.disabled');
        }
      });
    });
    tstFcn.setUpJoinGame(paramSet_Req03.validPlayerName);
  });  
}

