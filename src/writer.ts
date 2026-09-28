/**
 * coaia-narrative/writer — writing charts from another service.
 *
 * This package owns the writes (src/contract.ts owns the reads). Until now the only
 * way to write a chart store was through the MCP server, so services that needed to
 * write one — Miadi's GitHub webhook first among them — wrote the JSONL by hand, and
 * the file drifted from what this package reads. Importing from here gives a service
 * the same writer the MCP tools use, without starting a server.
 *
 *   import { KnowledgeGraphManager, recordGithubIssueEvent } from 'coaia-narrative/writer';
 *   const manager = new KnowledgeGraphManager('/path/to/owner-repo.jsonl');
 *   await recordGithubIssueEvent(manager, githubIssueEventFromPayload(payload));
 *
 * One GitHub issue is one chart. The chart is found again by the issue it records
 * (metadata.github.issue), so every later event about that issue lands on it:
 *
 *   opened        a chart: the title as the desired outcome, the task list as action steps
 *   edited        a new title becomes the desired outcome; new task-list items become
 *                 action steps and checked ones are completed
 *   closed        the chart is resolved          reopened   the chart is active again
 *   anything else a dated line in the chart's current reality, naming who and what
 *
 * An issue's title is a person's words. When it is framed as a problem ("fix …"), the
 * chart keeps it and carries metadata.orientation instead of refusing it, so a webhook
 * never fails on wording and the framing stays visible for someone to reframe.
 */

import { KnowledgeGraphManager, detectProblemFraming } from './graph-manager.js';

export { KnowledgeGraphManager, detectProblemFraming, PROBLEM_SOLVING_WORDS } from './graph-manager.js';
export type { ChartStatus } from './graph-manager.js';
export type { Entity, Relation, KnowledgeGraph, GithubIssueRef } from './types.js';

export interface GithubIssueEvent {
  /** GitHub's action: opened, edited, closed, reopened, assigned, labeled, milestoned, created (a comment)… */
  action: string;
  /** owner/repo */
  repository: string;
  issue: {
    number: number;
    title: string;
    body?: string | null;
    url?: string | null;
    author?: string | null;
    createdAt?: string | null;
    milestone?: { title?: string | null; dueOn?: string | null } | null;
  };
  /** Who did it. */
  actor?: string | null;
  /** What the action was about: the label, the assignee, the milestone. Never a comment's text. */
  subject?: string | null;
  /** When it happened; defaults to now. */
  at?: string | null;
}

export interface GithubIssueEventResult {
  chartId: string;
  created: boolean;
  /** What was written: created, outcome-updated, steps-updated, resolved, reopened, observed, unchanged */
  changes: string[];
}

const MAX_STEPS = 25;
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** The task list of an issue body: `- [ ] item` and `- [x] item`, in order. */
export function parseTaskList(body: string | null | undefined): Array<{ title: string; done: boolean }> {
  const items: Array<{ title: string; done: boolean }> = [];
  for (const line of String(body ?? '').split('\n')) {
    const m = /^\s*[-*]\s+\[([ xX])\]\s+(.+?)\s*$/.exec(line);
    if (m && m[2].trim()) items.push({ title: clip(m[2].trim(), 200), done: m[1].toLowerCase() === 'x' });
    if (items.length >= MAX_STEPS) break;
  }
  return items;
}

/**
 * Read a GitHub issues or issue_comment webhook payload, in GitHub's own shape or in
 * the flattened shape Miadi's webhook ETL produces. Returns null for anything that is
 * not about an issue (a pull request included).
 */
export function githubIssueEventFromPayload(payload: any, action?: string): GithubIssueEvent | null {
  const issue = payload?.issue;
  if (!issue || typeof issue.number !== 'number') return null;
  if (issue.pull_request || issue.isPullRequest) return null;
  const repository = payload?.repository?.full_name ?? payload?.repository?.fullName;
  if (typeof repository !== 'string' || !repository.includes('/')) return null;
  const act = action ?? payload?.action ?? String(payload?.eventType ?? '').split('.')[1];
  if (!act) return null;
  const milestone = issue.milestone ? { title: issue.milestone.title ?? null, dueOn: issue.milestone.due_on ?? issue.milestone.dueOn ?? null } : null;
  const subject =
    payload?.label?.name ??
    payload?.assignee?.login ??
    (act === 'milestoned' || act === 'demilestoned' ? payload?.milestone?.title ?? milestone?.title : null) ??
    null;
  return {
    action: act,
    repository,
    issue: {
      number: issue.number,
      title: String(issue.title ?? `Issue #${issue.number}`),
      body: issue.body ?? null,
      url: issue.html_url ?? issue.url ?? null,
      author: issue.user?.login ?? issue.author ?? null,
      createdAt: issue.created_at ?? issue.createdAt ?? null,
      milestone,
    },
    // For a comment, the person who wrote it; for everything else, who acted.
    actor: payload?.comment?.user?.login ?? payload?.comment?.author ?? payload?.sender?.login ?? null,
    subject,
    at: payload?.comment?.created_at ?? issue.updated_at ?? null,
  };
}

