#!/usr/bin/env node
/**
 * Conservative, deterministic preflight for unambiguous surface patterns.
 * The full 120-pattern review is editorial and belongs to the agent skill.
 * This tool never labels writing as AI-generated or invents a quality score.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const catalog = JSON.parse(readFileSync(new URL('../patterns/ai-slop.json', import.meta.url), 'utf8'));
const entries = catalog.categories.flatMap(category =>
  category.patterns.map(pattern => ({ ...pattern, category: category.name }))
);
const byId = new Map(entries.map(pattern => [pattern.id, pattern]));

// Conservative recognisers only. No contextual, rhetorical or structural
// rules here: they require an editor, not a regex. Never match vague words
// such as "key", "quietly", "landscape" or "leverage" in isolation.
const RULES = [
  { id: 'V-01', re: /\bdelv(?:e|es|ed|ing)\b/gi },
  { id: 'V-03', re: /\b(?:a testament to|a beacon of)\b/gi },
  { id: 'V-07', re: /\butiliz(?:e|es|ed|ing|ation)\b/gi },
  { id: 'V-14', re: /\bgame[ -]changer\b/gi },
  { id: 'P-01', re: /\b(?:it['’]s worth noting|it is worth noting|it['’]s important to note|it should be noted)\b/gi },
  { id: 'P-02', re: /\bat its core\b/gi },
  { id: 'P-04', re: /\blet['’]s dive in\b/gi },
  { id: 'P-07', re: /\bnavigat(?:e|ing) the complexit(?:y|ies)\b/gi },
  { id: 'P-09', re: /\blook no further\b/gi },
  { id: 'P-10', re: /\bunlock the power\b/gi },
  { id: 'P-11', re: /\bhere['’]s the thing\b/gi },
  { id: 'S-06', re: /\b(?:the obvious question is|you might be wondering)\b/gi },
  { id: 'S-08', re: /\b(?:what nobody tells you|the part most people miss|here['’]s what most get wrong)\b/gi },
  { id: 'S-09', re: /\b(?:this is where it gets interesting|this changes everything|that['’]s where things get wild)\b/gi },
  { id: 'S-10', re: /\b(?:the useful part is|the best part is)\b/gi },
  { id: 'S-17', re: /\b(?:imagine a world where|what if i told you)\b/gi },
  { id: 'C-02', re: /\b(?:experts agree|studies show|it is widely regarded)\b/gi },
  { id: 'F-01', re: /—/g }, // An existing Plain Language Editor house rule.
  { id: 'F-03', re: /^\s*(?:✅|🚀|💡|👉)\s*/gu },
  { id: 'B-01', re: /^\s*(?:certainly|absolutely|of course|great question)\s*[!.]/gi, start: true },
  { id: 'B-03', re: /\b(?:let me know if you['’]d like|would you like me to)\b/gi, end: true },
  { id: 'B-04', re: /^\s*here (?:is|['’]s) (?:a |the )?(?:polished |revised |updated )?(?:version|draft|post|reply)\b/gi, start: true },
  { id: 'B-05', re: /\[(?:your name|company|insert [^\]]{2,80})\]|\bXX%/gi },
  { id: 'B-06', re: /\bas an AI(?: language model)?\b/gi },
  { id: 'B-08', re: /\b(?:contentReference|oaicite|turn\d+(?:search|news|fetch|file)\d+)\b/gi },
  { id: 'L-03', re: /\bi['’]m (?:thrilled|excited|humbled|proud) to (?:announce|share)\b/gi },
  { id: 'L-04', re: /\b(?:read that again|let that sink in|i['’]ll say it louder)\b/gi },
  { id: 'L-10', re: /\bthat['’]s it[.!]?\s+that['’]s the (?:post|tweet)\b/gi },
  { id: 'L-12', re: /\b(?:no fluff,? just value|straight to the point|real talk)\b/gi }
];
for (const rule of RULES) {
  if (!byId.has(rule.id)) throw new Error('Unknown FeedHive pattern ID: ' + rule.id);
}

function proseLine(line) {
  // Exclude fenced code and indented code. Don't strip quotations: the
  // author may specifically ask to audit quoted marketing copy.
  return line.trim() !== '' && !/^(?: {4}|\t)/.test(line);
}

export function auditText(text) {
  if (typeof text !== 'string') throw new TypeError('Expected plain text');
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const eligible = [];
  let fence = null;
  let paragraph = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const marker = line.match(/^\s*(\x60{3,}|~{3,})/);
    if (marker) {
      const type = marker[1][0];
      if (!fence) fence = type;
      else if (fence === type) fence = null;
      paragraph++;
      continue;
    }
    if (fence || !proseLine(line)) {
      if (!fence) paragraph++;
      continue;
    }
    if (/^\s*(?:#{1,6}\s+|[-*+]\s+|\d+\.\s+)/.test(line)) paragraph++;
    eligible.push({ line, lineNumber: i + 1, paragraph });
  }
  const first = eligible[0]?.lineNumber;
  const last = eligible.at(-1)?.lineNumber;
  const findings = [];
  for (const { line, lineNumber, paragraph: group } of eligible) {
    for (const rule of RULES) {
      if (rule.start && lineNumber !== first) continue;
      if (rule.end && lineNumber < last - 2) continue;
      rule.re.lastIndex = 0;
      for (const match of line.matchAll(rule.re)) {
        const info = byId.get(rule.id);
        findings.push({
          id: rule.id,
          category: info.category,
          name: info.name,
          line: lineNumber,
          column: match.index + 1,
          match: match[0],
          excerpt: line.trim(),
          guidance: info.better ?? info.description,
          paragraph: group
        });
      }
    }
  }
  findings.sort((a, b) => a.line - b.line || a.column - b.column || a.id.localeCompare(b.id));
  const grouped = new Map();
  for (const f of findings) {
    if (!grouped.has(f.paragraph)) grouped.set(f.paragraph, []);
    grouped.get(f.paragraph).push(f);
  }
  const clusters = [...grouped.values()]
    .filter(group => group.length >= 2)
    .map(group => ({
      startLine: Math.min(...group.map(f => f.line)),
      endLine: Math.max(...group.map(f => f.line)),
      patternIds: [...new Set(group.map(f => f.id))]
    }));
  return { findings, clusters, note: 'Conservative surface preflight only. The full 120-pattern review requires editorial judgement; findings do not identify AI authorship.' };
}

export function formatReport(report) {
  if (!report.findings.length) {
    return 'No high-confidence surface matches. This is not a clean bill of health: run the full editorial review.';
  }
  const lines = [
    report.findings.length + ' possible surface match(es); human review required. No AI-authorship inference.',
    ''
  ];
  for (const f of report.findings) {
    lines.push(f.line + ':' + f.column + ' [' + f.id + '] ' + f.name + ': ' + JSON.stringify(f.match));
    lines.push('  ' + f.excerpt);
  }
  if (report.clusters.length) {
    lines.push('', 'Clusters to review first:');
    for (const c of report.clusters) {
      lines.push('  Lines ' + c.startLine + '-' + c.endLine + ': ' + c.patternIds.join(', '));
    }
  }
  lines.push('', report.note);
  return lines.join('\n');
}

function main(args) {
  if (args.includes('--help') || (!args.includes('--stdin') && !args.some(arg => !arg.startsWith('-')))) {
    console.log('Usage: node scripts/audit.mjs <draft.txt|draft.md> [--json]');
    console.log('       node scripts/audit.mjs --stdin [--json]');
    return;
  }
  const file = args.find(arg => !arg.startsWith('-'));
  const text = readFileSync(file ?? 0, 'utf8');
  const report = auditText(text);
  console.log(args.includes('--json') ? JSON.stringify(report, null, 2) : formatReport(report));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2));
}
