/// <reference types="cypress" />

describe('ecommerce test suite #3', () => {
  beforeEach(() => {
    cy.visit('https://www.saucedemo.com');
  });

  it('should login with valid credentials - TC28', () => {
    cy.get('#user-name').type('standard_user');
    cy.get('#password').type('secret_sauce');
    cy.get('#login-button').click();
    cy.url().should('include', '/inventory.html');
  });

  it('should add item to cart - TC28', () => {
    cy.get('#user-name').type('standard_user');
    cy.get('#password').type('secret_sauce');
    cy.get('#login-button').click();
    cy.get('.inventory_item').first().find('button').click();
    cy.get('.shopping_cart_badge').should('contain', '1');
  });

  it('should show error for invalid login - TC28', () => {
    cy.get('#user-name').type('invalid_user');
    cy.get('#password').type('wrong_pass');
    cy.get('#login-button').click();
    cy.get('[data-test="error"]').should('be.visible');
  });
});
