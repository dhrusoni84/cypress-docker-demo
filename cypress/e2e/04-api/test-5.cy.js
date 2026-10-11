/// <reference types="cypress" />

describe('api test suite #5', () => {
  it('should GET a list of posts - TC20', () => {
    cy.request('GET', 'https://jsonplaceholder.typicode.com/posts')
      .its('status')
      .should('equal', 200);
  });

  it('should GET a single post - TC20', () => {
    cy.request('GET', 'https://jsonplaceholder.typicode.com/posts/20')
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('id', 20);
      });
  });

  it('should POST a new post - TC20', () => {
    cy.request('POST', 'https://jsonplaceholder.typicode.com/posts', {
      title: 'Test 20',
      body: 'Body 20',
      userId: 20
    }).its('status').should('equal', 201);
  });
});
