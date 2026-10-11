/// <reference types="cypress" />

describe('responsive test suite #5', () => {
  it('should render on mobile viewport - TC45', () => {
    cy.viewport(375, 667);
    cy.visit('https://example.cypress.io');
    cy.get('body').should('be.visible');
  });

  it('should render on tablet viewport - TC45', () => {
    cy.viewport('ipad-2');
    cy.visit('https://example.cypress.io');
    cy.get('body').should('be.visible');
  });

  it('should render on desktop viewport - TC45', () => {
    cy.viewport(1920, 1080);
    cy.visit('https://example.cypress.io');
    cy.get('body').should('be.visible');
  });
});
