import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const workflow = await readFile(new URL('../../.github/workflows/generate-cv.yml', import.meta.url), 'utf8');

test('CV generation workflow has the narrow master trigger and manual dispatch', () => {
  assert.match(workflow, /push:\s*\n\s+branches: \[master\]/);
  assert.match(workflow, /workflow_dispatch:/);
  for (const path of [
    'agent/portfolio-facts.json',
    'agent/templates/cv.html',
    'agent/scripts/generate-cv.mjs',
    'agent/scripts/validate-cv.mjs',
    'agent/scripts/cv.test.mjs',
    'agent/scripts/cv-workflow.test.mjs',
    'agent/scripts/generate-agents.mjs',
    'agent/scripts/validate-agents.mjs',
    '.github/workflows/generate-cv.yml',
  ]) {
    assert.ok(workflow.includes(`'${path}'`), `missing narrow trigger path: ${path}`);
  }
});

test('CV generation workflow verifies, commits narrowly, and explicitly builds legacy Pages', () => {
  for (const command of [
    'node --test agent/scripts/cv.test.mjs agent/scripts/cv-workflow.test.mjs',
    'node agent/scripts/generate-agents.mjs',
    'node agent/scripts/validate-agents.mjs',
    'node agent/scripts/generate-cv.mjs',
    'node agent/scripts/validate-cv.mjs',
  ]) assert.ok(workflow.includes(command), `missing command: ${command}`);

  assert.match(workflow, /CHROME_BIN="\$\(command -v google-chrome\)"/);
  assert.match(workflow, /sudo apt-get update/);
  assert.match(workflow, /sudo apt-get install -y poppler-utils/);
  assert.match(workflow, /pdftotext -v/);
  assert.match(workflow, /git add -- agent\/AGENTS\.md assets\/cv\/CV-Juan-Gabriel-Alfonso-Rojas\.html assets\/cv\/CV-Juan-Gabriel-Alfonso-Rojas\.pdf/);
  assert.match(workflow, /git push origin HEAD:master/);
  assert.doesNotMatch(workflow, /--force|git rebase/);
  assert.ok(workflow.includes('--request POST'));
  assert.ok(workflow.includes('/pages/builds'));
  assert.match(workflow, /contents: write/);
  assert.match(workflow, /pages: write/);
});
