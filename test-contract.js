/**
 * Contract tests — the read contract stays true to what this package writes.
 *
 * The point of exporting a contract is that renderers stop re-deriving the store's
 * shape by hand. That only helps if the contract cannot quietly fall behind the writer,
 * so the sharpest tests here are not "does the parser work" — they are:
 *
 *   - the SOURCE SCAN: every entityType literal anywhere in this package must be a value
 *     the contract publishes, and any DYNAMIC entityType write is a loud failure;
 *   - the ENUM SCAN: the MMOT phase list must match tool-definitions.ts;
 *   - the AGREEMENT test: parseStore must classify exactly like the writer's own parser;
 *   - the RESOLUTION test: the exports map must not break CommonJS deep imports.
 *
 * The first draft of this suite passed while the contract lost 3 real records on a live
 * store. Assertions that cannot fail are worse than no assertions, because they read as
 * coverage. Several checks below are written to fail loudly on the specific mistakes
 * that draft made.
 */

import { KnowledgeGraphManager } from './dist/src/graph-manager.js';
import { parseJsonlMemory } from './dist/src/jsonl-preservation.js';
import * as C from './dist/src/contract.js';
import { readFileSync, writeFileSync, unlinkSync, readdirSync, statSync, existsSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let passed = 0;
let failed = 0;

function check(label, cond, detail) {
  if (cond) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

// Temp dir, not the repo root: a SIGKILL must not leave an untracked file behind.
const store = path.join(tmpdir(), `coaia-contract-${process.pid}.jsonl`);
writeFileSync(store, '');

try {
  // -------------------------------------------------------------------------
  console.log('\n📋 the contract describes a real store this package just wrote');
  // -------------------------------------------------------------------------
  const mgr = new KnowledgeGraphManager(store);
  const { chartId } = await mgr.createStructuralTensionChart(
    'The contract is importable and true',
    'Readers re-derive the shape by hand',
    '2026-08-09',
    ['Flat step A', 'Flat step B'],
    [{ description: 'shape has one owner', type: 'DESIGN' }],
  );
  await mgr.performMmotEvaluation(
    chartId, 'acknowledge', 'An assessment that must survive the round trip',
    'North', undefined, true,
  );
  const added = await mgr.addActionStep(chartId, 'Added later', 'Not started', '2026-08-08');

  const parsed = C.parseStore(readFileSync(store, 'utf8'));
  const chart = C.getChartEntity(parsed, chartId);
  check('getChartEntity found the chart by the contract naming scheme', !!chart);
  check('getDesiredOutcome found it', !!C.getDesiredOutcome(parsed, chartId));
  check('getCurrentReality found it', !!C.getCurrentReality(parsed, chartId));
  check('parseStore reported no skipped lines on a clean store', parsed.skipped === 0,
    `skipped=${parsed.skipped}`);

  // -------------------------------------------------------------------------
  console.log('\n📋 getWork sees telescoped work, not only flat steps');
  // -------------------------------------------------------------------------
  // add_action_step does NOT write an action_step entity — it creates a telescoped child
  // chart. A selector that only collects action_step entities is blind to most real work.
  check('addActionStep returned something', !!added);
  const flat = C.getFlatActionSteps(parsed, chartId);
  check('the two creation-time steps are flat action_step entities', flat.length === 2,
    `got ${flat.length}`);
  const work = C.getWork(parsed, chartId);
  const titles = work.map((w) => w.title);
  check('getWork includes both flat steps', titles.includes('Flat step A') && titles.includes('Flat step B'));
  check('getWork includes the telescoped step add_action_step created',
    titles.some((t) => t.includes('Added later')), `titles=${JSON.stringify(titles)}`);
  check('getWork is strictly larger than the flat list here', work.length > flat.length,
    `work=${work.length} flat=${flat.length}`);
  check('the telescoped item is flagged as such',
    work.find((w) => String(w.title).includes('Added later'))?.telescoped === true);
  check('isComplete reads completionStatus', C.isComplete(flat[0]) === false);

  // -------------------------------------------------------------------------
  console.log('\n📋 MMOT trail and beats');
  // -------------------------------------------------------------------------
  const evals = C.getMmotEvaluations(chart);
  check('getMmotEvaluations read the trail', evals.length === 1, `got ${evals.length}`);
  check('the assessment survived intact',
    evals[0]?.assessment === 'An assessment that must survive the round trip');
  check('isMmotPhase accepts the stored phase', C.isMmotPhase(evals[0]?.phase),
    `phase=${evals[0]?.phase}`);
  check("isMmotPhase accepts 'full', the writer's default", C.isMmotPhase('full'));
  check('isMmotPhase rejects a non-phase', !C.isMmotPhase('acknowledgement'));
  check('getMmotBeats found the emitted beat',
    C.getMmotBeats(parsed, chartId).length === 1);

  // -------------------------------------------------------------------------
  console.log('\n📋 AGREEMENT: parseStore classifies exactly like the writer');
  // -------------------------------------------------------------------------
  // The first draft diverged here by 3 records on a live store while every other test
  // passed. Compared against the writer's own parser on real corpora.
  // NOTE: example.jsonl is deliberately NOT in this list. It uses a nested
  // {"type":"entity","data":{...}} wrapper that neither the writer's parser nor this
  // contract reads — a stale documentation artefact in a format the package cannot
  // parse. It is not in package.json "files", so it never ships. Recorded here rather
  // than silently skipped, because "the example does not match the format" is worth
  // someone's attention.
  const corpora = [
    store,
    '/home/mia/workspace/.mino/coaia/stcbot-triage-chart-260727-abd7ba82-f029-4243-93fb-72b7de8537e5.coaia-narrative.jsonl',
  ].filter((p) => existsSync(p));

  for (const corpus of corpora) {
    const raw = readFileSync(corpus, 'utf8');
    let writerGraph = null;
    try { writerGraph = parseJsonlMemory(raw); } catch { /* writer throws on bad lines */ }
    const mine = C.parseStore(raw);
    const label = path.basename(corpus);
    if (writerGraph) {
      const writerNames = new Set(writerGraph.entities.map((e) => e.name));
      const missing = [...writerNames].filter((n) => !mine.entities.has(n));
      check(`${label}: no entity the writer sees is lost`, missing.length === 0,
        `lost ${missing.length}: ${missing.slice(0, 3).join(', ')}`);
      check(`${label}: relation count agrees`,
        mine.relations.length === writerGraph.relations.length,
        `${mine.relations.length} vs ${writerGraph.relations.length}`);
      check(`${label}: nothing the writer accepted was called corrupt`,
        mine.entities.size >= writerNames.size);
    } else {
      check(`${label}: tolerant parser survives what the writer throws on`,
        mine.entities.size + mine.relations.length > 0);
    }
  }

  // The legacy dialect explicitly, since it is what the first draft lost.
  const legacy = C.parseStore(
    '{"type":"narrative_beat","name":"legacy_beat_1","observations":["o"],"narrative":"n"}',
  );
  check('a legacy top-level narrative_beat record is an entity, not a skip',
    legacy.entities.size === 1 && legacy.skipped === 0,
    `entities=${legacy.entities.size} skipped=${legacy.skipped}`);
  check('it is normalized to entityType narrative_beat',
    legacy.entities.get('legacy_beat_1')?.entityType === C.ENTITY_TYPES.narrativeBeat);
  check('a malformed relation is not silently accepted',
    C.parseStore('{"type":"relation"}').relations.length === 0);

  // -------------------------------------------------------------------------
  console.log('\n📋 tolerance, and what it honestly cannot detect');
  // -------------------------------------------------------------------------
  const raw = readFileSync(store, 'utf8');
  const torn = C.parseStore(raw.trimEnd() + '\n{"name":"half","entityTy');
  check('a torn line is skipped and counted, not fatal', torn.skipped === 1);
  check('every whole record still parsed', torn.entities.size === parsed.entities.size);
  check('an empty store parses to nothing rather than throwing',
    C.parseStore('').entities.size === 0);

  // -------------------------------------------------------------------------
  console.log('\n📋 storeRevision moves when the store changes — including deletions');
  // -------------------------------------------------------------------------
  // Entity names, not observation text — a flat step is named `${chartId}_action_N`.
  const stepA = flat[0].name;
  const stepB = flat[1].name;
  const revBefore = C.storeRevision(C.parseStore(readFileSync(store, 'utf8')));
  await mgr.updateActionProgress(stepA, 'halfway', false);
  const revProgress = C.storeRevision(C.parseStore(readFileSync(store, 'utf8')));
  check('a progress update moves the revision', revProgress !== revBefore,
    `${revBefore} -> ${revProgress}`);
  // Delete the TELESCOPED child, because that is the only thing removeActionStep can
  // delete. Measured 2026-08-02: given a flat action_step it reads metadata.chartId —
  // which for a flat step is the PARENT's id — then requires a chart whose own id and
  // whose parentChart are both that value, i.e. a chart that is its own parent. No such
  // chart exists, so every flat step is undeletable and the error reads "does not belong
  // to chart X" about a step that does belong to it. Reported, deliberately not fixed
  // here: changing destructive behaviour is not a drive-by.
  const telescopedItem = work.find((w) => w.telescoped);
  check('there is a telescoped child to delete', !!telescopedItem);
  let flatStepIsUndeletable = false;
  try {
    await mgr.removeActionStep(chartId, stepB);
  } catch {
    flatStepIsUndeletable = true;
  }
  check('KNOWN DEFECT recorded: a flat action step cannot be removed', flatStepIsUndeletable,
    'removeActionStep now accepts flat steps — update this test and the note above');

  const beforeDelete = C.parseStore(readFileSync(store, 'utf8'));
  await mgr.removeActionStep(chartId, C.desiredOutcomeName(telescopedItem.id));
  const afterDelete = C.parseStore(readFileSync(store, 'utf8'));
  check('a deletion moves the revision',
    C.storeRevision(afterDelete) !== C.storeRevision(beforeDelete),
    `${C.storeRevision(beforeDelete)} -> ${C.storeRevision(afterDelete)}`);

  // -------------------------------------------------------------------------
  console.log('\n📋 ANTI-DRIFT: every entityType this package writes is published');
  // -------------------------------------------------------------------------
  // Recursive, and over every compiled source — the previous version read 11 of 21
  // files and missed cli.ts, which ships as a bin and writes two entity kinds.
  function walk(dir) {
    const out = [];
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) continue;
      if (statSync(full).isDirectory()) out.push(...walk(full));
      else if (full.endsWith('.ts') && !full.endsWith('.d.ts')) out.push(full);
    }
    return out;
  }
  const sources = [
    ...walk(path.join(__dirname, 'src')),
    ...(existsSync(path.join(__dirname, 'handlers')) ? walk(path.join(__dirname, 'handlers')) : []),
    path.join(__dirname, 'index.ts'),
    path.join(__dirname, 'cli.ts'),
  ].filter((f) => existsSync(f) && !f.endsWith('contract.ts') && !f.endsWith('jsonl-records.ts'));

  check(`source scan covers a plausible number of files (${sources.length})`, sources.length >= 12,
    `only ${sources.length}`);

  const known = new Set(Object.values(C.ENTITY_TYPES));
  // The key may be bare (`entityType:`) or quoted (`'entityType':`, `"entityType":`),
  // and the value may use any of the three quote styles.
  const LITERAL = /(?:['"`])?\bentityType\b(?:['"`])?\s*:\s*(['"`])([^'"`]+)\1/g;
  const ANY_ASSIGN = /(?:['"`])?\bentityType\b(?:['"`])?(\??)\s*:\s*([^,\n}]+)/g;
  // A TYPE position is not a write site. `entityType?: string`, `entityType: EntityType`
  // and the JSON-schema `entityType: { type: "string" }` all describe the field rather
  // than assign it, and flagging them would make this guard cry wolf until muted.
  const TYPE_POSITION = /^(string|EntityType\w*|MmotPhase|any|unknown|\{)/;
  const found = new Map();
  const dynamic = [];
  for (const file of sources) {
    const text = readFileSync(file, 'utf8');
    const base = path.basename(file);
    for (const m of text.matchAll(LITERAL)) {
      if (!found.has(m[2])) found.set(m[2], base);
    }
    for (const m of text.matchAll(ANY_ASSIGN)) {
      const optional = m[1] === '?';
      const rhs = m[2].trim();
      if (optional || TYPE_POSITION.test(rhs)) continue;      // a declaration, not a write
      if (/^(['"`]).*\1$/.test(rhs)) continue;                // a literal, already captured
      dynamic.push(`${base}: ${rhs.slice(0, 40)}`);
    }
  }
  check('source scan found entityType literals', found.size > 0);
  for (const [kind, file] of found) {
    check(`'${kind}' (${file}) is published by the contract`, known.has(kind),
      'add it to ENTITY_TYPES in src/contract.ts');
  }
  check('no entityType is written from a non-literal the scan cannot verify',
    dynamic.length === 0, dynamic.slice(0, 3).join(' | '));

  // -------------------------------------------------------------------------
  console.log('\n📋 ANTI-DRIFT: MMOT_PHASES matches the tool definition');
  // -------------------------------------------------------------------------
  const toolDefs = readFileSync(path.join(__dirname, 'src', 'tool-definitions.ts'), 'utf8');
  const phaseBlock = toolDefs.match(/phase:\s*\{[^}]*enum:\s*\[([^\]]+)\]/s);
  check('found the phase enum in tool-definitions.ts', !!phaseBlock);
  if (phaseBlock) {
    const declared = [...phaseBlock[1].matchAll(/["']([a-z]+)["']/g)].map((m) => m[1]);
    const missing = declared.filter((p) => !C.MMOT_PHASES.includes(p));
    check('the contract publishes every phase the tool accepts', missing.length === 0,
      `missing: ${missing.join(', ')}`);
  }

  // -------------------------------------------------------------------------
  console.log('\n📋 the exports map did not break CommonJS deep imports');
  // -------------------------------------------------------------------------
  // Adding an exports field disables CJS extension-completion and directory-index
  // resolution. Measured: without explicit patterns, all four of these broke.
  const req = createRequire(path.join(__dirname, 'probe.cjs'));
  for (const spec of [
    'coaia-narrative/dist/src/graph-manager',
    'coaia-narrative/dist/src/tool-groups',
    'coaia-narrative/dist/index',
    'coaia-narrative/dist',
    'coaia-narrative/contract',
    'coaia-narrative/package.json',
  ]) {
    let ok = false;
    let why = '';
    try { req.resolve(spec); ok = true; } catch (e) { why = e.code || String(e).slice(0, 40); }
    check(`resolves: ${spec}`, ok, why);
  }

  // -------------------------------------------------------------------------
  console.log('\n📋 the contract module is import-safe');
  // -------------------------------------------------------------------------
  const compiled = readFileSync(path.join(__dirname, 'dist', 'src', 'contract.js'), 'utf8');
  check('compiled contract has no runtime imports beyond record classification',
    !/require\(|from ['"](fs|path|process|os|child_process)['"]/.test(compiled));
  check('compiled contract starts no server',
    !/StdioServerTransport|server\.connect/.test(compiled));
  check('CONTRACT_VERSION is published', typeof C.CONTRACT_VERSION === 'number');
} finally {
  try { unlinkSync(store); } catch { /* already gone */ }
}

console.log(`\n${failed === 0 ? '✅' : '❌'} ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
