#!/usr/bin/env node
/**
 * Verification: a --memory-path carrying an unexpanded shell variable is refused.
 *
 * On 2026-08-11 a seat booted with MIADI_MINO_STCBOT_TRIAGE_CHART_MEMORY_PATH unset.
 * Its .mcp.json handed this server the placeholder verbatim. The server started
 * happily and wrote a live structural tension chart into a file literally NAMED
 * `${MIADI_MINO_STCBOT_TRIAGE_CHART_MEMORY_PATH}`. Nothing failed; the charts were
 * simply somewhere nobody would look, and another seat auditing the boot found them.
 *
 * Fatal rather than a warning, because of the sibling case: a variable set to a path
 * that does not exist starts the server CLEAN AND EMPTY, and the seat reports its
 * whole store lost. A store is the one input where "start anyway" is never kind.
 */

import { spawnSync } from 'child_process';
import { mkdtempSync, rmSync, readdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const ENTRY = resolve(fileURLToPath(new URL('.', import.meta.url)), 'dist/index.js');

let passed = 0;
let failed = 0;

function check(label, condition, detail) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

const dir = mkdtempSync(join(tmpdir(), 'coaia-envvar-'));

function start(memoryPath) {
  // The server speaks MCP on stdio and would block; an empty stdin closes it.
  return spawnSync(process.execPath, [ENTRY, '--memory-path', memoryPath], {
    cwd: dir,
    input: '',
    encoding: 'utf8',
    timeout: 20000,
    env: { ...process.env, COAIA_TOOLS: 'STC_TOOLS' },
  });
}

try {
  console.log('\n📋 an unexpanded shell variable in --memory-path is fatal');

  const r = start('${MIADI_MINO_STCBOT_TRIAGE_CHART_MEMORY_PATH}');
  check('exits non-zero', r.status === 1, `status=${r.status}`);
  check('says what it refused and why',
    /unexpanded shell variable/i.test(r.stderr || ''), (r.stderr || '').slice(0, 200));
  check('echoes the offending value back',
    (r.stderr || '').includes('MIADI_MINO_STCBOT_TRIAGE_CHART_MEMORY_PATH'),
    (r.stderr || '').slice(0, 200));
  check('promises nothing was touched',
    /no store was touched/i.test(r.stderr || ''), (r.stderr || '').slice(0, 200));

  const stray = readdirSync(dir).filter((f) => f.includes('${'));
  check('creates NO literally-named file — the whole point',
    stray.length === 0, `found: ${stray.join(', ')}`);

  console.log('\n📋 a bare $ in a filename is still legal, and a real path still starts');

  const dollar = join(dir, 'my$charts.jsonl');
  writeFileSync(dollar, '');
  const ok = start(dollar);
  check('a path containing $ but no ${ is not refused',
    !/unexpanded shell variable/i.test(ok.stderr || ''), (ok.stderr || '').slice(0, 160));

  const rel = start('charts.jsonl');
  check('a relative path is not refused',
    !/unexpanded shell variable/i.test(rel.stderr || ''), (rel.stderr || '').slice(0, 160));
} finally {
  rmSync(dir, { recursive: true, force: true });
}

console.log(`\n${failed === 0 ? '✅' : '❌'} ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
