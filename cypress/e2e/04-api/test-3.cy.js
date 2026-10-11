/// <reference types="cypress" />

describe('api test suite #3', () => {
  it('should GET a list of posts - TC18', () => {
    cy.request('GET', 'https://jsonplaceholder.typicode.com/posts')
      .its('status')
      .should('equal', 200);
  });

  it('should GET a single post - TC18', () => {
    cy.request('GET', 'https://jsonplaceholder.typicode.com/posts/18')
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('id', 18);
      });
  });

  it('should POST a new post - TC18', () => {
    cy.request('POST', 'https://jsonplaceholder.typicode.com/posts', {
      title: 'Test 18',
      body: 'Body 18',
      userId: 18
    }).its('status').should('equal', 201);
  });
});
