/// <reference types="cypress" />

describe('ui-components test suite #3', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io/commands/querying');
  });

  it('should find element by selector - TC23', () => {
    cy.get('#query-btn').should('contain', 'Button');
  });

  it('should check element visibility - TC23', () => {
    cy.get('.query-list').should('be.visible');
  });

  it('should verify element attributes - TC23', () => {
    cy.get('#query-btn').should('have.attr', 'id', 'query-btn');
  });
});
