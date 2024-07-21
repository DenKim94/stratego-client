import * as tc from './testcases/testCases.js'

describe('Run main_TestSpec', () => {
  beforeEach(() => {
    // Besuche die Root-URL deiner Anwendung
    cy.visit('/');
  });

  tc.run_Req01_testCase()

  tc.run_Req02_testCase()
});