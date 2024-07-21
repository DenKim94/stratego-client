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
                    // Req_01 (a)
                    cy.get('#infoPlayerName').should('be.visible');
                    // Req_01 (b)
                    cy.get(buttonSelector).each(($button) => {
                        cy.wrap($button).should('be.disabled');
                        cy.wrap($button).invoke('text').then((buttonName) => {
                            expect(expectedButtonNames).to.include(buttonName.trim());
                          });                        
                      });                    
                }
              });
        })
      });
}

export function run_Req02_testCase(){
    it('Req_02: Test create new game', () => {
        const inputSelector = 'input[id="inputPlayerName"]';
        const validPlayerName = 'Rocket';
        const buttonName = 'Create New Game';

        cy.get(inputSelector).clear()
        cy.get(inputSelector).type(validPlayerName)
        cy.get(inputSelector).should('have.value', validPlayerName)
        cy.contains('button', buttonName).should('not.be.disabled').click();
        cy.url().should('eq', 'http://localhost:3000/setUp');
        
      });    
}