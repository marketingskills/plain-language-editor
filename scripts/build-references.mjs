import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const sourcePath = join(root, 'patterns', 'ai-slop.json');
export const outputPath = join(root, 'references', 'ai-slop-patterns.md');

export function validateCatalog(data) {
  if (!data || !Array.isArray(data.categories) || data.categories.length === 0) {
    throw new Error('Pattern catalogue must contain categories');
  }
  const seenIds = new Set();
  const seenCategories = new Set();
  for (const category of data.categories) {
    if (typeof category.id !== 'string' || !/^[a-z-]+$/.test(category.id) ||
        !category.name || !Array.isArray(category.patterns) ||
        category.patterns.length === 0 || seenCategories.has(category.id)) {
      throw new Error('Invalid or duplicate category: ' + String(category.id));
    }
    seenCategories.add(category.id);
    for (const pattern of category.patterns) {
      if (!/^[A-Z]-[0-9]{2}$/.test(pattern.id ?? '') ||
          seenIds.has(pattern.id) ||
          typeof pattern.name !== 'string' || !pattern.name.trim() ||
          typeof pattern.description !== 'string' || !pattern.description.trim() ||
          (pattern.bad != null && typeof pattern.bad !== 'string') ||
          (pattern.better != null && typeof pattern.better !== 'string')) {
        throw new Error('Invalid or duplicate pattern: ' + String(pattern.id));
      }
      seenIds.add(pattern.id);
    }
  }
  return seenIds.size;
}

export function renderReference(data) {
  const count = validateCatalog(data);
  const lines = [
    '# AI-slop pattern reference',
    '',
    'Adapted from FeedHive/ai-slop-detector (MIT). See patterns/SOURCE.md for the pinned source and attribution.',
    '',
    'This is an editorial checklist, not an AI-authorship detector or a list of automatic bans.',
    'A single pattern may be appropriate. Focus on repeated, distracting patterns and preserve meaning, evidence and the author\'s voice.',
    'Do not invent examples, numbers or evidence just to fix a pattern. Treat suggestions as examples, not replacements to copy verbatim.',
    '',
    count + ' patterns across ' + data.categories.length + ' categories.',
    ''
  ];
  for (const category of data.categories) {
    lines.push('## ' + category.name, '', category.intro ?? '', '');
    for (const p of category.patterns) {
      lines.push('### ' + p.id + ' ' + p.name, '', p.description, '');
      if (p.bad) lines.push('**Example to check:** ' + p.bad, '');
      if (p.better) lines.push('**Example improvement:** ' + p.better, '');
    }
  }
  return lines.join('\n').replace(/\n+$/, '\n');
}

export function main(argv = process.argv.slice(2)) {
  const data = JSON.parse(readFileSync(sourcePath, 'utf8'));
  const generated = renderReference(data);
  if (argv.includes('--check')) {
    const actual = readFileSync(outputPath, 'utf8');
    if (actual !== generated) {
      console.error('Out-of-date reference. Run: node scripts/build-references.mjs');
      process.exitCode = 1;
    } else {
      console.log('Reference matches ' + validateCatalog(data) + ' source patterns.');
    }
  } else {
    writeFileSync(outputPath, generated);
    console.log('Generated reference with ' + validateCatalog(data) + ' patterns.');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main();
}
