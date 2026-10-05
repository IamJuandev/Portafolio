import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import path from 'node:path';
import { renderCv } from './generate-cv.mjs';

const execFileAsync = promisify(execFile);
function normalize(text) {
  return text.normalize('NFC').replaceAll(/\s+/g, ' ').trim();
}

function requireText(text, value, label) {
  if (!normalize(text).includes(normalize(value))) {
    throw new Error(`Missing ${label}: ${value}`);
  }
}

export function hasSecureCvNewTabLink(index) {
  const anchor = index.match(/<a\b[^>]*\bhref=(['"])\.\/assets\/cv\/CV-Juan-Gabriel-Alfonso-Rojas\.pdf\1[^>]*>/i)?.[0];
  return Boolean(
    anchor
      && /\btarget=(['"])_blank\1/i.test(anchor)
      && /\brel=(['"])noopener\s+noreferrer\1/i.test(anchor)
      && !/\sdownload(?:\s|=|>)/i.test(anchor),
  );
}

function validateFactReferences(facts) {
  for (const role of facts.cv.experience) {
    const years = role.period.match(/\d{4}/g) ?? [];
    const roleTerms = role.title.toLowerCase().split(/[^\p{L}]+/u).filter((term) => term.length > 4);
    const source = facts.experience.find((entry) => years.every((year) => entry.period.includes(year))
      && roleTerms.every((term) => entry.title.toLowerCase().includes(term)));
    const organizationMatches = source?.title.includes(role.organization)
      || (role.organization === 'Independiente' && source?.period.includes('independent'));
    if (!source || !organizationMatches) {
      throw new Error(`CV experience is not backed by canonical facts: ${role.title}`);
    }
  }
  for (const project of facts.cv.projects) {
    if (!facts.projects.some((entry) => entry.name === project.name)) {
      throw new Error(`CV project is not backed by canonical facts: ${project.name}`);
    }
  }
  for (const education of facts.cv.education) {
    const source = facts.education.find((entry) => entry.includes(education.institution) && entry.includes(education.title));
    const years = education.detail.match(/\d{4}/g) ?? [];
    if (!source || !years.every((year) => source.includes(year))) {
      throw new Error(`CV education is not backed by canonical facts: ${education.title}`);
    }
  }
}

async function validateCv() {
  const root = fileURLToPath(new URL('../..', import.meta.url));
  const facts = JSON.parse(await readFile(path.join(root, 'agent/portfolio-facts.json'), 'utf8'));
  const htmlPath = path.join(root, 'assets/cv/CV-Juan-Gabriel-Alfonso-Rojas.html');
  const pdfPath = path.join(root, 'assets/cv/CV-Juan-Gabriel-Alfonso-Rojas.pdf');
  const indexPath = path.join(root, 'index.html');
  const email = facts.contact.find(([label]) => label === 'Email')?.[1];
  const html = await readFile(htmlPath, 'utf8');
  const expectedHtml = renderCv(facts);
  const index = await readFile(indexPath, 'utf8');
  const { stdout: pdfText } = await execFileAsync(process.env.PDFTOTEXT_BIN || 'pdftotext', [pdfPath, '-']);
  const requiredPdfText = [
    [facts.identity.fullName, 'canonical name'],
    [facts.identity.location, 'canonical location'],
    [facts.identity.availability, 'canonical availability'],
    [email, 'canonical email'],
    ...facts.cv.experience.map((entry) => [entry.organization, `experience ${entry.organization}`]),
    ...facts.cv.projects.map((entry) => [entry.name, `project ${entry.name}`]),
    ...facts.cv.education.map((entry) => [entry.institution, `education ${entry.institution}`]),
  ];

  validateFactReferences(facts);
  if (html !== expectedHtml) throw new Error('CV HTML is stale. Run: node agent/scripts/generate-cv.mjs');
  for (const [value, label] of requiredPdfText) requireText(pdfText, value, label);
  for (const forbidden of ['TheDukes', 'Spring Boot', 'arquitectura hexagonal']) {
    if (new RegExp(forbidden, 'i').test(pdfText)) throw new Error(`Forbidden CV claim: ${forbidden}`);
  }
  if (!hasSecureCvNewTabLink(index)) {
    throw new Error('Portfolio CV link must open the same-origin PDF in a secure new tab without forcing a download.');
  }
  requireText(index, facts.identity.availability, 'portfolio availability');

  const pages = pdfText.split('\f').filter((page) => page.trim()).length;
  console.log(`CV is current and validated (${pages} PDF page${pages === 1 ? '' : 's'}).`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await validateCv();
}
