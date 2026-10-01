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
import { findUnparsedCallSyntax, KNOWN_ARGUMENT_NAMES } from './argument-hygiene.js';

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
  /** For a comment event (action comment.created / comment.edited / comment.deleted). */
  comment?: { id?: number | string | null; body?: string | null; url?: string | null } | null;
}

export interface RecordOptions {
  /**
   * 'author-only' (the default) records who commented and when, never what. 'include'
   * also records the comment's words, clipped, as the line of current reality; an edit
   * replaces that line and a deletion removes it, so a store never keeps words their
   * author took back. A caller opts in, because a chart store may travel further than
   * the thread it came from.
   */
  commentText?: 'include' | 'author-only';
}

const COMMENT_CHARS = 600;

export interface GithubIssueEventResult {
  chartId: string;
  created: boolean;
  /** What was written: created, outcome-updated, steps-updated, resolved, reopened, observed, unchanged */
  changes: string[];
}

const MAX_STEPS = 25;

// The store refuses text carrying tool-call tags (argument-hygiene.ts): in a chart an
// agent wrote, they mean a call that failed to parse. In a GitHub issue a person wrote,
// they are words about tool calls, and refusing them would leave that issue with no
// chart at all. So the opening bracket of those tags is written as ‹ instead: the text
// still reads the same and the guard stays exactly as strict for everything else.
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const MACHINERY = /<(?=\s*\/?\s*(?:[A-Za-z][\w.-]*:)?(?:parameter|invoke|function_calls)\b)/gi;
const CLOSING = new RegExp(`<(?=\\s*\\/\\s*(?:${KNOWN_ARGUMENT_NAMES.map(escapeRe).join('|')})\\s*>)`, 'gi');

/** A person's text, made safe to record without refusing or losing what it says. */
export function recordable(text: string): string {
  let t = text.replace(MACHINERY, '‹').replace(CLOSING, '‹');
  if (findUnparsedCallSyntax(t)) t = t.replace(/</g, '‹');
  return t;
}
// Cut on code points, so an emoji at the boundary is kept or dropped whole, never halved
// into a lone surrogate that JSON keeps and Postgres jsonb refuses.
const clip = (s: string, n: number) => {
  const points = Array.from(s);
  return points.length > n ? `${points.slice(0, n - 1).join('')}…` : s;
};

