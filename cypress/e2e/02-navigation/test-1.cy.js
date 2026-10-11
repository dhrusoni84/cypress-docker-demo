/// <reference types="cypress" />

describe('navigation test suite #1', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io');
  });

  it('should load the page successfully - TC6', () => {
    cy.url().should('include', 'example.cypress.io');
    cy.title().should('not.be.empty');
  });

  it('should display main content - TC6', () => {
    cy.get('body').should('be.visible');
    cy.get('h1').should('exist');
  });

  it('should have working navigation links - TC6', () => {
    cy.get('a').should('have.length.greaterThan', 0);
  });
});
