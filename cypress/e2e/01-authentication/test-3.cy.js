/// <reference types="cypress" />

describe('authentication test suite #3', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io/commands/actions');
  });

  it('should type into input field - TC3', () => {
    cy.get('.action-email')
      .type('test3@example.com')
      .should('have.value', 'test3@example.com');
  });

  it('should clear input field - TC3', () => {
    cy.get('.action-email')
      .type('something')
      .clear()
      .should('have.value', '');
  });

  it('should submit a form - TC3', () => {
    cy.get('.action-form').find('[type="text"]').type('Test3');
    cy.get('.action-form').submit();
    cy.contains('Your form has been submitted!').should('be.visible');
  });
});
