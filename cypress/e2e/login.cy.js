describe('Login page checks', () => {
  it('loads the example website', () => {
    cy.visit('/');
    cy.contains('Kitchen Sink').should('be.visible');
  });
});