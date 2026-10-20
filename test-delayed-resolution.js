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
import { KnowledgeGraphManager, recordGithubIssueEvent, githubIssueEventFromPayload } from 'coaia-narrative/writer';
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

  console.log('\n📋 completing a delayed step ends its delay as resolved (rule 4b)');
  const { chartId: B } = await m.createStructuralTensionChart(
    'Rule 4b holds in every lineage', 'A completed step left its delay open in coaiajs', inDays(30), ['Complete through the MCP tool', 'Complete through the writer', 'Complete through the CLI']
  );
  const [b1, b2, b3] = [1, 2, 3].map((i) => `${B}_action_${i}`);
  for (const name of [b1, b2, b3]) await m.delayResolution(name, { resolveBy: inDays(4), reason: 'waits', chosenBy: 'mia' });
  const { chartId: U, actionStepName: uStep } = await m.addActionStep(B, 'A telescoped step completed with no name given', inDays(9), 'Nothing built yet');
  await m.delayResolution(U, { resolveBy: inDays(6), reason: 'waits too', chosenBy: 'mia' });
  check('four delays stand before completion', (await m.listDelayedResolutions()).filter((e) => e.chartId === B).length === 4);
  const done1 = await handleToolCall('mark_action_complete', { actionStepName: b1, completedBy: 'william' }, m);
  const r1 = store().entities.get(b1)?.metadata;
  check('mark_action_complete closes the delay: resolved, by whoever completed it, note "completed"',
    !done1.isError && r1?.completionStatus === true && r1.delayedResolution.outcome === 'resolved' && r1.delayedResolution.endedBy === 'william' && r1.delayedResolution.endNote === 'completed' && !!r1.delayedResolution.endedAt, JSON.stringify(r1?.delayedResolution));
  check('the record keeps its choice', r1?.delayedResolution.chosenBy === 'mia' && r1.delayedResolution.reason === 'waits');
  check('mark_action_complete says the delay ended as resolved, and by whom',
    /marked as complete/.test(text(done1)) && /delayed resolution \(until [^)]+, chosen by mia\) ended as resolved by william/.test(text(done1)), text(done1));
  const plain = await handleToolCall('mark_action_complete', { actionStepName: `${A}_action_1` }, m);
  check('completing a step with no delay says nothing of one', !plain.isError && /marked as complete/.test(text(plain)) && !/delayed resolution/.test(text(plain)), text(plain));
  await m.setActionStepCompletion(b2, true, { completedBy: 'stc-panel' });
  check('setActionStepCompletion closes it too', store().entities.get(b2)?.metadata?.delayedResolution?.outcome === 'resolved' && store().entities.get(b2)?.metadata?.delayedResolution?.endedBy === 'stc-panel');
  const uReturned = await m.markActionStepComplete(uStep);
  const uRecord = store().entities.get(uStep)?.metadata?.delayedResolution;
  check('markActionStepComplete returns the delay it ended', uReturned?.outcome === 'resolved' && uReturned.endedAt === uRecord?.endedAt, JSON.stringify(uReturned));
  check('a telescoped step completed with no name given: endedBy "mark_action_complete"', uRecord?.outcome === 'resolved' && uRecord.endedBy === 'mark_action_complete', JSON.stringify(uRecord));
  const cDone = cli('complete', b3, '--by', 'cli-seat');
  const r3 = store().entities.get(b3)?.metadata?.delayedResolution;
  check('cnarrative complete closes it too', cDone.status === 0 && r3?.outcome === 'resolved' && r3.endedBy === 'cli-seat' && /ended as resolved/.test(cDone.stdout), cDone.stdout + JSON.stringify(r3));
  check('resolved delays leave the default list', (await m.listDelayedResolutions()).filter((e) => e.chartId === B).length === 0);
  check('includeEnded shows them as resolved', (await m.listDelayedResolutions({ includeEnded: true })).filter((e) => e.chartId === B && e.outcome === 'resolved').length === 4);
  check('the chart no longer reads Delaying Resolution', (await m.getGithubProjectFieldProjection(B))?.Status !== 'Delaying Resolution', (await m.getGithubProjectFieldProjection(B))?.Status);
  await m.setActionStepCompletion(b1, false);
  await m.delayResolution(b1, { resolveBy: inDays(2), reason: 'reopened and waiting again', chosenBy: 'mia' });
  const viaTool = await handleToolCall('end_delayed_resolution', { actionStepName: b1, endedBy: 'mia', outcome: 'resolved' }, m);
  check('end_delayed_resolution does not accept "resolved"', viaTool.isError === true && /rehydrated, released/.test(text(viaTool)), text(viaTool));
  await refuses('nor does endDelayedResolution', () => m.endDelayedResolution(b1, { endedBy: 'mia', outcome: 'resolved' }), /outcome must be one of rehydrated, released/);
  const gh = new KnowledgeGraphManager(join(dir, 'gh.jsonl'));
  const issue = (action, body) => githubIssueEventFromPayload({
    action, repository: { full_name: 'jgwill/dummass' }, sender: { login: 'jgwill' },
    issue: { number: 8, title: 'Ship the delayed thing', body, user: { login: 'jgwill' }, html_url: 'https://github.com/jgwill/dummass/issues/8', created_at: '2026-10-19T12:00:00Z' },
  });
  const opened = await recordGithubIssueEvent(gh, issue('opened', '- [ ] Ship it'));
  await gh.delayResolution(`${opened.chartId}_action_1`, { resolveBy: inDays(3), reason: 'waits for the review', chosenBy: 'mia' });
  await recordGithubIssueEvent(gh, issue('edited', '- [x] Ship it'));
  const ghRecord = parseStore(readFileSync(join(dir, 'gh.jsonl'), 'utf8')).entities.get(`${opened.chartId}_action_1`)?.metadata?.delayedResolution;
  check('a task-list item checked on GitHub ends the delay as resolved by whoever checked it', ghRecord?.outcome === 'resolved' && ghRecord.endedBy === '@jgwill', JSON.stringify(ghRecord));
  check('the resolved record moved to history when the step was delayed again', store().entities.get(b1)?.metadata?.delayedResolutionHistory?.[0]?.outcome === 'resolved');

  console.log('\n📋 a delay\'s session carries its LLMOps trace and the prompt that rehydrates it (0.25.0)');
  const traceAddr = 'miadi-tracing:ceremony/session/a284e640-afed-404f-8138-7ac93c41e870';
  const promptAddr = 'miadi-tracing:ceremony/prompt/miadiRun-coaia-delay@3';
  const { chartId: C } = await m.createStructuralTensionChart(
    'A delayed session comes back with its trace and its prompt', 'A delay names a session by id and cwd only', inDays(30), ['Rehydrate through the library', 'Rehydrate through the MCP tool', 'Rehydrate through the CLI', 'Delay with no LLMOps address']
  );
  const [c1, c2, c3, c4] = [1, 2, 3, 4].map((i) => `${C}_action_${i}`);
  const t1 = await m.delayResolution(c1, {
    resolveBy: inDays(5), reason: 'waits for the ceremony', chosenBy: 'mia',
    session: { sessionId: 'a284e640', cwd: '/srv/miadi/episodes', trace: traceAddr, rehydrateWith: promptAddr }
  });
  check('trace and rehydrateWith are stored as given', t1.delayedResolution.session.trace === traceAddr && t1.delayedResolution.session.rehydrateWith === promptAddr, JSON.stringify(t1.delayedResolution.session));
  check('the resume command is still composed beside them', t1.delayedResolution.session.resumeCommand === 'cd /srv/miadi/episodes && claude --resume a284e640');
  check('the store keeps them', store().entities.get(c1)?.metadata?.delayedResolution?.session?.rehydrateWith === promptAddr);
  await refuses('a trace that does not begin with miadi-', () => m.delayResolution(c2, { resolveBy: inDays(5), reason: 'x', chosenBy: 'mia', session: { sessionId: 's', trace: 'langfuse:abc' } }), /session\.trace must be an address beginning with "miadi-"/);
  await refuses('a rehydrateWith that does not begin with miadi-', () => m.delayResolution(c2, { resolveBy: inDays(5), reason: 'x', chosenBy: 'mia', session: { sessionId: 's', rehydrateWith: 'miadiRun-x.v1' } }), /session\.rehydrateWith must be an address beginning with "miadi-"/);
  await refuses('a trace that is not text', () => m.delayResolution(c2, { resolveBy: inDays(5), reason: 'x', chosenBy: 'mia', session: { sessionId: 's', trace: 42 } }), /session\.trace must be a string/);
  check('a refused address wrote nothing', !store().entities.get(c2)?.metadata?.delayedResolution);
  const listedT = (await m.listDelayedResolutions()).find((e) => e.actionStepName === c1);
  check('list_delayed_resolutions carries them in the session', listedT?.session?.trace === traceAddr && listedT.session.rehydrateWith === promptAddr, JSON.stringify(listedT?.session));
  const endedT = await m.endDelayedResolution(c1, { endedBy: 'mia', outcome: 'rehydrated' });
  check('rehydrated returns trace and rehydrateWith beside resumeCommand',
    endedT.resumeCommand === 'cd /srv/miadi/episodes && claude --resume a284e640' && endedT.trace === traceAddr && endedT.rehydrateWith === promptAddr, JSON.stringify({ r: endedT.resumeCommand, t: endedT.trace, w: endedT.rehydrateWith }));

  const viaMcp = await handleToolCall('delay_resolution', {
    actionStepName: c2, resolveBy: inDays(6), reason: 'waits for the ceremony', chosenBy: 'mia',
    session: { sessionId: 'b-2', trace: traceAddr, rehydrateWith: promptAddr }
  }, m);
  check('the MCP tool accepts them, with no argument ignored', !viaMcp.isError && jsonOf(viaMcp).delayedResolution.session.trace === traceAddr && !/ignored/.test(text(viaMcp)), text(viaMcp));
  await refuses('the MCP tool refuses an address outside miadi-', () => handleToolCall('delay_resolution', {
    actionStepName: c4, resolveBy: inDays(6), reason: 'x', chosenBy: 'mia', session: { sessionId: 'b-3', trace: 'https://trace.example/abc' }
  }, m), /must be an address beginning with "miadi-"/);
  const endViaMcp = await handleToolCall('end_delayed_resolution', { actionStepName: c2, endedBy: 'mia', outcome: 'rehydrated' }, m);
  const endViaMcpJson = jsonOf(endViaMcp);
  check('end_delayed_resolution returns and names them', !endViaMcp.isError && endViaMcpJson.trace === traceAddr && endViaMcpJson.rehydrateWith === promptAddr
    && text(endViaMcp).includes(`Trace: ${traceAddr}`) && text(endViaMcp).includes(`Prompt that rehydrates it: ${promptAddr}`), text(endViaMcp));
  const delaySchema = ALL_TOOL_DEFINITIONS.find((t) => t.name === 'delay_resolution').inputSchema.properties.session.properties;
  check('the delay_resolution schema names trace and rehydrateWith', delaySchema.trace?.type === 'string' && delaySchema.rehydrateWith?.type === 'string');

  await m.delayResolution(c4, { resolveBy: inDays(7), reason: 'no LLMOps record', chosenBy: 'mia', session: { sessionId: 'c-4', cwd: '/tmp' } });
  const endedNone = await m.endDelayedResolution(c4, { endedBy: 'mia', outcome: 'rehydrated' });
  check('a session with no address returns trace and rehydrateWith as null', endedNone.trace === null && endedNone.rehydrateWith === null && endedNone.resumeCommand === 'cd /tmp && claude --resume c-4', JSON.stringify({ t: endedNone.trace, w: endedNone.rehydrateWith }));
  await m.delayResolution(c4, { resolveBy: inDays(7), reason: 'released this time', chosenBy: 'mia', session: { sessionId: 'c-4', trace: traceAddr } });
  const releasedT = await m.endDelayedResolution(c4, { endedBy: 'mia', outcome: 'released' });
  check('released returns neither', !('trace' in releasedT) && !('rehydrateWith' in releasedT) && !('resumeCommand' in releasedT));

  const cT = cli('delay', c3, inDays(5).slice(0, 10), '--reason', 'waits for the ceremony', '--by', 'cli-seat', '--session-id', 'd-3', '--trace', traceAddr, '--rehydrate-with', promptAddr);
  check('cnarrative delay --trace --rehydrate-with records them', cT.status === 0 && cT.stdout.includes(`Trace: ${traceAddr}`) && store().entities.get(c3)?.metadata?.delayedResolution?.session?.rehydrateWith === promptAddr, cT.stdout + cT.stderr);
  const cTList = cli('delayed');
  check('cnarrative delayed shows them', cTList.status === 0 && cTList.stdout.includes(`Trace: ${traceAddr}`) && cTList.stdout.includes(`Rehydrate with prompt: ${promptAddr}`), cTList.stdout);
  const cTEnd = cli('end-delay', c3, '--outcome', 'rehydrated', '--by', 'cli-seat');
  check('cnarrative end-delay prints them', cTEnd.status === 0 && cTEnd.stdout.includes(`Trace: ${traceAddr}`) && cTEnd.stdout.includes(`Prompt that rehydrates it: ${promptAddr}`), cTEnd.stdout + cTEnd.stderr);
  const cTNoSession = cli('delay', c3, inDays(5).slice(0, 10), '--reason', 'r', '--by', 'b', '--trace', traceAddr);
  check('cnarrative delay refuses --trace without --session-id', cTNoSession.status === 1 && /--session-id/.test(cTNoSession.stdout + cTNoSession.stderr), cTNoSession.stdout + cTNoSession.stderr);
  const cTBad = cli('delay', c3, inDays(5).slice(0, 10), '--reason', 'r', '--by', 'b', '--session-id', 'd-3', '--rehydrate-with', 'miadiRun-x.v1');
  check('cnarrative delay refuses an address outside miadi-', cTBad.status === 1 && /beginning with "miadi-"/.test(cTBad.stdout + cTBad.stderr), cTBad.stdout + cTBad.stderr);

  console.log('\n📋 the tools are published');
  for (const name of ['delay_resolution', 'list_delayed_resolutions', 'end_delayed_resolution']) {
    check(`${name} is defined and in STC_TOOLS`, ALL_TOOL_DEFINITIONS.some((t) => t.name === name) && TOOL_GROUPS.STC_TOOLS.includes(name));
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
