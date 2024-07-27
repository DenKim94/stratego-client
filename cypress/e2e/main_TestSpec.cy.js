import * as tc from './testcases/testCases.js'

describe('Run main_TestSpec', () => {
  beforeEach(() => {
    cy.visit('/');
    Cypress.session.clearAllSavedSessions()
  });

  tc.run_Req01_testCase()
  tc.run_Req02_testCase()
});