describe('Validation checks', () => {
  it('displays the expected page heading', () => {
    cy.visit('/');
    cy.get('h1').should('contain.text', 'Kitchen Sink');
  });
});