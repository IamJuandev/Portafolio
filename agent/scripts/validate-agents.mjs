import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { generate } from './generate-agents.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const expected = await generate();
const actual = await readFile(`${root}/AGENTS.md`, 'utf8');

if (actual !== expected) {
  console.error('AGENTS.md is stale. Run: node scripts/generate-agents.mjs');
  process.exitCode = 1;
} else {
  console.log('AGENTS.md is current.');
}
