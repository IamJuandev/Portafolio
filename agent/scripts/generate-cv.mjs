import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../..', import.meta.url));
const factsPath = path.join(root, 'agent/portfolio-facts.json');
const templatePath = path.join(root, 'agent/templates/cv.html');
const outputDirectory = path.join(root, 'assets/cv');
const defaultTemplate = await readFile(templatePath, 'utf8');
export const htmlPath = path.join(outputDirectory, 'CV-Juan-Gabriel-Alfonso-Rojas.html');
export const pdfPath = path.join(outputDirectory, 'CV-Juan-Gabriel-Alfonso-Rojas.pdf');

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function required(value, label) {
  if (!value) throw new Error(`Missing required CV fact: ${label}`);
  return value;
}

export function buildCvModel(facts) {
  const email = facts.contact?.find(([label]) => label === 'Email')?.[1];
  const phone = facts.contact?.find(([label]) => label === 'Phone / WhatsApp')?.[1];
  return {
    name: required(facts.identity?.fullName, 'identity.fullName'),
    location: required(facts.identity?.location, 'identity.location'),
    availability: required(facts.identity?.availability, 'identity.availability'),
    email: required(email, 'contact Email'),
    phone: required(phone, 'contact Phone / WhatsApp'),
    headline: required(facts.cv?.headline, 'cv.headline'),
    summary: required(facts.cv?.summary, 'cv.summary'),
    skills: facts.cv?.skills ?? [],
    experience: facts.cv?.experience ?? [],
    projects: facts.cv?.projects ?? [],
    education: facts.cv?.education ?? [],
    certifications: facts.cv?.certifications,
  };
}

function list(items) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function experienceEntry(entry) {
  return `<article class="entry">
    <div class="entry-head"><div><h3>${escapeHtml(entry.title)} — ${escapeHtml(entry.organization)}</h3></div><div class="period">${escapeHtml(entry.period)}</div></div>
    ${list(entry.bullets)}
  </article>`;
}

export function renderCv(facts, template = defaultTemplate) {
  const model = buildCvModel(facts);
  const pageTemplate = template;
  const content = `<main class="cv">
  <header>
    <h1>${escapeHtml(model.name)}</h1>
    <p class="headline">${escapeHtml(model.headline)}</p>
    <p class="contact">${escapeHtml(model.location)} · ${escapeHtml(model.phone)} · <a href="mailto:${escapeHtml(model.email)}">${escapeHtml(model.email)}</a></p>
    <p class="availability">Disponibilidad: ${escapeHtml(model.availability)}</p>
  </header>
  <section><h2>Perfil profesional</h2><p>${escapeHtml(model.summary)}</p></section>
  <section><h2>Competencias técnicas</h2><dl class="skills">${model.skills.map((skill) => `<div><dt>${escapeHtml(skill.label)}</dt><dd>${escapeHtml(skill.items)}</dd></div>`).join('')}</dl></section>
  <section><h2>Experiencia profesional</h2>${model.experience.map(experienceEntry).join('')}</section>
  <section><h2>Proyectos destacados</h2>${model.projects.map((project) => `<article class="project"><strong>${escapeHtml(project.name)}</strong><br />${escapeHtml(project.description)}</article>`).join('')}</section>
  <section><h2>Formación académica</h2>${model.education.map((entry) => `<article class="entry"><h3>${escapeHtml(entry.title)} — ${escapeHtml(entry.institution)}</h3><p class="education-detail">${escapeHtml(entry.detail)}</p></article>`).join('')}</section>
  <section><h2>Certificaciones</h2><p><strong>${escapeHtml(model.certifications.issuer)}</strong> — ${escapeHtml(model.certifications.summary)}</p></section>
</main>`;
  return pageTemplate
    .replaceAll('{{title}}', escapeHtml(`HV · ${model.name}`))
    .replace('{{content}}', content);
}

function chromeExecutable() {
  return process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
}

export function needsPdfGeneration(existingHtml, pdfExists, html) {
  return !pdfExists || existingHtml !== html;
}

const maxChromeStderrBytes = 64 * 1024;
const chromeTerminationGraceMs = 1_000;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function assertCompletePdf(filePath) {
  const output = await stat(filePath);
  const contents = await readFile(filePath);
  if (output.size <= 0 || !contents.subarray(0, 5).equals(Buffer.from('%PDF-')) || !/%%EOF\s*$/.test(contents.toString('latin1'))) {
    throw new Error('Chrome finished without producing a valid, complete, non-empty CV PDF.');
  }
}

