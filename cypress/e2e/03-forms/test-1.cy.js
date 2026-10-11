/// <reference types="cypress" />

describe('forms test suite #1', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io/commands/actions');
  });

  it('should type into input field - TC11', () => {
    cy.get('.action-email')
      .type('test11@example.com')
      .should('have.value', 'test11@example.com');
  });

  it('should clear input field - TC11', () => {
    cy.get('.action-email')
      .type('something')
      .clear()
      .should('have.value', '');
  });

  it('should submit a form - TC11', () => {
    cy.get('.action-form').find('[type="text"]').type('Test11');
    cy.get('.action-form').submit();
    cy.contains('Your form has been submitted!').should('be.visible');
  });
});
