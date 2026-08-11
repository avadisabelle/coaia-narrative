#!/usr/bin/env node
/**
 * Verification: an argument this package does not know must never vanish quietly.
 *
 * On 2026-08-11 a seat telescoped a chart and passed `actionSteps` — the name its
 * sibling `create_structural_tension_chart` uses for exactly that concept. The real
 * parameter here is `initialActionSteps`. The call returned success, the child chart
 * was born with zero steps, and `get_chart_progress` then read 0/0. Nothing anywhere
 * said a word. The seat spent the next several turns reporting a working package as
 * broken, because a success that did less than it was asked is indistinguishable from
 * a success that did everything.
 *
 * Two behaviours are asserted here, plus the one that made the diagnosis expensive:
 *
 *   1. `actionSteps` is accepted as an alias for `initialActionSteps`.
 *   2. A genuinely unknown argument still succeeds — it was never fatal and making it
 *      so would break callers — but the result SAYS it was ignored.
 *   3. `validate` reports every problem in one response, not one field per round trip.
 */

import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { KnowledgeGraphManager } from './dist/src/graph-manager.js';
import { handleToolCall } from './dist/src/tool-handlers.js';
import { validate, ValidationSchemas } from './dist/validation.js';

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

const text = (result) => result.content.map((c) => c.text).join('\n');
const payload = (result) => JSON.parse(result.content[0].text);

const dir = mkdtempSync(join(tmpdir(), 'coaia-argdrop-'));
const manager = new KnowledgeGraphManager(join(dir, 'store.jsonl'));

try {
  console.log('\n📋 an unknown argument is reported rather than dropped in silence');

  const chart = await handleToolCall('create_structural_tension_chart', {
    desiredOutcome: 'The package says what it did with every argument it was handed',
    currentReality: 'A mis-named array returns success and writes nothing',
    dueDate: '2026-09-01',
    actionSteps: ['name the alias', 'say what was ignored']
  }, manager);
  const chartId = payload(chart).chartId;
  check('a well-formed create carries no ignored-argument warning',
    !text(chart).includes('Ignored unrecognised'), text(chart).slice(0, 160));

  // 1 — the alias
  const stepName = `${chartId}_action_1`;
  const telescoped = await handleToolCall('telescope_action_step', {
    actionStepName: stepName,
    newCurrentReality: 'The alias is declared but never exercised by a test',
    actionSteps: ['first', 'second', 'third']   // the sibling tool's name
  }, manager);
  const childId = payload(telescoped).chartId;
  const graph = await manager.readGraph();
  const childSteps = graph.entities.filter(
    (e) => e.entityType === 'action_step' && e.metadata?.chartId === childId
  );
  check('`actionSteps` is honoured as an alias for `initialActionSteps`',
    childSteps.length === 3, `child holds ${childSteps.length} steps, expected 3`);
  check('the aliased call reports nothing ignored',
    !text(telescoped).includes('Ignored unrecognised'), text(telescoped).slice(0, 200));

  // 2 — a genuinely unknown argument
  const withJunk = await handleToolCall('telescope_action_step', {
    actionStepName: `${chartId}_action_2`,
    newCurrentReality: 'A caller invents a parameter that does not exist',
    dueDate: '2026-09-09',            // telescope has no dueDate
    elementsOfPerformance: []         // nor this
  }, manager);
  check('an unknown argument still succeeds (never made fatal)',
    !withJunk.isError, 'the call was rejected');
  check('...and the success names what it ignored',
    text(withJunk).includes('Ignored unrecognised argument(s)'), text(withJunk).slice(-200));
  check('...naming each one',
    text(withJunk).includes('dueDate') && text(withJunk).includes('elementsOfPerformance'),
    text(withJunk).slice(-200));

  console.log('\n📋 every validation problem arrives in one response');

  const both = validate({}, {
    actionStepName: ValidationSchemas.nonEmptyString(),
    newCurrentReality: ValidationSchemas.nonEmptyString()
  });
  check('two missing required fields are reported together',
    !both.valid &&
    both.error.includes('actionStepName') &&
    both.error.includes('newCurrentReality'),
    both.error);

  const mixed = validate({ actionStepName: 42, mystery: true }, {
    actionStepName: ValidationSchemas.nonEmptyString(),
    newCurrentReality: ValidationSchemas.nonEmptyString()
  });
  check('a type error, a missing field and an unknown key all surface at once',
    !mixed.valid &&
    mixed.error.includes('actionStepName must be a string') &&
    mixed.error.includes('Missing required field: newCurrentReality') &&
    mixed.error.includes('mystery'),
    mixed.error);

  check('`ignored` is absent when every argument was understood',
    validate({ query: 'x' }, { query: ValidationSchemas.nonEmptyString() }).ignored === undefined);
} finally {
  rmSync(dir, { recursive: true, force: true });
}

console.log(`\n${failed === 0 ? '✅' : '❌'} ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
