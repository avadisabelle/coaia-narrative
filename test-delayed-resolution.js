#!/usr/bin/env node
/**
 * Verification: delayed resolution.
 *
 * A due date says when a step is wanted. A delayed resolution says that someone chose
 * to wait for it, until when, why, what the wait serves, and which agent session to
 * rehydrate when the date comes. Earned 2026-10-19 (miadi-chronicle Episode 297,
 * delayed-resolution-design-261019.md).
 */

import { spawnSync } from 'child_process';
import { mkdtempSync, rmSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { KnowledgeGraphManager } from 'coaia-narrative/writer';
import { parseStore } from 'coaia-narrative/contract';
import { handleToolCall } from './dist/src/tool-handlers.js';
import { TOOL_GROUPS } from './dist/src/tool-groups.js';
import { ALL_TOOL_DEFINITIONS } from './dist/src/tool-definitions.js';

const here = dirname(fileURLToPath(import.meta.url));
let passed = 0;
let failed = 0;
function check(label, condition, detail) {
  if (condition) { console.log(`  ✅ ${label}`); passed++; }
  else { console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ''}`); failed++; }
}
async function refuses(label, fn, pattern) {
  try {
    await fn();
    check(label, false, 'no error was thrown');
  } catch (error) {
    check(label, pattern.test(error.message), error.message);
  }
}

const DAY = 24 * 60 * 60 * 1000;
const inDays = (n) => new Date(Date.now() + n * DAY).toISOString();
const dir = mkdtempSync(join(tmpdir(), 'coaia-delayed-'));
const file = join(dir, 'memory.jsonl');
const store = () => parseStore(readFileSync(file, 'utf8'));
const text = (result) => result.content.map((c) => c.text).join('\n');
const jsonOf = (result) => JSON.parse(text(result).slice(text(result).indexOf('{')));
const cli = (...args) => spawnSync(process.execPath, [join(here, 'dist', 'cli.js'), ...args, '-M', file], { encoding: 'utf8', timeout: 20000 });

try {
  const m = new KnowledgeGraphManager(file);
  const { chartId: A } = await m.createStructuralTensionChart(
    'Delayed resolution published and consumed from npm', 'No delayed resolution exists in any lineage', inDays(30), ['Write the tests']
  );
  const written = await m.appendActionStep(A, 'Announce the release');
  const { chartId: T, actionStepName: telescoped } = await m.addActionStep(A, 'Validate from a consumer', inDays(20), 'No consumer package exists yet');
  await m.markActionStepComplete(`${A}_action_1`);
  const baselineStatus = (await m.getGithubProjectFieldProjection(A))?.Status;

  console.log('\n📋 delay on a written step');
  const firstBy = inDays(7);
  const d1 = await m.delayResolution(written, {
    resolveBy: firstBy, reason: 'The announcement waits for the consumer proof', chosenBy: 'mia',
    wakeOn: ['the validation output lands'], session: { sessionId: 'abc-123', cwd: '/a/src/coaia-narrative', host: 'gaia' }
  });
  check('the step reads delayed', d1.status === 'delayed' && d1.kind === 'written' && d1.chartId === A, JSON.stringify(d1));
  check('the record carries who, when, why', d1.delayedResolution.chosenBy === 'mia' && d1.delayedResolution.reason.startsWith('The announcement') && !Number.isNaN(Date.parse(d1.delayedResolution.chosenAt)));
  check('primaryChoice defaults to the chart\'s desired outcome', d1.delayedResolution.primaryChoice === 'Delayed resolution published and consumed from npm', d1.delayedResolution.primaryChoice);
  check('the session defaults to claude and gets its resume command', d1.delayedResolution.session.agent === 'claude' && d1.delayedResolution.session.resumeCommand === 'cd /a/src/coaia-narrative && claude --resume abc-123', JSON.stringify(d1.delayedResolution.session));
  check('choosing a delay sets the step\'s due date to resolveBy', store().entities.get(written)?.metadata?.dueDate === firstBy, store().entities.get(written)?.metadata?.dueDate);

  console.log('\n📋 delay on a telescoped step, named by its chart');
  const d2 = await m.delayResolution(T, { resolveBy: inDays(10), reason: 'The consumer waits for the publish', chosenBy: 'mia' });
  check('the record lives on its desired outcome', d2.actionStepName === telescoped && d2.kind === 'telescoped' && d2.telescopedChartId === T, JSON.stringify(d2));
  check('the chart it advances is the parent', d2.chartId === A && d2.delayedResolution.primaryChoice === 'Delayed resolution published and consumed from npm');
  const sT = store();
  check('the sub-chart and its desired outcome both carry the new due date',
    sT.entities.get(`${T}_chart`)?.metadata?.dueDate === d2.delayedResolution.resolveBy && sT.entities.get(telescoped)?.metadata?.dueDate === d2.delayedResolution.resolveBy);

  console.log('\n📋 what cannot be delayed');
  await refuses('a completed step', () => m.delayResolution(`${A}_action_1`, { resolveBy: inDays(3), reason: 'x', chosenBy: 'mia' }), /completed/);
  await refuses('a resolveBy in the past', () => m.delayResolution(written, { resolveBy: inDays(-1), reason: 'x', chosenBy: 'mia' }), /must be in the future/);
  await refuses('a resolveBy that is not a date', () => m.delayResolution(written, { resolveBy: 'next tuesday-ish', reason: 'x', chosenBy: 'mia' }), /not a date/);
  await refuses('a primary chart, which is no step', () => m.delayResolution(A, { resolveBy: inDays(3), reason: 'x', chosenBy: 'mia' }), /not a step of another chart/);
  await refuses('a delay with no reason', () => m.delayResolution(written, { resolveBy: inDays(3), reason: ' ', chosenBy: 'mia' }), /reason is required/);
  await refuses('a step that does not exist', () => m.delayResolution(`${A}_action_99`, { resolveBy: inDays(3), reason: 'x', chosenBy: 'mia' }), /not found/);
  const badDate = await handleToolCall('delay_resolution', { actionStepName: written, resolveBy: 'soon', reason: 'x', chosenBy: 'mia' }, m);
  check('the MCP tool refuses an invalid resolveBy', badDate.isError === true && /resolveBy/.test(text(badDate)), text(badDate));
  check('a refusal changed nothing', store().entities.get(written)?.metadata?.delayedResolution?.resolveBy === firstBy);

  console.log('\n📋 delaying again keeps the earlier record');
  const secondBy = inDays(14);
  const d3 = await m.delayResolution(`${T}_chart`, { resolveBy: secondBy, reason: 'The publish moved', chosenBy: 'william' });
  check('the open record moves to history', d3.delayedResolutionHistory.length === 1 && d3.delayedResolutionHistory[0].resolveBy === d2.delayedResolution.resolveBy && d3.delayedResolutionHistory[0].chosenBy === 'mia', JSON.stringify(d3.delayedResolutionHistory));
  check('the new record is the open one', d3.delayedResolution.resolveBy === secondBy && d3.delayedResolution.chosenBy === 'william' && !d3.delayedResolution.endedAt);

  console.log('\n📋 listing, by resolveBy');
  const list = await m.listDelayedResolutions();
  check('two delays stand, soonest first', list.map((e) => e.actionStepName).join() === `${written},${telescoped}`, list.map((e) => e.actionStepName).join());
  check('days remaining are counted', list[0].daysRemaining === 7 && list[1].daysRemaining === 14, list.map((e) => e.daysRemaining).join());
  check('nothing is owed yet', list.every((e) => e.owed === false));
  check('each line carries chart, primaryChoice, wakeOn and session', list[0].chartId === A && list[0].primaryChoice && list[0].wakeOn[0] === 'the validation output lands' && list[0].session?.sessionId === 'abc-123' && list[1].session === null && Array.isArray(list[1].wakeOn), JSON.stringify(list[0]));
  const later = await m.listDelayedResolutions({ now: inDays(10) });
  check('past its resolveBy a delay is owed', later[0].owed === true && later[0].daysRemaining < 0 && later[1].owed === false && later[1].daysRemaining === 4, JSON.stringify(later.map((e) => [e.owed, e.daysRemaining])));
  const soon = await m.listDelayedResolutions({ dueWithinDays: 10 });
  check('dueWithinDays keeps the near ones', soon.length === 1 && soon[0].actionStepName === written, soon.map((e) => e.actionStepName).join());
  const listed = await handleToolCall('list_delayed_resolutions', {}, m);
  check('the MCP tool says how many stand', /2 delayed resolution\(s\) standing, 0 owed/.test(text(listed)), text(listed).split('\n')[0]);

  console.log('\n📋 status reads delayed wherever a step\'s status shows');
  const progress = await m.getChartProgress(A);
  const statusOf = (steps, name) => steps.find((s) => s.name === name)?.status;
  check('get_chart_progress: both delayed, the completed one completed',
    statusOf(progress.steps, written) === 'delayed' && statusOf(progress.steps, telescoped) === 'delayed' && statusOf(progress.steps, `${A}_action_1`) === 'completed' && progress.delayedActions === 2, JSON.stringify(progress.steps));
  const charts = await m.listActiveCharts();
  const chartA = charts.find((c) => c.chartId === A);
  const chartT = charts.find((c) => c.chartId === T);
  check('list_active_charts: the written step and the telescoped chart read delayed',
    chartA.actionSteps.find((s) => s.name === written)?.status === 'delayed' && chartT.stepStatus === 'delayed' && chartT.resolveBy === secondBy, JSON.stringify({ a: chartA.actionSteps, t: chartT.stepStatus }));
  const rendered = text(await handleToolCall('list_active_charts', {}, m));
  check('the rendered hierarchy marks both', (rendered.match(/⏸️/g) || []).length === 2 && /delayed until/.test(rendered), rendered);
  const stepResult = await handleToolCall('get_action_step', { actionStepName: written }, m);
  check('get_action_step answers for a written step, with its status', !stepResult.isError && JSON.parse(text(stepResult)).step.status === 'delayed', text(stepResult));
  const tStep = JSON.parse(text(await handleToolCall('get_action_step', { actionStepName: telescoped }, m)));
  check('get_action_step answers for a telescoped step', tStep.step.status === 'delayed' && tStep.step.delayedResolutionHistory.length === 1);
  const chartResult = JSON.parse(text(await handleToolCall('get_chart', { chartId: A }, m)));
  check('get_chart lists each step with its status', statusOf(chartResult.steps, written) === 'delayed' && Array.isArray(chartResult.entities), JSON.stringify(chartResult.steps));
  check('the GitHub project status of the chart is Delaying Resolution', (await m.getGithubProjectFieldProjection(A))?.Status === 'Delaying Resolution', (await m.getGithubProjectFieldProjection(A))?.Status);
  check('and of the telescoped chart itself', (await m.getGithubProjectFieldProjection(T))?.Status === 'Delaying Resolution');
  check('the projection keeps session_id for the source session, not the delay\'s', (await m.getGithubProjectFieldProjection(A))?.session_id === undefined);
  const view = cli('view', A);
  check('cnarrative view marks the delayed step', view.status === 0 && /⏸️ Announce the release/.test(view.stdout) && /Delayed until/.test(view.stdout) && /claude --resume abc-123/.test(view.stdout), view.stdout + view.stderr);
  const delayedCli = cli('delayed', '--json');
  check('cnarrative delayed --json lists both', delayedCli.status === 0 && JSON.parse(delayedCli.stdout).length === 2, delayedCli.stdout + delayedCli.stderr);

  console.log('\n📋 ending a delay');
  const ended = await m.endDelayedResolution(written, { endedBy: 'mia', outcome: 'rehydrated', endNote: 'the consumer proof landed' });
  check('rehydrated gives back the session\'s resume command', ended.resumeCommand === 'cd /a/src/coaia-narrative && claude --resume abc-123', ended.resumeCommand);
  check('the record stays, closed', ended.delayedResolution.outcome === 'rehydrated' && ended.delayedResolution.endedBy === 'mia' && !!ended.delayedResolution.endedAt && ended.delayedResolution.endNote === 'the consumer proof landed', JSON.stringify(ended.delayedResolution));
  check('the step returns to pending', ended.status === 'pending');
  await refuses('a delay cannot be ended twice', () => m.endDelayedResolution(written, { endedBy: 'mia', outcome: 'released' }), /no open delayed resolution/);
  await refuses('an outcome outside rehydrated and released', () => m.endDelayedResolution(telescoped, { endedBy: 'mia', outcome: 'forgotten' }), /outcome must be one of/);
  const afterOne = await m.listDelayedResolutions();
  const withEnded = await m.listDelayedResolutions({ includeEnded: true });
  check('an ended delay leaves the default list', afterOne.length === 1 && afterOne[0].actionStepName === telescoped);
  check('includeEnded shows it, closed', withEnded.length === 2 && withEnded.find((e) => e.actionStepName === written)?.outcome === 'rehydrated');
  const released = await handleToolCall('end_delayed_resolution', { actionStepName: telescoped, endedBy: 'william', outcome: 'released' }, m);
  const releasedJson = jsonOf(released);
  check('released through the MCP tool', !released.isError && releasedJson.delayedResolution.outcome === 'released' && releasedJson.status === 'pending' && !('resumeCommand' in releasedJson), text(released));

  console.log('\n📋 status returns once the delays end');
  const progress2 = await m.getChartProgress(A);
  check('get_chart_progress reads pending again', statusOf(progress2.steps, written) === 'pending' && statusOf(progress2.steps, telescoped) === 'pending' && progress2.delayedActions === 0, JSON.stringify(progress2.steps));
  check('list_active_charts marks nothing delayed', !/⏸️/.test(text(await handleToolCall('list_active_charts', {}, m))));
  check('the GitHub project status returns to what it was', (await m.getGithubProjectFieldProjection(A))?.Status === baselineStatus, `${(await m.getGithubProjectFieldProjection(A))?.Status} vs ${baselineStatus}`);
  check('nothing is listed', (await m.listDelayedResolutions()).length === 0);

  console.log('\n📋 the CLI commands');
  const cDelay = cli('delay', written, inDays(5).slice(0, 10), '--reason', 'waits for the next review', '--by', 'cli-seat', '--session-id', '4242', '--cwd', '/tmp/the work', '--wake-on', 'review posted');
  check('cnarrative delay records it', cDelay.status === 0 && /Resolution delayed/.test(cDelay.stdout), cDelay.stdout + cDelay.stderr);
  const sCli = store().entities.get(written)?.metadata;
  check('the ended record moved to history, nothing overwritten', sCli?.delayedResolutionHistory?.length === 1 && sCli.delayedResolutionHistory[0].outcome === 'rehydrated' && sCli.delayedResolution.chosenBy === 'cli-seat', JSON.stringify(sCli?.delayedResolutionHistory));
  check('a numeric session id stays text, a cwd with a space is quoted', sCli?.delayedResolution?.session?.sessionId === '4242' && sCli.delayedResolution.session.resumeCommand === "cd '/tmp/the work' && claude --resume 4242", JSON.stringify(sCli?.delayedResolution?.session));
  const cList = cli('delayed');
  check('cnarrative delayed shows it', cList.status === 0 && /Announce the release/.test(cList.stdout) && /review posted/.test(cList.stdout), cList.stdout);
  const cEnd = cli('end-delay', written, '--outcome', 'rehydrated', '--by', 'cli-seat');
  check('cnarrative end-delay prints the resume command', cEnd.status === 0 && /Rehydrate with: cd '\/tmp\/the work' && claude --resume 4242/.test(cEnd.stdout), cEnd.stdout + cEnd.stderr);
  const cBad = cli('delay', written, '2001-01-01', '--reason', 'r', '--by', 'b');
  check('cnarrative delay refuses a past date and exits non-zero', cBad.status === 1 && /must be in the future/.test(cBad.stdout + cBad.stderr), cBad.stdout + cBad.stderr);

  console.log('\n📋 the tools are published');
  for (const name of ['delay_resolution', 'list_delayed_resolutions', 'end_delayed_resolution']) {
    check(`${name} is defined and in STC_TOOLS`, ALL_TOOL_DEFINITIONS.some((t) => t.name === name) && TOOL_GROUPS.STC_TOOLS.includes(name));
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
