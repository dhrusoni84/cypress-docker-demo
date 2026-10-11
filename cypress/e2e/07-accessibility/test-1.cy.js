/// <reference types="cypress" />

describe('accessibility test suite #1', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io');
  });

  it('should have alt attributes on images - TC31', () => {
    cy.get('img').each(($img) => {
      cy.wrap($img).should('have.attr', 'alt');
    });
  });

  it('should have proper heading hierarchy - TC31', () => {
    cy.get('h1').should('have.length.greaterThan', 0);
  });

  it('should have accessible form labels - TC31', () => {
    cy.get('input').each(($input) => {
      if ($input.attr('type') !== 'hidden') {
        expect($input.attr('aria-label') || $input.attr('id')).to.exist;
      }
    });
  });
});
