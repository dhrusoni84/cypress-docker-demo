const fs = require('fs');
const path = require('path');

const dir = 'cypress/e2e/generated';
fs.mkdirSync(dir, { recursive: true });

const total = 100;
const perSpec = 10;

const checks = [
  ["heading", "cy.get('h1').should('contain.text', 'Kitchen Sink');"],
  ["body visible", "cy.get('body').should('be.visible');"],
  ["page title", "cy.title().should('include', 'Cypress');"],
  ["navigation exists", "cy.get('a').its('length').should('be.greaterThan', 0);"],
  ["type link visible", "cy.contains('type').should('be.visible');"],
  ["hostname", "cy.location('hostname').should('include', 'cypress.io');"],
  ["URL", "cy.url().should('include', 'example.cypress.io');"],
  ["heading exists", "cy.get('h1').should('exist');"],
  ["document loaded", "cy.document().its('readyState').should('equal', 'complete');"],
  ["page content", "cy.get('body').invoke('text').should('not.be.empty');"]
];

for (let batch = 0; batch < total / perSpec; batch++) {
  let code = `describe('Generated batch ${batch + 1}', () => {\n`;

  for (let j = 0; j < perSpec; j++) {
    const n = batch * perSpec + j + 1;
    const [name, assertion] = checks[(n - 1) % checks.length];
    const fail = n % 10 === 0;

    code += `  it('TEST-${String(n).padStart(3, '0')} ${name}${fail ? ' intentional failure' : ''}', () => {\n`;
    code += `    cy.visit('https://example.cypress.io');\n`;

    code += fail
      ? `    cy.get('h1').should('contain.text', 'WRONG_EXPECTED_TEXT_${n}');\n`
      : `    ${assertion}\n`;

    code += `  });\n\n`;
  }

  code += '});\n';

  fs.writeFileSync(
    path.join(dir, `generated-${String(batch + 1).padStart(2, '0')}.cy.js`),
    code
  );
}

console.log('Generated 100 tests across 10 spec files.');
console.log('10 tests intentionally fail; 90 are expected to pass.');