function dueDateFor(event: GithubIssueEvent): string {
  const due = event.issue.milestone?.dueOn;
  if (due && !Number.isNaN(Date.parse(due))) return new Date(due).toISOString();
  const from = event.issue.createdAt && !Number.isNaN(Date.parse(event.issue.createdAt)) ? Date.parse(event.issue.createdAt) : Date.now();
  return new Date(from + 30 * 24 * 3600 * 1000).toISOString();
}

const ACTION_WORDS: Record<string, string> = {
  assigned: 'assigned to',
  unassigned: 'unassigned from',
  labeled: 'labeled',
  unlabeled: 'unlabeled',
  milestoned: 'added to milestone',
  demilestoned: 'removed from milestone',
  pinned: 'pinned',
  unpinned: 'unpinned',
  locked: 'locked',
  unlocked: 'unlocked',
  transferred: 'transferred',
  created: 'commented on',
  deleted: 'deleted',
};

/**
 * Write one GitHub issue event into a chart store. The store must be the file the
 * manager was built for; the caller serialises writes to one file.
 */
export async function recordGithubIssueEvent(manager: KnowledgeGraphManager, event: GithubIssueEvent): Promise<GithubIssueEventResult> {
  const [owner, repo] = event.repository.split('/');
  const ref = `${owner}/${repo}#${event.issue.number}`;
  const title = clip(event.issue.title.trim() || `Issue #${event.issue.number}`, 300);
  const when = (event.at && !Number.isNaN(Date.parse(event.at)) ? new Date(event.at) : new Date()).toISOString();
  const day = when.slice(0, 10);
  const changes: string[] = [];

  let chartId = await manager.findChartByGithubIssue(owner, repo, event.issue.number);
  const created = !chartId;

  if (!chartId) {
    const tasks = parseTaskList(event.issue.body);
    const by = event.issue.author ? ` by @${event.issue.author}` : '';
    const opened = event.issue.createdAt && !Number.isNaN(Date.parse(event.issue.createdAt)) ? new Date(event.issue.createdAt).toISOString().slice(0, 10) : day;
    const reality = `${ref} was opened${by} on ${opened}.${tasks.length ? ` Its task list holds ${tasks.length} item(s), ${tasks.filter(t => t.done).length} checked.` : ''}`;
    const result = await manager.createStructuralTensionChart(
      title,
      reality,
      dueDateFor(event),
      tasks.map(t => t.title),
      undefined,
      ref,
      { orientation: 'flag' }
    );
    chartId = result.chartId;
    changes.push('created');
    for (const [i, t] of tasks.entries()) {
      if (t.done) await manager.markActionStepComplete(`${chartId}_action_${i + 1}`);
    }
    if (event.action === 'opened') return { chartId, created, changes };
  }

  const actor = event.actor ? `@${event.actor}` : 'someone';
  switch (event.action) {
    case 'opened':
      changes.push('unchanged');
      break;
    case 'edited': {
      const graph = await manager.readGraph();
      const outcome = graph.entities.find(e => e.name === `${chartId}_desired_outcome`);
      if (outcome && outcome.observations[0] !== title) {
        await manager.updateDesiredOutcome(chartId, title);
        const words = detectProblemFraming(title);
        await manager.updateChartMetadata(chartId, { orientation: words.length ? { framing: 'problem-solving', words } : null });
        changes.push('outcome-updated');
      }
      const steps = graph.entities.filter(e => e.entityType === 'action_step' && (e.metadata as any)?.chartId === chartId);
      const byTitle = new Map(steps.map(s => [s.observations[0], s]));
      for (const t of parseTaskList(event.issue.body)) {
        const step = byTitle.get(t.title);
        if (!step) {
          const added = await manager.appendActionStep(chartId, t.title);
          if (t.done) await manager.markActionStepComplete(added);
          changes.push('steps-updated');
        } else if (t.done && (step.metadata as any)?.completionStatus !== true) {
          await manager.markActionStepComplete(step.name);
          changes.push('steps-updated');
        }
      }
      if (!changes.length) changes.push('unchanged');
      break;
    }
    case 'closed':
      await manager.updateCurrentReality(chartId, [`${day}: ${ref} closed by ${actor}.`]);
      await manager.updateChartMetadata(chartId, { status: 'resolved' });
      changes.push('resolved');
      break;
    case 'reopened':
      await manager.updateCurrentReality(chartId, [`${day}: ${ref} reopened by ${actor}.`]);
      await manager.updateChartMetadata(chartId, { status: 'active' });
      changes.push('reopened');
      break;
    default: {
      const verb = ACTION_WORDS[event.action] ?? event.action;
      const what = event.subject ? ` ${clip(String(event.subject), 120)}` : '';
      const line = event.action === 'created'
        ? `${day}: ${actor} commented on ${ref}.`
        : `${day}: ${ref} ${verb}${what} by ${actor}.`;
      await manager.updateCurrentReality(chartId, [line]);
      changes.push('observed');
    }
  }
  return { chartId, created, changes };
}
