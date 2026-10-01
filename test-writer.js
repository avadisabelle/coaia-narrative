#!/usr/bin/env node
/**
 * Verification: coaia-narrative/writer — writing charts from another service.
 *
 * Miadi's GitHub webhook wrote one line per issue event into one chart per repository,
 * by hand. The writer makes one chart per issue, through the same manager the MCP tools
 * use, found again by the issue it records. Earned 2026-09-28 (miadi-chronicle episode
 * 060, miadisabelle/asterion#9).
 */

import { spawnSync } from 'child_process';
import { mkdtempSync, rmSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  KnowledgeGraphManager, recordGithubIssueEvent, githubIssueEventFromPayload, parseTaskList,
  recordGithubSubIssueEvent, githubSubIssueEventFromPayload,
} from 'coaia-narrative/writer';
import { parseStore, getChartEntity, getDesiredOutcome, getCurrentReality, getFlatActionSteps, getChildCharts } from 'coaia-narrative/contract';

let passed = 0;
let failed = 0;
function check(label, condition, detail) {
  if (condition) { console.log(`  ✅ ${label}`); passed++; }
  else { console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ''}`); failed++; }
}

const dir = mkdtempSync(join(tmpdir(), 'coaia-writer-'));
const raw = (action, issue, extra = {}) => ({
  action,
  repository: { full_name: 'jgwill/dummass' },
  sender: { login: 'jgwill' },
  issue: { number: 7, title: 'Publish the dummass package', body: '', user: { login: 'jgwill' }, html_url: 'https://github.com/jgwill/dummass/issues/7', created_at: '2026-09-28T12:00:00Z', ...issue },
  ...extra,
});
const store = (file) => parseStore(readFileSync(file, 'utf8'));
const { checkStore: checkStoreOf_ } = await import('coaia-narrative/contract');
const checkStoreOf = (file) => checkStoreOf_(readFileSync(file, 'utf8'));
const charts = (s) => [...s.entities.values()].filter((e) => e.entityType === 'structural_tension_chart');

try {
  console.log('\n📋 importing the writer starts nothing');
  const probe = spawnSync(process.execPath, ['--input-type=module', '-e', "await import('coaia-narrative/writer'); console.log('imported')"], { encoding: 'utf8', timeout: 20000 });
  check('the import returns at once and prints only what the caller printed', probe.status === 0 && probe.stdout.trim() === 'imported', `${probe.status} ${probe.stdout} ${probe.stderr}`);

  console.log('\n📋 an opened issue becomes one chart, its task list the action steps');
  const file = join(dir, 'jgwill-dummass.jsonl');
  const m = new KnowledgeGraphManager(file);
  const body = 'Some context.\n\n- [ ] Write the README\n- [x] Choose the name\n* [ ] Publish 0.1.0\n';
  const r1 = await recordGithubIssueEvent(m, githubIssueEventFromPayload(raw('opened', { body })));
  let s = store(file);
  const chart = getChartEntity(s, r1.chartId);
  check('created, and reported as created', r1.created === true && r1.changes.includes('created'));
  check('the title is the desired outcome', getDesiredOutcome(s, r1.chartId)?.observations[0] === 'Publish the dummass package');
  check('the chart records its issue', JSON.stringify(chart?.metadata?.github?.issue) === JSON.stringify({ owner: 'jgwill', repo: 'dummass', number: 7, url: 'https://github.com/jgwill/dummass/issues/7' }), JSON.stringify(chart?.metadata?.github));
  const steps = getFlatActionSteps(s, r1.chartId);
  check('three task-list items are three action steps, in order', steps.map((x) => x.observations[0]).join('|') === 'Write the README|Choose the name|Publish 0.1.0', steps.map((x) => x.observations[0]).join('|'));
  check('the checked item is already complete', steps.filter((x) => x.metadata?.completionStatus === true).map((x) => x.observations[0]).join() === 'Choose the name');
  check('one checked item does not complete the whole chart', chart?.metadata?.completionStatus !== true, JSON.stringify(chart?.metadata));
  check('the completed step flows into its own chart\'s current reality', getCurrentReality(s, r1.chartId)?.observations.includes('Completed: Choose the name'));
  check('current reality says who opened it and when', /jgwill\/dummass#7 was opened by @jgwill on 2026-09-28/.test(getCurrentReality(s, r1.chartId)?.observations.join(' ') ?? ''));
  check('the store reads cleanly through the contract', s.skipped === 0);

  console.log('\n📋 later events land on the same chart');
  const r2 = await recordGithubIssueEvent(m, githubIssueEventFromPayload(raw('labeled', { body }, { label: { name: 'good first issue' } })));
  s = store(file);
  check('no second chart', charts(s).length === 1 && r2.chartId === r1.chartId && !r2.created);
  check('a dated line naming the label and who applied it', getCurrentReality(s, r1.chartId)?.observations.some((o) => /labeled good first issue by @jgwill/.test(o)));
  const said = { commentText: 'include' };
  await recordGithubIssueEvent(m, githubIssueEventFromPayload(raw('created', { body }, { comment: { id: 501, user: { login: 'miette' }, body: 'The README needs   a section\non install.', created_at: '2026-09-29T10:00:00Z' } })), said);
  s = store(file);
  check('with commentText include, a comment becomes an observation with its words', getCurrentReality(s, r1.chartId)?.observations.includes('2026-09-29: @miette commented on jgwill/dummass#7: "The README needs a section on install."'), JSON.stringify(getCurrentReality(s, r1.chartId)?.observations.slice(-1)));
  await recordGithubIssueEvent(m, githubIssueEventFromPayload(raw('edited', { body }, { comment: { id: 501, user: { login: 'miette' }, body: 'The README needs an install section.', created_at: '2026-09-29T10:00:00Z', updated_at: '2026-09-29T11:00:00Z' } })), said);
  s = store(file);
  let obs = getCurrentReality(s, r1.chartId)?.observations ?? [];
  check('an edit replaces the earlier words, and is told apart from an issue edit', obs.some((o) => /@miette edited a comment on jgwill\/dummass#7: "The README needs an install section."/.test(o)) && !obs.some((o) => o.includes('a section on install')) && getDesiredOutcome(s, r1.chartId)?.observations[0] === 'Publish the dummass package', JSON.stringify(obs.slice(-2)));
  await recordGithubIssueEvent(m, githubIssueEventFromPayload(raw('deleted', { body }, { comment: { id: 501, user: { login: 'miette' }, body: 'The README needs an install section.' } })), said);
  obs = getCurrentReality(store(file), r1.chartId)?.observations ?? [];
  check('a deletion takes the words out and says so', !readFileSync(file, 'utf8').includes('install section') && obs.some((o) => /a comment by @miette on jgwill\/dummass#7 was deleted/.test(o)));
  await recordGithubIssueEvent(m, githubIssueEventFromPayload(raw('created', { body }, { comment: { id: 502, user: { login: 'ava' }, body: 'secret words' } })));
  check('by default only the author is recorded, never the words', !readFileSync(file, 'utf8').includes('secret words') && getCurrentReality(store(file), r1.chartId)?.observations.some((o) => /@ava commented on jgwill\/dummass#7\.$/.test(o)));
  const longer = 'x'.repeat(598) + '🧠 and more';
  await recordGithubIssueEvent(m, githubIssueEventFromPayload(raw('created', { body }, { comment: { id: 503, user: { login: 'ava' }, body: longer } })), said);
  const lastLine = (getCurrentReality(store(file), r1.chartId)?.observations ?? []).at(-1) ?? '';
  check('a clip never halves an emoji', !/[\ud800-\udbff](?![\udc00-\udfff])/.test(lastLine) && lastLine.includes('…'), lastLine.slice(-12));
  const notAComment = githubIssueEventFromPayload(raw('edited', { body }, { comment: {} }));
  check('an empty comment key does not turn an issue edit into a comment edit', notAComment?.action === 'edited');

  console.log('\n📋 an edit carries a new title and a changed task list');
  const edited = 'Some context.\n\n- [x] Write the README\n- [x] Choose the name\n* [ ] Publish 0.1.0\n- [ ] Announce it\n';
  const r3 = await recordGithubIssueEvent(m, githubIssueEventFromPayload(raw('edited', { title: 'Release dummass 0.1.0 on npm', body: edited })));
  s = store(file);
  check('the desired outcome follows the title', getDesiredOutcome(s, r1.chartId)?.observations[0] === 'Release dummass 0.1.0 on npm' && r3.changes.includes('outcome-updated'));
  const after = getFlatActionSteps(s, r1.chartId);
  check('a new task-list item becomes a fourth step', after.length === 4 && after[3].observations[0] === 'Announce it', after.map((x) => x.observations[0]).join('|'));
  check('a newly checked item is completed', after.find((x) => x.observations[0] === 'Write the README')?.metadata?.completionStatus === true);

  console.log('\n📋 closing resolves the chart, reopening makes it active');
  await recordGithubIssueEvent(m, githubIssueEventFromPayload(raw('closed', { body: edited })));
  check('closed → resolved', getChartEntity(store(file), r1.chartId)?.metadata?.status === 'resolved');
  await recordGithubIssueEvent(m, githubIssueEventFromPayload(raw('reopened', { body: edited })));
  check('reopened → active', getChartEntity(store(file), r1.chartId)?.metadata?.status === 'active');

  console.log('\n📋 a problem-framed title is kept and flagged, never refused');
  const fix = await recordGithubIssueEvent(m, githubIssueEventFromPayload(raw('opened', { number: 8, title: 'fix: remove the stale build step', html_url: 'https://github.com/jgwill/dummass/issues/8' })));
  s = store(file);
  const fixChart = getChartEntity(s, fix.chartId);
  check('a chart is created for it', fix.created && getDesiredOutcome(s, fix.chartId)?.observations[0] === 'fix: remove the stale build step');
  check('its framing is marked for someone to reframe', JSON.stringify(fixChart?.metadata?.orientation) === JSON.stringify({ framing: 'problem-solving', words: ['fix', 'remove'] }), JSON.stringify(fixChart?.metadata?.orientation));
  await recordGithubIssueEvent(m, githubIssueEventFromPayload(raw('edited', { number: 8, title: 'A build with only the steps it needs', html_url: 'https://github.com/jgwill/dummass/issues/8' })));
  check('a reframed title clears the mark', getChartEntity(store(file), fix.chartId)?.metadata?.orientation === undefined);
  let refused = null;
  try { await m.createStructuralTensionChart('fix the thing', 'nothing yet', '2026-12-01T00:00:00Z'); } catch (err) { refused = err; }
  check('a chart written by hand is still refused and taught', refused && /CREATIVE ORIENTATION REQUIRED/.test(refused.message));

  console.log("\n📋 Miadi's flattened payload reads the same, and a pull request is not an issue");
  const etl = githubIssueEventFromPayload({ eventType: 'issues.opened', action: 'opened', repository: { fullName: 'jgwill/dummass' }, issue: { number: 9, title: 'Document the CLI', body: '- [ ] usage', author: 'miette', url: 'https://github.com/jgwill/dummass/issues/9', labels: [], assignees: [] } });
  check('the ETL shape is understood', etl?.repository === 'jgwill/dummass' && etl?.issue.author === 'miette' && etl?.action === 'opened', JSON.stringify(etl));
  check('a pull request yields nothing', githubIssueEventFromPayload({ action: 'opened', repository: { full_name: 'a/b' }, issue: { number: 1, title: 'x', pull_request: {} } }) === null);
  check('the task list parser takes both bullets and ignores prose', JSON.stringify(parseTaskList('- [ ] a\ntext\n* [X] b')) === JSON.stringify([{ title: 'a', done: false }, { title: 'b', done: true }]));

  console.log('\n📋 an issue that talks about tool calls still gets its chart');
  const talk = await recordGithubIssueEvent(m, githubIssueEventFromPayload(raw('opened', {
    number: 10, title: 'Explain why <invoke> tags leak into observations', html_url: 'https://github.com/jgwill/dummass/issues/10',
    body: '- [ ] Show a </parameter> example\n- [ ] Same item\n',
  })));
  s = store(file);
  check('created, with the bracket of the tag written as ‹', talk.created && getDesiredOutcome(s, talk.chartId)?.observations[0] === 'Explain why ‹invoke> tags leak into observations', getDesiredOutcome(s, talk.chartId)?.observations[0]);
  check('its task item too', getFlatActionSteps(s, talk.chartId)[0]?.observations[0] === 'Show a ‹/parameter> example', getFlatActionSteps(s, talk.chartId)[0]?.observations[0]);
  const twice = await recordGithubIssueEvent(m, githubIssueEventFromPayload(raw('edited', {
    number: 10, title: 'Explain why <invoke> tags leak into observations', html_url: 'https://github.com/jgwill/dummass/issues/10',
    body: '- [ ] Show a </parameter> example\n- [ ] Same item\n- [ ] New one\n- [ ] New one\n',
  })));
  check('two new items with one title become one step', getFlatActionSteps(store(file), talk.chartId).length === 3, JSON.stringify(twice));

  console.log('\n📋 a sub-issue is a telescoped chart');
  const subFile = join(dir, 'sub.jsonl');
  const sm = new KnowledgeGraphManager(subFile);
  const parentEv = await recordGithubIssueEvent(sm, githubIssueEventFromPayload(raw('opened', { number: 20, title: 'Ship the session reader', html_url: 'https://github.com/jgwill/dummass/issues/20' })));
  const addRaw = {
    action: 'sub_issue_added', repository: { full_name: 'jgwill/dummass' }, sender: { login: 'jgwill' },
    parent_issue: { number: 20, title: 'Ship the session reader', html_url: 'https://github.com/jgwill/dummass/issues/20' },
    sub_issue: { number: 21, title: 'The reader knows ceremonies from talking circles', html_url: 'https://github.com/jgwill/dummass/issues/21' },
    parent_issue_repo: { full_name: 'jgwill/dummass' }, sub_issue_repo: { full_name: 'jgwill/dummass' },
  };
  const linked = await recordGithubSubIssueEvent(sm, githubSubIssueEventFromPayload(addRaw));
  let ss = store(subFile);
  check('the parent keeps its chart, the sub-issue gets one', linked.parentChartId === parentEv.chartId && linked.changes.includes('created-child') && linked.changes.includes('linked'), JSON.stringify(linked));
  check('the contract reads the sub-issue as a child chart', getChildCharts(ss, linked.parentChartId).map((c) => c.metadata.chartId).join() === linked.childChartId);
  check('one level deeper, linked to its own issue', getChartEntity(ss, linked.childChartId)?.metadata?.level === 1 && getChartEntity(ss, linked.childChartId)?.metadata?.github?.issue?.number === 21);
  check("the parent's current reality says who added it", getCurrentReality(ss, linked.parentChartId)?.observations.some((o) => /jgwill\/dummass#21 added as a sub-issue by @jgwill/.test(o)));
  const opened21 = await recordGithubIssueEvent(sm, githubIssueEventFromPayload(raw('opened', { number: 21, title: 'The reader tells ceremonies from talking circles', body: '- [ ] read the circle\n- [x] read the ceremony', html_url: 'https://github.com/jgwill/dummass/issues/21' })));
  ss = store(subFile);
  check("the sub-issue's own opened event fills in the chart the link made", opened21.chartId === linked.childChartId && !opened21.created && opened21.changes.includes('filled-in')
    && getDesiredOutcome(ss, linked.childChartId)?.observations[0] === 'The reader tells ceremonies from talking circles'
    && getFlatActionSteps(ss, linked.childChartId).length === 2 && !getChartEntity(ss, linked.childChartId)?.metadata?.stub, JSON.stringify(opened21));
  const mirror = await recordGithubSubIssueEvent(sm, githubSubIssueEventFromPayload({ ...addRaw, action: 'parent_issue_added' }));
  check('the mirror event changes nothing', mirror.changes.includes('unchanged') && getChildCharts(store(subFile), linked.parentChartId).length === 1, JSON.stringify(mirror));
  const etlSub = githubSubIssueEventFromPayload({ repository: { fullName: 'jgwill/dummass' }, sender: { login: 'jgwill' }, subIssues: { parentIssue: { number: 20, title: 'x', url: 'https://github.com/jgwill/dummass/issues/20', repo: '' }, subIssue: { number: 21, title: 'y', url: 'https://github.com/jgwill/dummass/issues/21', repo: '' } } }, 'sub_issue_removed');
  check("Miadi's flattened payload reads the same", etlSub?.parent.number === 20 && etlSub?.child.repo === 'dummass' && etlSub?.action === 'sub_issue_removed', JSON.stringify(etlSub));
  const removed = await recordGithubSubIssueEvent(sm, etlSub);
  ss = store(subFile);
  check('removing it stands the chart on its own again', removed.changes.includes('unlinked') && getChildCharts(ss, linked.parentChartId).length === 0 && getChartEntity(ss, linked.childChartId)?.metadata?.level === 0);
  // Re-parenting, then a late removal of the old link: the current parent stays.
  await recordGithubIssueEvent(sm, githubIssueEventFromPayload(raw('opened', { number: 30, title: 'Another home', html_url: 'https://github.com/jgwill/dummass/issues/30' })));
  const toFirst = { ...addRaw };
  const toSecond = { ...addRaw, parent_issue: { number: 30, title: 'Another home', html_url: 'https://github.com/jgwill/dummass/issues/30' } };
  const first = await recordGithubSubIssueEvent(sm, githubSubIssueEventFromPayload(toFirst));
  const second = await recordGithubSubIssueEvent(sm, githubSubIssueEventFromPayload(toSecond));
  await recordGithubSubIssueEvent(sm, githubSubIssueEventFromPayload({ ...toFirst, action: 'sub_issue_removed' }));
  ss = store(subFile);
  const edges = ss.relations.filter((r) => r.from === `${linked.childChartId}_desired_outcome` && r.relationType === 'advances_toward');
  check('a late removal of the old link keeps the new parent', getChartEntity(ss, linked.childChartId)?.metadata?.parentChart === second.parentChartId && first.parentChartId !== second.parentChartId);
  check('re-parenting leaves one edge, toward the new parent', edges.length === 1 && edges[0].to === `${second.parentChartId}_desired_outcome`, JSON.stringify(edges));
  const crossRepo = githubSubIssueEventFromPayload({ action: 'parent_issue_added', repository: { full_name: 'jgwill/child-repo' }, parent_issue: { number: 1, html_url: 'https://github.com/jgwill/parent-repo/issues/1' }, sub_issue: { number: 5, html_url: 'https://github.com/jgwill/child-repo/issues/5' } });
  check("an issue's repository comes from its own URL, not from the delivery", crossRepo?.parent.repo === 'parent-repo' && crossRepo?.child.repo === 'child-repo', JSON.stringify(crossRepo));
  check('an issue with no repository of its own is not guessed', githubSubIssueEventFromPayload({ action: 'sub_issue_added', repository: { full_name: 'o/r' }, parent_issue: { number: 1 }, sub_issue: { number: 5 } }) === null);

  let cycle = null;
  try { await sm.linkChildChart(linked.childChartId, linked.childChartId); } catch (err) { cycle = err; }
  check('a chart cannot be its own child', cycle && /own child/.test(cycle.message));
  check('a sub-issue store conforms', checkStoreOf(subFile).conforms);

  console.log('\n📋 charts made in one burst never share an id');
  const burst = new KnowledgeGraphManager(join(dir, 'burst.jsonl'));
  const ids = [];
  for (let i = 0; i < 4; i++) ids.push((await burst.createStructuralTensionChart(`Outcome ${i}`, 'nothing yet', '2026-12-01T00:00:00Z')).chartId);
  check('four charts, four ids, four charts in the store', new Set(ids).size === 4 && charts(store(join(dir, 'burst.jsonl'))).length === 4, ids.join(','));
  console.log('\n📋 a store says whether it follows the contract');
  const { checkStore } = await import('coaia-narrative/contract');
  const good = checkStore(readFileSync(file, 'utf8'));
  check('what the writer wrote conforms', good.conforms && good.charts === 3 && good.logShaped.length === 0, JSON.stringify(good));
  const logLines = Array.from({ length: 60 }, (_, i) => `[2026-09-${String((i % 28) + 1).padStart(2, '0')}T10:00:00Z] @stcissue triggered: Issue #${i} - t (issues.opened)`);
  const logStore = [
    { type: 'entity', name: 'c_chart', entityType: 'structural_tension_chart', observations: ['x'], metadata: { chartId: 'c' } },
    { type: 'entity', name: 'c_desired_outcome', entityType: 'desired_outcome', observations: ['Successful development'], metadata: { chartId: 'c' } },
    { type: 'entity', name: 'c_current_reality', entityType: 'current_reality', observations: logLines, metadata: { chartId: 'c' } },
  ].map((r) => JSON.stringify(r)).join('\n');
  const logCheck = checkStore(logStore);
  check('a chart holding an event log is named as log-shaped', logCheck.logShaped.join() === 'c', JSON.stringify(logCheck));
  const broken = checkStore('{"type":"entity","name":"d_chart","entityType":"structural_tension_chart","observations":["x"],"metadata":{"chartId":"d"}}\nnot json');
  check('a chart without its outcome and reality, and a foreign line, do not conform',
    !broken.conforms && broken.problems.some((p) => /no desired outcome/.test(p)) && broken.problems.some((p) => /not records/.test(p)), JSON.stringify(broken));
} finally {
  rmSync(dir, { recursive: true, force: true });
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
