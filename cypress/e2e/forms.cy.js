describe('Form interaction checks', () => {
  it('opens the actions page', () => {
    cy.visit('/');
    cy.contains('type').click();
    cy.url().should('include', '/commands/actions');
  });
});