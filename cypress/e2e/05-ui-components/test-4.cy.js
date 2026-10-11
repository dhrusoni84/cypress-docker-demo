/// <reference types="cypress" />

describe('ui-components test suite #4', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io/commands/querying');
  });

  it('should find element by selector - TC24', () => {
    cy.get('#query-btn').should('contain', 'Button');
  });

  it('should check element visibility - TC24', () => {
    cy.get('.query-list').should('be.visible');
  });

  it('should verify element attributes - TC24', () => {
    cy.get('#query-btn').should('have.attr', 'id', 'query-btn');
  });
});
