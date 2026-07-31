#!/usr/bin/env node
/**
 * Find — and on request repair — observations that already carry unparsed
 * tool-call text.
 *
 * The write boundary now refuses these bodies, but anything written before the
 * refusal existed is already in every consumer's render. This walks JSONL stores,
 * reports each affected observation with the fragment named, and only edits when
 * asked. Nothing is written without a backup.
 *
 * Usage:
 *   node scripts/scrub-unparsed-call-syntax.mjs <file-or-dir>...          report only
 *   node scripts/scrub-unparsed-call-syntax.mjs <file-or-dir>... --fix    repair, with backup
 *   node scripts/scrub-unparsed-call-syntax.mjs <file-or-dir>... --json   machine-readable report
 *
 * A repair truncates the observation at the point the prose ended, keeping what
 * the caller actually meant to write. An observation left empty is dropped.
 *
 * Requires `npm run build` first — it uses the same detector the server does, so
 * the report and the refusal can never disagree.
 */

import { readFileSync, writeFileSync, statSync, readdirSync, existsSync, copyFileSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const DETECTOR = resolve(HERE, '../dist/src/argument-hygiene.js');

if (!existsSync(DETECTOR)) {
  console.error(`Detector not built: ${DETECTOR}\nRun 'npm run build' first.`);
  process.exit(2);
}

const { findUnparsedCallSyntax } = await import(DETECTOR);

const argv = process.argv.slice(2);
const fix = argv.includes('--fix');
const asJson = argv.includes('--json');
const targets = argv.filter(a => !a.startsWith('--'));

if (targets.length === 0) {
  console.error('Usage: node scripts/scrub-unparsed-call-syntax.mjs <file-or-dir>... [--fix] [--json]');
  process.exit(2);
}

function collectStores(target) {
  const path = resolve(target);
  if (!existsSync(path)) {
    console.error(`⚠️  Not found, skipped: ${path}`);
    return [];
  }
  if (statSync(path).isDirectory()) {
    return readdirSync(path, { withFileTypes: true }).flatMap(entry =>
      entry.isDirectory()
        ? collectStores(join(path, entry.name))
        : entry.name.endsWith('.jsonl') ? [join(path, entry.name)] : []
    );
  }
  return [path];
}

function stamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
}

const findings = [];
let filesChanged = 0;

for (const store of [...new Set(targets.flatMap(collectStores))]) {
  const original = readFileSync(store, 'utf-8');
  const lines = original.split('\n');
  const storeFindings = [];
  let touched = false;

  const repaired = lines.map((line, lineIndex) => {
    if (!line.trim()) return line;

    let record;
    try {
      record = JSON.parse(line);
    } catch {
      return line; // not ours to interpret
    }

    if (!Array.isArray(record.observations)) return line;

    const kept = [];
    let lineTouched = false;

    record.observations.forEach((observation, obsIndex) => {
      if (typeof observation !== 'string') {
        kept.push(observation);
        return;
      }
      const hit = findUnparsedCallSyntax(observation);
      if (!hit) {
        kept.push(observation);
        return;
      }

      const survivor = observation.slice(0, hit.index).trimEnd();
      storeFindings.push({
        file: store,
        line: lineIndex + 1,
        entity: record.name ?? '(unnamed)',
        entityType: record.entityType ?? '(untyped)',
        observation: obsIndex,
        reason: hit.reason,
        fragment: hit.fragment,
        keeps: survivor,
        action: survivor ? 'truncate' : 'drop'
      });

      lineTouched = true;
      if (survivor) kept.push(survivor);
    });

    if (!lineTouched) return line;
    touched = true;
    record.observations = kept;
    return JSON.stringify(record);
  });

  findings.push(...storeFindings);

  if (fix && touched) {
    const backup = `${store}.bak-${stamp()}`;
    copyFileSync(store, backup);
    writeFileSync(store, repaired.join('\n'), 'utf-8');
    filesChanged++;
    if (!asJson) console.log(`\n🔧 ${store}\n   backup → ${backup}`);
  }
}

if (asJson) {
  console.log(JSON.stringify({ mode: fix ? 'fix' : 'report', findings, filesChanged }, null, 2));
  process.exit(findings.length > 0 && !fix ? 1 : 0);
}

if (findings.length === 0) {
  console.log('✅ No unparsed call syntax found.');
  process.exit(0);
}

const byFile = new Map();
for (const finding of findings) {
  if (!byFile.has(finding.file)) byFile.set(finding.file, []);
  byFile.get(finding.file).push(finding);
}

console.log(`\n${fix ? '🔧 Repaired' : '🔍 Found'} ${findings.length} observation(s) carrying unparsed call syntax across ${byFile.size} store(s):\n`);

for (const [file, entries] of byFile) {
  console.log(`${file}`);
  for (const entry of entries) {
    console.log(`  line ${entry.line} · ${entry.entity} (${entry.entityType}) · observations[${entry.observation}]`);
    console.log(`    ${entry.reason}: ${entry.fragment}`);
    console.log(
      entry.action === 'drop'
        ? `    ${fix ? 'dropped' : 'would drop'} — nothing precedes the fragment`
        : `    ${fix ? 'kept' : 'would keep'}: ${entry.keeps.length > 100 ? `${entry.keeps.slice(0, 100)}…` : entry.keeps}`
    );
  }
  console.log('');
}

if (!fix) {
  console.log('Nothing was written. Re-run with --fix to repair (a timestamped backup is made first).');
  process.exit(1);
}

console.log(`✅ ${filesChanged} store(s) rewritten, each with a backup beside it.`);
