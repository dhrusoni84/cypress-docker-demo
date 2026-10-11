/// <reference types="cypress" />

describe('responsive test suite #3', () => {
  it('should render on mobile viewport - TC43', () => {
    cy.viewport(375, 667);
    cy.visit('https://example.cypress.io');
    cy.get('body').should('be.visible');
  });

  it('should render on tablet viewport - TC43', () => {
    cy.viewport('ipad-2');
    cy.visit('https://example.cypress.io');
    cy.get('body').should('be.visible');
  });

  it('should render on desktop viewport - TC43', () => {
    cy.viewport(1920, 1080);
    cy.visit('https://example.cypress.io');
    cy.get('body').should('be.visible');
  });
});
