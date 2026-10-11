/// <reference types="cypress" />

describe('api test suite #2', () => {
  it('should GET a list of posts - TC17', () => {
    cy.request('GET', 'https://jsonplaceholder.typicode.com/posts')
      .its('status')
      .should('equal', 200);
  });

  it('should GET a single post - TC17', () => {
    cy.request('GET', 'https://jsonplaceholder.typicode.com/posts/17')
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('id', 17);
      });
  });

  it('should POST a new post - TC17', () => {
    cy.request('POST', 'https://jsonplaceholder.typicode.com/posts', {
      title: 'Test 17',
      body: 'Body 17',
      userId: 17
    }).its('status').should('equal', 201);
  });
});
