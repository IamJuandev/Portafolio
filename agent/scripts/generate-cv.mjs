import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';
import path from 'node:path';

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
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

async function createPdf() {
  const profileDirectory = await mkdtemp(path.join(tmpdir(), 'cv-chrome-'));
  const generatedAfter = Date.now() - 1_000;
  const chrome = spawn(chromeExecutable(), [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--disable-background-networking', `--user-data-dir=${profileDirectory}`,
    '--allow-file-access-from-files', '--no-pdf-header-footer', `--print-to-pdf=${pdfPath}`, htmlPath,
  ], { stdio: 'ignore' });

  try {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      await wait(100);
      try {
        const output = await stat(pdfPath);
        if (output.size > 0 && output.mtimeMs >= generatedAfter) return;
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
    throw new Error('Chrome did not produce the CV PDF within 10 seconds.');
  } finally {
    if (!chrome.killed) chrome.kill('SIGTERM');
    await Promise.race([once(chrome, 'close'), wait(2_000)]);
    await rm(profileDirectory, { recursive: true, force: true });
  }
}

export async function generateCv() {
  const facts = JSON.parse(await readFile(factsPath, 'utf8'));
  const html = renderCv(facts);
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(htmlPath, html, 'utf8');
  await createPdf();
  return { htmlPath, pdfPath };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const outputs = await generateCv();
  console.log(`Generated ${outputs.htmlPath}\nGenerated ${outputs.pdfPath}`);
}
