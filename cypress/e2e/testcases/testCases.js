import * as parameters from '../../../src/game-logic/parameters.js';

export function run_Req01_testCase(){
  it('Req_01: Test invalid player names and disabled buttons', () => {
      const inputSelector = 'input[id="inputPlayerName"]';
      const buttonSelector = 'button[id="#highlighted-button"]'
      const invalidPlayerNames = ['A', 'PlayerNameCouldBeTooLong'];
      const expectedButtonNames = ['Create New Game', 'Join Game'];
      
      invalidPlayerNames.forEach( entry => {
        cy.get(inputSelector).clear()
        cy.get(inputSelector).type(entry)
        cy.get(inputSelector).should('have.value', entry)
          .then(($input) => {
            if($input.val().length < parameters.genCfg.minInputLength || $input.val().length >= parameters.genCfg.maxInputLength){
              // Check for visible info text (a)
              cy.get('#infoPlayerName').should('be.visible');
              // Check for disabled buttons (b)
              cy.get(buttonSelector).each(($button) => {
                  cy.wrap($button).should('be.disabled');
                  cy.wrap($button).invoke('text').then((buttonName) => {
                      expect(expectedButtonNames).to.include(buttonName.trim());
                  });                        
              });                    
            }
          });
      })
      // Check for existing game logo with correct text (c)
      cy.get('div.game-logo').should('exist')   
      cy.get('div.game-logo h1').should('have.text', 'Stratego');          
    });
}

export function run_Req02_testCase(){
    it('Req_02: Test create new game', () => {
        const inputSelector = 'input[id="inputPlayerName"]';
        const validPlayerName = 'Rocket';
        const buttonName = 'Create New Game';
        // Use the url of deployed backend server or local server
        const SETUPURL = "https://stratego-server-tykz.onrender.com/setup" || "http://localhost:3001/setup";

        cy.get(inputSelector).clear()
        cy.get(inputSelector).type(validPlayerName)
        cy.get(inputSelector).should('have.value', validPlayerName)
        cy.contains('button', buttonName).should('not.be.disabled').click();

        // Check a correct page url (a)
        cy.url().should('eq', 'http://localhost:3000/setUp');

        // Check a valid server response (b)
        cy.intercept('POST', SETUPURL, (req) => {
          req.reply((res) => {
            expect(res.statusCode).to.eq(200); 
          });
        }).as('postSetup');
        
        // Checking existing cookies (c)
        cy.wait('@postSetup').then(() => {
          cy.getCookie('token').should('exist');
          cy.getCookie('userID').should('exist');
          cy.getCookie('playerName').should('exist');          
          // Check a correct player number  
          cy.getCookie('playerNumber').should('have.property', 'value', '1'); 
        });

        // Checking welcome text (d)
        
      }); 
      
}