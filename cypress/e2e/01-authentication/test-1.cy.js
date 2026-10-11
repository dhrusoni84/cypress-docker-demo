/// <reference types="cypress" />

describe('authentication test suite #1', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io/commands/actions');
  });

  it('should type into input field - TC1', () => {
    cy.get('.action-email')
      .type('test1@example.com')
      .should('have.value', 'test1@example.com');
  });

  it('should clear input field - TC1', () => {
    cy.get('.action-email')
      .type('something')
      .clear()
      .should('have.value', '');
  });

  it('should submit a form - TC1', () => {
    cy.get('.action-form').find('[type="text"]').type('Test1');
    cy.get('.action-form').submit();
    cy.contains('Your form has been submitted!').should('be.visible');
  });
});
