/// <reference types="cypress" />

describe('navigation test suite #3', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io');
  });

  it('should load the page successfully - TC8', () => {
    cy.url().should('include', 'example.cypress.io');
    cy.title().should('not.be.empty');
  });

  it('should display main content - TC8', () => {
    cy.get('body').should('be.visible');
    cy.get('h1').should('exist');
  });

  it('should have working navigation links - TC8', () => {
    cy.get('a').should('have.length.greaterThan', 0);
  });
});
