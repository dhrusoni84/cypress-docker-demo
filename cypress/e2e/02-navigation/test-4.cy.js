/// <reference types="cypress" />

describe('navigation test suite #4', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io');
  });

  it('should load the page successfully - TC9', () => {
    cy.url().should('include', 'example.cypress.io');
    cy.title().should('not.be.empty');
  });

  it('should display main content - TC9', () => {
    cy.get('body').should('be.visible');
    cy.get('h1').should('exist');
  });

  it('should have working navigation links - TC9', () => {
    cy.get('a').should('have.length.greaterThan', 0);
  });
});
