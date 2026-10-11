/// <reference types="cypress" />

describe('api test suite #4', () => {
  it('should GET a list of posts - TC19', () => {
    cy.request('GET', 'https://jsonplaceholder.typicode.com/posts')
      .its('status')
      .should('equal', 200);
  });

  it('should GET a single post - TC19', () => {
    cy.request('GET', 'https://jsonplaceholder.typicode.com/posts/19')
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('id', 19);
      });
  });

  it('should POST a new post - TC19', () => {
    cy.request('POST', 'https://jsonplaceholder.typicode.com/posts', {
      title: 'Test 19',
      body: 'Body 19',
      userId: 19
    }).its('status').should('equal', 201);
  });
});
