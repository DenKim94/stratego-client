import * as parameters from '../../../src/game-logic/parameters.js';
import {paramSet_generic, paramSet_Req01, paramSet_Req02} from '../testParameters.js'

export function run_Req01_testCase(){
  it('Req_01: Test invalid player names and disabled buttons', () => {

      paramSet_Req01.invalidPlayerNames.forEach( entry => {
        cy.get(paramSet_generic.selectorInputPlayerName).clear()
        cy.get(paramSet_generic.selectorInputPlayerName).type(entry)
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
      cy.get(paramSet_Req01.selectorGameLogo).should('exist')   
      cy.get(paramSet_Req01.h1TagGameLogo).should('have.text', 'Stratego');          
    });
}

export function run_Req02_testCase(){
    it('Req_02: Test create new game', () => {

          const SETUPURL = paramSet_Req02.SetUp_URL;
          // Check a valid server response (b)
          cy.intercept('POST', SETUPURL, (req) => {
            req.reply((res) => {
              expect(res.statusCode).to.eq(200); 
            });
          }).as('postSetup');

          cy.visit('/')
          cy.get(paramSet_generic.selectorInputPlayerName).clear()
          cy.get(paramSet_generic.selectorInputPlayerName).type(paramSet_Req02.validPlayerName)
          cy.get(paramSet_generic.selectorInputPlayerName).should('have.value', paramSet_Req02.validPlayerName)
          cy.contains('button', paramSet_Req02.buttonNameNewGame).should('not.be.disabled').click();
  
          // Check a correct page url (a)
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
            .should('be.visible') // Überprüfe, ob das Element sichtbar ist
            .and('contain', `Welcome ${paramSet_Req02.validPlayerName}!`) // Überprüfe, ob der Text den Benutzernamen enthält
            .and('contain', parameters.setUpProps.messages.player1);     

          // Checking placeholder property and titles of dropdown buttons (e) 
          cy.get(paramSet_Req02.selectorInputOpponentName).should('have.attr', 'placeholder', paramSet_Req02.placeholderOpponentName)
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

          // Checking disabled 'Start-Game' button and enabled 'Cancel' button (f) & (g)
          cy.get(paramSet_generic.selectorButton).each(($button) => {
            cy.wrap($button).invoke('text').then((buttonName) => {
                if(buttonName.trim() === paramSet_Req02.expectedStartButtonName){
                  cy.wrap($button).should('be.disabled');
                }else if(buttonName.trim() === paramSet_Req02.expectedCancelButtonName){
                  cy.wrap($button).should('not.be.disabled');
                }
            });                        
          });
          
          // Checking link to document in a new tab (h)


          // Checking disconnecting user (i)

      });      
}

export function run_Req03_testCase(){
  it('Req_03: Test start game', () => {
    // Log-In of Player 1 as a session
    cy.session('player1', () => {

      // TO-DO: Move following sections into seperate helper functions [27.07.2024]
      const SETUPURL = paramSet_Req02.SetUp_URL;
      // Check a valid server response (b)
      cy.intercept('POST', SETUPURL, (req) => {
        req.reply((res) => {
          expect(res.statusCode).to.eq(200); 
        });
      }).as('postSetup');

      cy.visit('/')
      cy.get(paramSet_generic.selectorInputPlayerName).clear()
      cy.get(paramSet_generic.selectorInputPlayerName).type(paramSet_Req02.validPlayerName)
      cy.get(paramSet_generic.selectorInputPlayerName).should('have.value', paramSet_Req02.validPlayerName)
      cy.contains('button', paramSet_Req02.buttonNameNewGame).should('not.be.disabled').click();

      // Check a correct page url (a)
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
        .should('be.visible') // Überprüfe, ob das Element sichtbar ist
        .and('contain', `Welcome ${paramSet_Req02.validPlayerName}!`) // Überprüfe, ob der Text den Benutzernamen enthält
        .and('contain', parameters.setUpProps.messages.player1);     
    })

    // Log-In of Player 2 as a session
    cy.session('player2', () => {
      cy.visit('/');
      
      // TO-DO: Move following sections into seperate helper functions [27.07.2024]
      cy.get(paramSet_generic.selectorInputPlayerName).type(paramSet_Req02.validOpponentName)
      cy.get(paramSet_generic.selectorInputPlayerName).should('have.value', paramSet_Req02.validOpponentName)
      cy.contains('button', paramSet_Req02.buttonNameJoinGame).should('not.be.disabled').click();
  })

  });   
}