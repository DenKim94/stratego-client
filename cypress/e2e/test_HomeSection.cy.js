import * as parameters from '../../src/game-logic/parameters.js';
import * as helperFcn from './functions/helperTestFunctions.js'

describe('Home Section', () => {
  beforeEach(() => {
    // Besuche die Root-URL deiner Anwendung
    cy.visit('/');
  });
  
  it('Req_01: Test valid user name', () => {
    const inputSelector = 'input[id="inputPlayerName"]';
    cy.get(inputSelector).clear()
    cy.get(inputSelector).type('Ab')
    cy.get(inputSelector).should('have.value', 'Ab')
      .then(($input) => {
        expect($input.val().length).to.be.lessThan(3);
      });
  });
});