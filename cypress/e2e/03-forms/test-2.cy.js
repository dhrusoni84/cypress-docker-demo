/// <reference types="cypress" />

describe('forms test suite #2', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io/commands/actions');
  });

  it('should type into input field - TC12', () => {
    cy.get('.action-email')
      .type('test12@example.com')
      .should('have.value', 'test12@example.com');
  });

  it('should clear input field - TC12', () => {
    cy.get('.action-email')
      .type('something')
      .clear()
      .should('have.value', '');
  });

  it('should submit a form - TC12', () => {
    cy.get('.action-form').find('[type="text"]').type('Test12');
    cy.get('.action-form').submit();
    cy.contains('Your form has been submitted!').should('be.visible');
  });
});
