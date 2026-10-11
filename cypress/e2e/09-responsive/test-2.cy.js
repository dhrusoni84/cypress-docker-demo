/// <reference types="cypress" />

describe('responsive test suite #2', () => {
  it('should render on mobile viewport - TC42', () => {
    cy.viewport(375, 667);
    cy.visit('https://example.cypress.io');
    cy.get('body').should('be.visible');
  });

  it('should render on tablet viewport - TC42', () => {
    cy.viewport('ipad-2');
    cy.visit('https://example.cypress.io');
    cy.get('body').should('be.visible');
  });

  it('should render on desktop viewport - TC42', () => {
    cy.viewport(1920, 1080);
    cy.visit('https://example.cypress.io');
    cy.get('body').should('be.visible');
  });
});
