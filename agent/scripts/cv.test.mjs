import assert from 'node:assert/strict';
import test from 'node:test';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildCvModel, createPdf, escapeHtml, needsPdfGeneration, renderCv } from './generate-cv.mjs';
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

test('regenerates the PDF only when its rendered HTML changes or it is absent', () => {
  assert.equal(needsPdfGeneration('<html>same</html>', true, '<html>same</html>'), false);
  assert.equal(needsPdfGeneration('<html>old</html>', true, '<html>new</html>'), true);
  assert.equal(needsPdfGeneration('<html>same</html>', false, '<html>same</html>'), true);
});

function fakeChrome(action) {
  const spawnFake = (_executable, args) => {
    const child = new EventEmitter();
    spawnFake.child = child;
    child.stderr = new PassThrough();
    child.killed = false;
    child.kill = () => {
      child.killed = true;
      queueMicrotask(() => child.emit('close', null, 'SIGTERM'));
      return true;
    };
    const outputPath = args.find((arg) => arg.startsWith('--print-to-pdf=')).slice('--print-to-pdf='.length);
    queueMicrotask(async () => {
      if (action === 'success' || action === 'invalid') {
        await writeFile(outputPath, action === 'success' ? '%PDF-fresh-content%%EOF' : 'not a PDF');
        child.emit('close', 0, null);
      } else if (action === 'complete-hang') {
        await writeFile(outputPath, '%PDF-fresh-content%%EOF');
        child.stderr.write(`20607 bytes written to file ${outputPath}\n`);
      } else if (action === 'fresh-no-completion') {
        await writeFile(outputPath, '%PDF-fresh-content%%EOF');
      } else if (action === 'error') child.emit('error', new Error('Chrome is unavailable'));
      else if (action === 'nonzero') child.emit('close', 1, null);
    });
    return child;
  };
  return spawnFake;
}

async function withPdfFixture(run) {
  const directory = await mkdtemp(path.join(tmpdir(), 'cv-pdf-test-'));
  const source = path.join(directory, 'cv.html');
  const published = path.join(directory, 'cv.pdf');
  await writeFile(source, '<p>CV</p>');
  await writeFile(published, '%PDF-old-content');
  try {
    await run({ source, published });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test('creates a fresh PDF before atomically replacing the published artifact', async () => {
  await withPdfFixture(async ({ source, published }) => {
    await createPdf({ htmlPath: source, pdfPath: published, spawnProcess: fakeChrome('success') });
    assert.equal(await readFile(published, 'utf8'), '%PDF-fresh-content%%EOF');
  });
});

test('preserves the old PDF when Chrome is missing or exits unsuccessfully', async () => {
  for (const action of ['error', 'nonzero']) {
    await withPdfFixture(async ({ source, published }) => {
      await assert.rejects(createPdf({ htmlPath: source, pdfPath: published, spawnProcess: fakeChrome(action) }), /Chrome/);
      assert.equal(await readFile(published, 'utf8'), '%PDF-old-content');
    });
  }
});

test('accepts a completed fresh PDF from Chrome that stays running, then terminates it', async () => {
  await withPdfFixture(async ({ source, published }) => {
    const spawnProcess = fakeChrome('complete-hang');
    await createPdf({ htmlPath: source, pdfPath: published, spawnProcess, timeoutMs: 10 });
    assert.equal(await readFile(published, 'utf8'), '%PDF-fresh-content%%EOF');
    assert.equal(spawnProcess.child.killed, true);
  });
});

test('preserves the old PDF when Chrome returns invalid output', async () => {
  await withPdfFixture(async ({ source, published }) => {
    await assert.rejects(createPdf({ htmlPath: source, pdfPath: published, spawnProcess: fakeChrome('invalid') }), /valid, complete/);
    assert.equal(await readFile(published, 'utf8'), '%PDF-old-content');
  });
});

test('does not accept fresh output without a completion signal or natural exit', async () => {
  await withPdfFixture(async ({ source, published }) => {
    await assert.rejects(createPdf({ htmlPath: source, pdfPath: published, spawnProcess: fakeChrome('fresh-no-completion'), timeoutMs: 10 }), /within 10ms/);
    assert.equal(await readFile(published, 'utf8'), '%PDF-old-content');
  });
});

test('times out without replacing the published PDF', async () => {
  await withPdfFixture(async ({ source, published }) => {
    await assert.rejects(createPdf({ htmlPath: source, pdfPath: published, spawnProcess: fakeChrome('hang'), timeoutMs: 10 }), /within 10ms/);
    assert.equal(await readFile(published, 'utf8'), '%PDF-old-content');
  });
});

test('does not accept a recently copied published PDF as new output', async () => {
  await withPdfFixture(async ({ source, published }) => {
    const before = await stat(published);
    await createPdf({ htmlPath: source, pdfPath: published, spawnProcess: fakeChrome('success') });
    assert.equal(await readFile(published, 'utf8'), '%PDF-fresh-content%%EOF');
    assert.ok((await stat(published)).mtimeMs >= before.mtimeMs);
  });
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
