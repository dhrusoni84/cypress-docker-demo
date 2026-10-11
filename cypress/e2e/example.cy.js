
describe('Demo website tests', () => {
  it('opens the Cypress website', () => {
    cy.visit('https://example.cypress.io')

    cy.contains('Kitchen Sink').should('be.visible')
  })

  it('validates a successful navigation', () => {
    cy.visit('https://example.cypress.io')

    cy.contains('type').click()

    cy.url().should('include', '/commands/actions')
  })
})