async function terminateChrome(chrome, lifecycle) {
  if (chrome.killed) return;
  chrome.kill('SIGTERM');
  let timeout;
  try {
    await Promise.race([
      lifecycle,
      new Promise((resolve) => { timeout = setTimeout(resolve, chromeTerminationGraceMs); }),
    ]);
  } finally {
    clearTimeout(timeout);
  }
}

export async function createPdf({
  htmlPath: sourceHtmlPath = htmlPath,
  pdfPath: publishedPdfPath = pdfPath,
  chromePath = chromeExecutable(),
  spawnProcess = spawn,
  timeoutMs = 10_000,
} = {}) {
  const profileDirectory = await mkdtemp(path.join(tmpdir(), 'cv-chrome-'));
  const outputDirectory = await mkdtemp(path.join(path.dirname(publishedPdfPath), '.cv-pdf-'));
  const temporaryPdfPath = path.join(outputDirectory, path.basename(publishedPdfPath));
  let chrome;
  let lifecycle;
  let timeout;
  let browserClosed = false;

  try {
    try {
      chrome = spawnProcess(chromePath, [
        '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
        '--disable-background-networking', `--user-data-dir=${profileDirectory}`,
        '--allow-file-access-from-files', '--no-pdf-header-footer', `--print-to-pdf=${temporaryPdfPath}`, sourceHtmlPath,
      ], { stdio: ['ignore', 'ignore', 'pipe'] });
    } catch (error) {
      throw new Error(`Chrome could not start: ${error.message}`, { cause: error });
    }

    let resolveCompletion;
    const printCompleted = new Promise((resolve) => { resolveCompletion = resolve; });
    const completionPattern = new RegExp(`(?:^|\\n)\\d+ bytes written to file ${escapeRegExp(temporaryPdfPath)}(?:\\r?\\n|$)`);
    let stderr = '';
    chrome.stderr?.on('data', (chunk) => {
      stderr = (stderr + chunk.toString()).slice(-maxChromeStderrBytes);
      if (completionPattern.test(stderr)) resolveCompletion({ type: 'print-completed' });
    });
    lifecycle = new Promise((resolve) => {
      chrome.once('error', (error) => resolve({ type: 'error', error }));
      chrome.once('close', (code, signal) => {
        browserClosed = true;
        resolve({ type: 'close', code, signal });
      });
    });
    const timedOut = new Promise((resolve) => {
      timeout = setTimeout(() => resolve({ type: 'timeout' }), timeoutMs);
    });
    const result = await Promise.race([lifecycle, printCompleted, timedOut]);
    if (result.type === 'timeout') throw new Error(`Chrome did not produce the CV PDF within ${timeoutMs}ms.`);
    if (result.type === 'error') throw new Error(`Chrome could not start: ${result.error.message}`, { cause: result.error });
    if (result.type === 'close' && result.code !== 0) {
      throw new Error(`Chrome exited unsuccessfully (code ${result.code ?? 'null'}, signal ${result.signal ?? 'none'}).`);
    }

    await assertCompletePdf(temporaryPdfPath);
    if (result.type === 'print-completed') await terminateChrome(chrome, lifecycle);
    await rename(temporaryPdfPath, publishedPdfPath);
  } finally {
    if (timeout) clearTimeout(timeout);
    if (chrome && !browserClosed) await terminateChrome(chrome, lifecycle);
    await rm(outputDirectory, { recursive: true, force: true });
    await rm(profileDirectory, { recursive: true, force: true });
  }
}

export async function generateCv() {
  const facts = JSON.parse(await readFile(factsPath, 'utf8'));
  const html = renderCv(facts);
  await mkdir(outputDirectory, { recursive: true });
  const existingHtml = await readFile(htmlPath, 'utf8').catch((error) => {
    if (error.code === 'ENOENT') return undefined;
    throw error;
  });
  const pdfExists = await stat(pdfPath)
    .then((output) => output.size > 0)
    .catch((error) => {
      if (error.code === 'ENOENT') return false;
      throw error;
    });
  const pdfGenerated = needsPdfGeneration(existingHtml, pdfExists, html);
  if (pdfGenerated) {
    const renderDirectory = await mkdtemp(path.join(outputDirectory, '.cv-render-'));
    const temporaryHtmlPath = path.join(renderDirectory, path.basename(htmlPath));
    try {
      await writeFile(temporaryHtmlPath, html, 'utf8');
      await createPdf({ htmlPath: temporaryHtmlPath, pdfPath });
      await rename(temporaryHtmlPath, htmlPath);
    } finally {
      await rm(renderDirectory, { recursive: true, force: true });
    }
  }
  return { htmlPath, pdfPath, pdfGenerated };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const outputs = await generateCv();
  console.log(`Generated ${outputs.htmlPath}\n${outputs.pdfGenerated ? 'Generated' : 'Kept current'} ${outputs.pdfPath}`);
}
