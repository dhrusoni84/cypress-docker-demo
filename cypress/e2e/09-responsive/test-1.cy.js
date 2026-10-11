/// <reference types="cypress" />

describe('responsive test suite #1', () => {
  it('should render on mobile viewport - TC41', () => {
    cy.viewport(375, 667);
    cy.visit('https://example.cypress.io');
    cy.get('body').should('be.visible');
  });

  it('should render on tablet viewport - TC41', () => {
    cy.viewport('ipad-2');
    cy.visit('https://example.cypress.io');
    cy.get('body').should('be.visible');
  });

  it('should render on desktop viewport - TC41', () => {
    cy.viewport(1920, 1080);
    cy.visit('https://example.cypress.io');
    cy.get('body').should('be.visible');
  });
});
