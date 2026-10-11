/// <reference types="cypress" />

describe('api test suite #1', () => {
  it('should GET a list of posts - TC16', () => {
    cy.request('GET', 'https://jsonplaceholder.typicode.com/posts')
      .its('status')
      .should('equal', 200);
  });

  it('should GET a single post - TC16', () => {
    cy.request('GET', 'https://jsonplaceholder.typicode.com/posts/16')
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('id', 16);
      });
  });

  it('should POST a new post - TC16', () => {
    cy.request('POST', 'https://jsonplaceholder.typicode.com/posts', {
      title: 'Test 16',
      body: 'Body 16',
      userId: 16
    }).its('status').should('equal', 201);
  });
});
