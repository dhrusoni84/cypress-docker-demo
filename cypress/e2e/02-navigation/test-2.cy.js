/// <reference types="cypress" />

describe('navigation test suite #2', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io');
  });

  it('should load the page successfully - TC7', () => {
    cy.url().should('include', 'example.cypress.io');
    cy.title().should('not.be.empty');
  });

  it('should display main content - TC7', () => {
    cy.get('body').should('be.visible');
    cy.get('h1').should('exist');
  });

  it('should have working navigation links - TC7', () => {
    cy.get('a').should('have.length.greaterThan', 0);
  });
});