/** The task list of an issue body: `- [ ] item` and `- [x] item`, in order. */
export function parseTaskList(body: string | null | undefined): Array<{ title: string; done: boolean }> {
  const items: Array<{ title: string; done: boolean }> = [];
  for (const line of String(body ?? '').split('\n')) {
    const m = /^\s*[-*]\s+\[([ xX])\]\s+(.+?)\s*$/.exec(line);
    if (m && m[2].trim()) items.push({ title: clip(recordable(m[2].trim()), 200), done: m[1].toLowerCase() === 'x' });
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
  let act = action ?? payload?.action ?? String(payload?.eventType ?? '').split('.')[1];
  if (!act) return null;
  const comment = payload?.comment;
  // GitHub names a comment's actions created / edited / deleted, and an issue's edit is
  // also "edited": a comment event is told apart by carrying a comment.
  const isComment = !!comment && (typeof comment.body === 'string' || comment.id != null);
  if (isComment && ['created', 'edited', 'deleted'].includes(act)) act = `comment.${act}`;
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
    // GitHub dates a comment created_at / updated_at; Miadi's flattened payload calls it timestamp.
    at: (act === 'comment.edited' ? comment?.updated_at : comment?.created_at) ?? comment?.timestamp ?? issue.updated_at ?? null,
    comment: isComment ? { id: comment.id ?? null, body: comment.body ?? null, url: comment.html_url ?? comment.url ?? null } : null,
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
export async function recordGithubIssueEvent(
  manager: KnowledgeGraphManager,
  event: GithubIssueEvent,
  options: RecordOptions = {}
): Promise<GithubIssueEventResult> {
  const [owner, repo] = event.repository.split('/');
  const ref = `${owner}/${repo}#${event.issue.number}`;
  const title = clip(recordable(event.issue.title.trim()) || `Issue #${event.issue.number}`, 300);
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

  // A chart first seen through a sub-issue link knows only a number and maybe a title.
  // The issue's own event fills it in: its title, its task list, who opened it.
  const graphNow = await manager.readGraph();
  const chartNow = graphNow.entities.find(e => e.name === `${chartId}_chart`);
  if ((chartNow?.metadata as any)?.stub && ['opened', 'edited', 'reopened'].includes(event.action)) {
    const outcome = graphNow.entities.find(e => e.name === `${chartId}_desired_outcome`);
    if (outcome && outcome.observations[0] !== title) await manager.updateDesiredOutcome(chartId, title);
    const words = detectProblemFraming(title);
    await manager.updateChartMetadata(chartId, { stub: null, orientation: words.length ? { framing: 'problem-solving', words } : null });
    const have = new Set(graphNow.entities.filter(e => e.entityType === 'action_step' && (e.metadata as any)?.chartId === chartId).map(e => e.observations[0]));
    for (const t of parseTaskList(event.issue.body)) {
      if (have.has(t.title)) continue;
      const added = await manager.appendActionStep(chartId, t.title);
      if (t.done) await manager.markActionStepComplete(added);
      have.add(t.title);
    }
    const by = event.issue.author ? ` by @${event.issue.author}` : '';
    await manager.updateCurrentReality(chartId, [`${ref} was opened${by}${event.issue.createdAt && !Number.isNaN(Date.parse(event.issue.createdAt)) ? ` on ${new Date(event.issue.createdAt).toISOString().slice(0, 10)}` : ''}.`]);
    changes.push('filled-in');
    if (event.action === 'opened') return { chartId, created, changes };
  }

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
          // Two new items with one title are one step, not two.
          byTitle.set(t.title, { name: added, metadata: { completionStatus: t.done } } as any);
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
    case 'created': // a comment, when the caller passed GitHub's bare action
    case 'comment.created':
    case 'comment.edited':
    case 'comment.deleted': {
      const include = options.commentText === 'include';
      const id = event.comment?.id != null ? String(event.comment.id) : null;
      const graph = await manager.readGraph();
      const chartEntity = graph.entities.find(e => e.name === `${chartId}_chart`);
      const lines = { ...(((chartEntity?.metadata as any)?.githubComments ?? {}) as Record<string, string>) };
      const previous = id ? lines[id] : undefined;
      // An edit or a deletion takes back what was said: the earlier line goes.
      if (previous && event.action !== 'comment.created' && event.action !== 'created') {
        await manager.deleteObservations([{ entityName: `${chartId}_current_reality`, observations: [previous] }]);
      }
      let line: string;
      if (event.action === 'comment.deleted') {
        line = `${day}: a comment by ${actor} on ${ref} was deleted.`;
        if (id) delete lines[id];
      } else {
        const verb = event.action === 'comment.edited' ? 'edited a comment on' : 'commented on';
        const body = (event.comment?.body ?? '').trim();
        const said = include && body ? `: "${clip(recordable(body.replace(/\s+/g, ' ')), COMMENT_CHARS)}"` : '.';
        line = `${day}: ${actor} ${verb} ${ref}${said}`;
        if (id) lines[id] = line;
      }
      await manager.updateCurrentReality(chartId, [line]);
      if (id) await manager.updateChartMetadata(chartId, { githubComments: Object.keys(lines).length ? lines : null });
      changes.push('observed');
      break;
    }
    default: {
      const verb = ACTION_WORDS[event.action] ?? event.action;
      const what = event.subject ? ` ${clip(recordable(String(event.subject)), 120)}` : '';
      await manager.updateCurrentReality(chartId, [`${day}: ${ref} ${verb}${what} by ${actor}.`]);
      changes.push('observed');
    }
  }
  return { chartId, created, changes };
}

// ---------------------------------------------------------------------------
// Sub-issues: a GitHub sub-issue is a telescoped chart
// ---------------------------------------------------------------------------

export interface IssueBrief {
  owner: string;
  repo: string;
  number: number;
  title?: string | null;
  url?: string | null;
}

export interface GithubSubIssueEvent {
  /** sub_issue_added / sub_issue_removed, or their mirrors parent_issue_added / parent_issue_removed. */
  action: string;
  parent: IssueBrief;
  child: IssueBrief;
  actor?: string | null;
  at?: string | null;
}

export interface GithubSubIssueEventResult {
  parentChartId: string;
  childChartId: string;
  /** created-parent, created-child, linked, unlinked, unchanged */
  changes: string[];
}

const splitRepo = (full: unknown): [string, string] | null => {
  if (typeof full !== 'string' || !full.includes('/')) return null;
  const [o, r] = full.split('/');
  return o && r ? [o, r] : null;
};

/**
 * Read a GitHub sub_issues webhook payload, in GitHub's own shape
 * (parent_issue, sub_issue, parent_issue_repo, sub_issue_repo) or Miadi's flattened
 * one (subIssues.parentIssue / subIssues.subIssue). Null when it is not one.
 */
export function githubSubIssueEventFromPayload(payload: any, action?: string): GithubSubIssueEvent | null {
  const act = action ?? payload?.action;
  if (!['sub_issue_added', 'sub_issue_removed', 'parent_issue_added', 'parent_issue_removed'].includes(act)) return null;
  // An issue's repository comes from its own URL or its own fields. Guessing it from the
  // delivery would be wrong for the mirror event, whose repository is the other side's.
  const brief = (issue: any, repoFull: unknown): IssueBrief | null => {
    if (!issue) return null;
    const url = typeof issue.html_url === 'string' ? issue.html_url : typeof issue.url === 'string' ? issue.url : '';
    const fromUrl = /github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/.exec(url);
    const number = typeof issue.number === 'number' && issue.number > 0 ? issue.number : fromUrl ? Number(fromUrl[3]) : NaN;
    const repo = (fromUrl ? [fromUrl[1], fromUrl[2]] as [string, string] : null) ?? splitRepo(repoFull) ?? splitRepo(issue.repository?.full_name) ?? splitRepo(issue.repo);
    if (!repo || !Number.isInteger(number) || number <= 0) return null;
    return { owner: repo[0], repo: repo[1], number, title: issue.title ?? null, url: issue.html_url ?? issue.url ?? null };
  };
  const flat = payload?.subIssues;
  const parent = flat ? brief(flat.parentIssue, flat.parentIssue?.repo) : brief(payload?.parent_issue, payload?.parent_issue_repo?.full_name);
  const child = flat ? brief(flat.subIssue, flat.subIssue?.repo) : brief(payload?.sub_issue, payload?.sub_issue_repo?.full_name);
  if (!parent || !child) return null;
  return { action: act, parent, child, actor: payload?.sender?.login ?? null, at: null };
}

async function ensureIssueChart(manager: KnowledgeGraphManager, issue: IssueBrief, reality: string, changes: string[], label: string): Promise<string> {
  const found = await manager.findChartByGithubIssue(issue.owner, issue.repo, issue.number);
  if (found) return found;
  const ref = `${issue.owner}/${issue.repo}#${issue.number}`;
  const title = clip(recordable(String(issue.title ?? '').trim()) || `Issue ${ref}`, 300);
  const { chartId } = await manager.createStructuralTensionChart(
    title, reality, new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(), [], undefined, ref, { orientation: 'flag' }
  );
  await manager.updateChartMetadata(chartId, { stub: true });
  changes.push(label);
  return chartId;
}

/**
 * Write one sub-issue link into a chart store: the sub-issue's chart is telescoped
 * under its parent's chart (metadata.parentChart), and the parent's current reality
 * says when and by whom. Either chart is created from what the event knows when it is
 * not in this store yet. A removal undoes the telescoping. The mirror events GitHub
 * also sends (parent_issue_*) are the same act and record the same line, once.
 */
export async function recordGithubSubIssueEvent(manager: KnowledgeGraphManager, event: GithubSubIssueEvent): Promise<GithubSubIssueEventResult> {
  const changes: string[] = [];
  const day = (event.at && !Number.isNaN(Date.parse(event.at)) ? new Date(event.at) : new Date()).toISOString().slice(0, 10);
  const parentRef = `${event.parent.owner}/${event.parent.repo}#${event.parent.number}`;
  const childRef = `${event.child.owner}/${event.child.repo}#${event.child.number}`;
  const actor = event.actor ? `@${event.actor}` : 'someone';
  const adding = event.action === 'sub_issue_added' || event.action === 'parent_issue_added';

  const parentChartId = await ensureIssueChart(manager, event.parent, `${parentRef} is known here as the parent of ${childRef}, linked on ${day}.`, changes, 'created-parent');
  const childChartId = await ensureIssueChart(manager, event.child, `${childRef} is known here as a sub-issue of ${parentRef}, linked on ${day}.`, changes, 'created-child');

  if (adding) {
    const linked = await manager.linkChildChart(parentChartId, childChartId);
    await manager.updateCurrentReality(parentChartId, [`${day}: ${childRef} added as a sub-issue by ${actor}.`]);
    changes.push(linked ? 'linked' : 'unchanged');
  } else {
    const unlinked = await manager.unlinkChildChart(childChartId, parentChartId);
    await manager.updateCurrentReality(parentChartId, [`${day}: ${childRef} removed as a sub-issue by ${actor}.`]);
    changes.push(unlinked ? 'unlinked' : 'unchanged');
  }
  return { parentChartId, childChartId, changes };
}
