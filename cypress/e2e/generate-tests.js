#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const outDir = path.join(process.cwd(), 'cypress', 'e2e', 'generated');
const totalTests = Number(process.env.TOTAL_TESTS || 100);
const testsPerSpec = Number(process.env.TESTS_PER_SPEC || 10);
const failureEvery = Number(process.env.FAILURE_EVERY || 10);

if (!Number.isInteger(totalTests) || totalTests < 1) {
  console.error('TOTAL_TESTS must be a positive integer.');
  process.exit(1);
}
if (!Number.isInteger(testsPerSpec) || testsPerSpec < 1) {
  console.error('TESTS_PER_SPEC must be a positive integer.');
  process.exit(1);
}
if (!Number.isInteger(failureEvery) || failureEvery < 0) {
  console.error('FAILURE_EVERY must be 0 (no intentional failures) or a positive integer.');
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const specCount = Math.ceil(totalTests / testsPerSpec);
for (let specIndex = 0; specIndex < specCount; specIndex++) {
  const start = specIndex * testsPerSpec + 1;
  const end = Math.min(totalTests, start + testsPerSpec - 1);
  const specName = `generated-${String(specIndex + 1).padStart(2, '0')}.cy.js`;
  const lines = [
    `// Auto-generated Cypress test spec: ${specName}`,
    `// Intentionally failing cases are marked in their test titles.`,
    `describe('Generated test batch ${specIndex + 1}', () => {`
  ];

  for (let n = start; n <= end; n++) {
    const shouldFail = failureEvery > 0 && n % failureEvery === 0;
    const title = shouldFail
      ? `TEST-${String(n).padStart(3, '0')} intentional failure for dashboard validation`
      : `TEST-${String(n).padStart(3, '0')} example website heading is visible`;
    lines.push(`  it(${JSON.stringify(title)}, () => {`);
    lines.push(`    cy.visit('https://example.cypress.io');`);
    if (shouldFail) {
      lines.push(`    // Deliberately incorrect assertion to test failure reporting.`);
      lines.push(`    cy.get('h1').should('contain.text', 'THIS_TEXT_DOES_NOT_EXIST_${n}');`);
    } else {
      lines.push(`    cy.get('h1').should('contain.text', 'Kitchen Sink');`);
    }
    lines.push(`  });`);
    lines.push('');
  }
  lines.push('});', '');
  fs.writeFileSync(path.join(outDir, specName), lines.join('\n'), 'utf8');
}

console.log(`Generated ${totalTests} tests across ${specCount} spec files in ${outDir}`);
console.log(`Intentional failures: ${failureEvery > 0 ? Math.floor(totalTests / failureEvery) : 0}`);
console.log('To remove generated tests, delete cypress/e2e/generated/.');
