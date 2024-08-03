import * as tc from './testcases/testCases.js'

describe('Run main_TestSpec', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  // tc.run_Req01_testCase()
  // tc.run_Req02_testCase()
  tc.run_Req03_testCase()
});