import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { auditText, formatReport } from '../scripts/audit.mjs';
import { renderReference, validateCatalog, sourcePath, outputPath } from '../scripts/build-references.mjs';

const catalog = JSON.parse(readFileSync(sourcePath, 'utf8'));
const skill = readFileSync(new URL('../SKILL.md', import.meta.url), 'utf8');
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

test('catalogue retains all 120 distinct FeedHive patterns in nine categories', () => {
  assert.equal(catalog.categories.length, 9);
  assert.equal(validateCatalog(catalog), 120);
  const ids = catalog.categories.flatMap(c => c.patterns.map(p => p.id));
  assert.equal(new Set(ids).size, 120);
  assert.ok(ids.includes('V-01'));
  assert.ok(ids.includes('C-07'));
  assert.ok(ids.includes('B-08'));
  assert.ok(ids.includes('L-15'));
});

test('duplicate and malformed catalogue entries fail validation', () => {
  const copy = structuredClone(catalog);
  copy.categories[0].patterns[1].id = copy.categories[0].patterns[0].id;
  assert.throws(() => validateCatalog(copy), /duplicate/);
  const empty = structuredClone(catalog);
  empty.categories[0].patterns[0].description = '';
  assert.throws(() => validateCatalog(empty), /Invalid/);
});

test('generated reference is reproducible and non-empty', () => {
  const generated = renderReference(catalog);
  assert.equal(generated, readFileSync(outputPath, 'utf8'));
  assert.match(generated, /### V-01 Delve and friends/);
  assert.match(generated, /### L-15 Contrarian template/);
  assert.match(generated, /not an AI-authorship detector/);
});

test('specific clichés and assistant residue are located with line and source ID', () => {
  const text = [
    "It's worth noting that sales grew.",
    'This changes everything.',
    '',
    "Let me know if you'd like more.",
  ].join('\n');
  const result = auditText(text);
  assert.deepEqual(result.findings.map(f => f.id), ['P-01', 'S-09', 'B-03']);
  assert.deepEqual(result.findings.map(f => f.line), [1, 2, 4]);
  assert.equal(result.findings[0].match, "It's worth noting");
  assert.deepEqual(result.clusters[0].patternIds, ['P-01', 'S-09']);
  assert.match(formatReport(result), /1:1 \[P-01\]/);
});

test('legitimate language does not trigger broad word-based false positives', () => {
  const text = [
    'The map key unlocks the cabinet.',
    'The bank used leverage to finance the acquisition.',
    'We quietly closed the door during the interview.',
    'The team wrote three short, accurate sentences.',
    'Which treatment is safest for the patient? We compared the risks.'
  ].join('\n');
  assert.equal(auditText(text).findings.length, 0);
  assert.match(formatReport(auditText(text)), /not a clean bill of health/);
});

test('fenced examples and indented code are not mistaken for manuscript prose', () => {
  const text = [
    'Actual prose.',
    '',
    '~~~text',
    "Let's dive in.",
    '~~~',
    '',
    '    This changes everything.',
    'Good copy with a real example.'
  ].join('\n');
  assert.equal(auditText(text).findings.length, 0);
});

test('plain-language house rule flags an em dash without inferring authorship', () => {
  const result = auditText('The new site—on mobile—works better.');
  assert.deepEqual(result.findings.map(f => f.id), ['F-01', 'F-01']);
  assert.equal(result.clusters.length, 1);
  assert.match(result.note, /do not identify AI authorship/);
});

test('start and ending patterns only trigger in appropriate positions', () => {
  const intro = auditText('Certainly! Here is the draft.\nA second line.');
  assert.ok(intro.findings.some(f => f.id === 'B-01'));
  const middle = auditText('Sales grew last month.\nAbsolutely! It did.\nWe can verify the figures.');
  assert.ok(!middle.findings.some(f => f.id === 'B-01'));
  const ending = auditText('We checked every figure.\nWould you like me to rewrite it?');
  assert.ok(ending.findings.some(f => f.id === 'B-03'));
});

test('findings keep correct line numbers for CRLF and include JSON-compatible fields', () => {
  const report = auditText('Facts first.\r\n\r\nRead that again.');
  assert.equal(report.findings.length, 1);
  assert.equal(report.findings[0].line, 3);
  const result = JSON.parse(JSON.stringify(report));
  assert.equal(result.findings[0].id, 'L-04');
});

test('skill keeps all seven moves, detect mode, voice safety and the full reference', () => {
  assert.match(skill, /## The seven moves/);
  for (let n = 1; n <= 7; n++) {
    assert.match(skill, new RegExp('### ' + n + '\\. '));
  }
  assert.match(skill, /## Never use em dashes/);
  assert.match(skill, /references\/ai-slop-patterns\.md/);
  assert.match(skill, /Detect-only mode: quote, don't rewrite/);
  assert.match(skill, /minimum effective edit/);
  assert.match(readme, /Optional command-line preflight/);
  assert.match(readme, /never estimates whether AI wrote the text/);
});
