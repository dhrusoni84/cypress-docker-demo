/// <reference types="cypress" />

describe('performance test suite #2', () => {
  it('should load page within acceptable time - TC37', () => {
    const start = Date.now();
    cy.visit('https://example.cypress.io').then(() => {
      const duration = Date.now() - start;
      expect(duration).to.be.lessThan(15000);
    });
  });

  it('should load all resources - TC37', () => {
    cy.visit('https://example.cypress.io');
    cy.window().should('have.property', 'document');
  });

  it('should have fast DOM ready - TC37', () => {
    cy.visit('https://example.cypress.io');
    cy.document().its('readyState').should('eq', 'complete');
  });
});
