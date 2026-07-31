#!/usr/bin/env node
/**
 * Verification: a malformed MCP call must not become chart content.
 *
 * On 2026-07-30 a live store carried seven observations whose bodies ended in
 * `</currentReality>` followed by a `<parameter name="dueDate">` block — the raw
 * text of a tool call whose argument tags never parsed, persisted verbatim as if
 * it were prose. The call did not fail; it wrote.
 *
 * This exercises the write boundary with bodies that carry that syntax and
 * asserts each one is refused, with the offending fragment named so the caller
 * can retry.
 */

import { mkdtempSync, rmSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { KnowledgeGraphManager } from './dist/src/graph-manager.js';
import { handleToolCall } from './dist/src/tool-handlers.js';

const LEAKED_BODY =
  'Day-05 and day-06 work both landed on day-04\'s address.</currentReality>\n' +
  '<parameter name="dueDate">2026-07-31T12:00:00Z';

let passed = 0;
let failed = 0;

function check(label, condition, detail) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${label}`);
  } else {
    failed++;
    console.log(`  ❌ ${label}${detail ? `\n     ${detail}` : ''}`);
  }
}

function storeText(path) {
  return existsSync(path) ? readFileSync(path, 'utf-8') : '';
}

async function run() {
  const dir = mkdtempSync(join(tmpdir(), 'coaia-unparsed-'));
  const storePath = join(dir, 'store.jsonl');
  const manager = new KnowledgeGraphManager(storePath);

  try {
    console.log('\n📋 create_structural_tension_chart with a leaked currentReality');
    const created = await handleToolCall('create_structural_tension_chart', {
      desiredOutcome: 'A store that refuses unparsed call syntax',
      currentReality: LEAKED_BODY,
      dueDate: '2026-08-15T00:00:00Z'
    }, manager);

    check('refused', created.isError === true, `got: ${created.content[0].text.slice(0, 160)}`);
    check('names the offending fragment',
      /<\/currentReality>/.test(created.content[0].text),
      `message: ${created.content[0].text.slice(0, 240)}`);
    check('names the argument it came from',
      /currentReality/.test(created.content[0].text));
    check('nothing written to the store',
      !storeText(storePath).includes('</currentReality>'),
      'the leaked body reached the JSONL');

    console.log('\n📋 update_current_reality with a leaked observation');
    const chart = await handleToolCall('create_structural_tension_chart', {
      desiredOutcome: 'A store that names what it refuses',
      currentReality: 'Seven observations carried unparsed call text; the cause is unfixed.',
      dueDate: '2026-08-15T00:00:00Z',
      actionSteps: ['Name the fragment', 'Refuse the write']
    }, manager);
    check('a clean chart still writes', chart.isError !== true, chart.content[0].text.slice(0, 160));
    const chartId = JSON.parse(chart.content[0].text).chartId;

    const updated = await handleToolCall('update_current_reality', {
      chartId,
      newObservations: [LEAKED_BODY]
    }, manager);
    check('refused', updated.isError === true, `got: ${updated.content[0].text.slice(0, 160)}`);
    check('names the array index',
      /newObservations\[0\]/.test(updated.content[0].text),
      `message: ${updated.content[0].text.slice(0, 240)}`);
    check('nothing written to the store',
      !storeText(storePath).includes('</currentReality>'));

    console.log('\n📋 the other write paths');
    const progress = await handleToolCall('update_action_progress', {
      actionStepName: `${chartId}_action_1`,
      progressObservation: LEAKED_BODY
    }, manager);
    check('update_action_progress refused', progress.isError === true);

    const outcome = await handleToolCall('update_desired_outcome', {
      chartId,
      newDesiredOutcome: 'Something real</desiredOutcome>'
    }, manager);
    check('update_desired_outcome refused a closing tag', outcome.isError === true);

    const entities = await handleToolCall('create_entities', {
      entities: [{
        name: 'leak_probe',
        entityType: 'note',
        observations: ['<parameter name="dueDate">2026-07-31T12:00:00Z']
      }]
    }, manager);
    check('create_entities refused a parameter block', entities.isError === true);

    const observations = await handleToolCall('add_observations', {
      observations: [{ entityName: `${chartId}_current_reality`, contents: ['fine', LEAKED_BODY] }]
    }, manager);
    check('add_observations refused', observations.isError === true);
    check('the clean sibling observation did not land either',
      !storeText(storePath).includes('"fine"'),
      'a partial write happened — the refusal must be all-or-nothing');

    console.log('\n📋 the manager refuses too, for callers that bypass the MCP handler');
    let threw = null;
    try {
      await manager.createEntities([{
        name: 'direct_probe',
        entityType: 'note',
        observations: [LEAKED_BODY]
      }]);
    } catch (error) {
      threw = error;
    }
    check('createEntities threw', threw !== null);
    check('the message names the fragment',
      threw !== null && /<\/currentReality>/.test(threw.message),
      threw ? threw.message.slice(0, 200) : '');

    console.log('\n📋 prose that merely mentions tags is still writable');
    const prose = await handleToolCall('update_current_reality', {
      chartId,
      newObservations: [
        'The visualizer renders <div> wrappers around each observation.',
        'a < b and c > d in the comparison table',
        'Vitest config uses <rootDir> style placeholders'
      ]
    }, manager);
    check('ordinary angle brackets pass', prose.isError !== true, prose.content[0].text.slice(0, 200));

    console.log('\n📋 the dueDate a chart was given can be changed afterward');
    const changed = await handleToolCall('update_chart_due_date', {
      chartId,
      newDueDate: '2026-09-30T12:00:00Z'
    }, manager);
    check('update_chart_due_date succeeded', changed.isError !== true, changed.content[0].text.slice(0, 200));

    const detail = await handleToolCall('get_chart', { chartId }, manager);
    const parsed = JSON.parse(detail.content[0].text);
    const chartEntity = parsed.entities.find(e => e.entityType === 'structural_tension_chart');
    const outcomeEntity = parsed.entities.find(e => e.entityType === 'desired_outcome');
    check('the chart carries the new date',
      chartEntity?.metadata?.dueDate?.startsWith('2026-09-30'),
      `got: ${chartEntity?.metadata?.dueDate}`);
    check('the desired outcome moved with it',
      outcomeEntity?.metadata?.dueDate?.startsWith('2026-09-30'),
      `got: ${outcomeEntity?.metadata?.dueDate}`);
    check('the change is recorded on the chart',
      /Due date changed/.test(storeText(storePath)),
      'no provenance observation was written');

    const badDate = await handleToolCall('update_chart_due_date', {
      chartId,
      newDueDate: 'not-a-date'
    }, manager);
    check('a malformed date is refused', badDate.isError === true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  console.log(`\n${failed === 0 ? '✅' : '❌'} ${passed} passed, ${failed} failed\n`);
  process.exit(failed === 0 ? 0 : 1);
}

run().catch(error => {
  console.error('Harness error:', error);
  process.exit(1);
});
