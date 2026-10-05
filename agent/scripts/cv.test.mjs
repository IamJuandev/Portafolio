import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { buildCvModel, escapeHtml, renderCv } from './generate-cv.mjs';
import { hasSecureCvNewTabLink } from './validate-cv.mjs';

const facts = JSON.parse(await readFile(new URL('../portfolio-facts.json', import.meta.url), 'utf8'));

test('renders canonical identity, contact and CV data as Spanish selectable HTML', () => {
  const html = renderCv(facts);
  const email = facts.contact.find(([label]) => label === 'Email')[1];

  assert.ok(html.includes(escapeHtml(facts.identity.fullName)));
  assert.ok(html.includes(escapeHtml(facts.identity.location)));
  assert.ok(html.includes(escapeHtml(facts.identity.availability)));
  assert.ok(html.includes(escapeHtml(email)));
  assert.ok(html.includes(escapeHtml(facts.cv.experience[0].organization)));
  assert.ok(html.includes(escapeHtml(facts.cv.projects[0].name)));
  assert.ok(html.includes(escapeHtml(facts.cv.education[0].institution)));
  assert.match(html, /<main class="cv"/);
  assert.doesNotMatch(html, /TheDukes|Spring Boot|arquitectura hexagonal/i);
});

test('escapes fact content and keeps contact sourced from canonical facts', () => {
  const altered = structuredClone(facts);
  altered.identity.fullName = '<Juan & Co>';
  altered.contact = altered.contact.map(([label, value]) => label === 'Email'
    ? [label, 'juan+cv@example.com']
    : [label, value]);
  altered.cv.summary = 'Texto <script>alert(1)</script> & seguro';

  const model = buildCvModel(altered);
  const html = renderCv(altered);

  assert.equal(model.email, 'juan+cv@example.com');
  assert.match(html, /&lt;Juan &amp; Co&gt;/);
  assert.match(html, /Texto &lt;script&gt;alert\(1\)&lt;\/script&gt; &amp; seguro/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
});

test('opens the same-origin PDF in a new tab without forcing a download', async () => {
  const page = await readFile(new URL('../../index.html', import.meta.url), 'utf8');

  assert.equal(hasSecureCvNewTabLink(page), true);
  assert.match(
    page,
    /<a class="btn btn--ghost btn--block" href="\.\/assets\/cv\/CV-Juan-Gabriel-Alfonso-Rojas\.pdf" target="_blank" rel="noopener noreferrer">\s*Ver HV\s*<\/a>/,
  );
  assert.doesNotMatch(
    page,
    /<a class="btn btn--ghost btn--block" href="\.\/assets\/cv\/CV-Juan-Gabriel-Alfonso-Rojas\.pdf"[^>]*\sdownload(?:\s|=|>)/,
  );
});

test('validates new-tab security only on the CV PDF anchor', () => {
  const cvAnchor = '<a href="./assets/cv/CV-Juan-Gabriel-Alfonso-Rojas.pdf" target="_blank" rel="noopener noreferrer">Ver HV</a>';

  assert.equal(hasSecureCvNewTabLink(`${cvAnchor}<a href="./other.pdf" download>Otro</a>`), true);
  assert.equal(hasSecureCvNewTabLink(cvAnchor.replace(' rel=', ' download rel=')), false);
  assert.equal(hasSecureCvNewTabLink(cvAnchor.replace('target="_blank"', 'target="_self"')), false);
});
