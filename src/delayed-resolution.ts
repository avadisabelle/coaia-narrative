/**
 * COAIA Narrative - Delayed resolution, read side
 *
 * "Part of the maturation process is to learn how to delay resolution in favor of
 * longer-term goals" (Fritz). A due date says when a step is wanted. A delayed
 * resolution says that someone chose to wait for it: who, until when, why, what the
 * wait serves, and which agent session to rehydrate when the date or an event comes.
 *
 * This module only reads. It has no I/O and imports nothing from the server, so the
 * MCP tools, the CLI and any renderer derive a step's status by one rule:
 *
 *   completed   the step is complete (a telescoped step: its chart or its desired outcome)
 *   delayed     not complete, and it carries a delay that has not ended
 *   pending     anything else
 *
 * The writes (delayResolution, endDelayedResolution) live in KnowledgeGraphManager.
 * Design: miadi-chronicle Episode 297, delayed-resolution-design-261019.md.
 */

import type { AgentSessionRef, DelayedResolution, DelayedResolutionOutcome, Entity } from './types.js';

export type { AgentSessionRef, DelayedResolution, DelayedResolutionOutcome };

export const DELAYED_RESOLUTION_OUTCOMES: readonly DelayedResolutionOutcome[] = ['rehydrated', 'released'];

export type StepStatus = 'completed' | 'delayed' | 'pending';

const DAY_MS = 24 * 60 * 60 * 1000;

type EntityLike = Pick<Entity, 'name' | 'entityType' | 'metadata'> | undefined;

const meta = (e: EntityLike): Record<string, unknown> => ((e && e.metadata) || {}) as Record<string, unknown>;

/** The record on a step, open or ended, when it carries one. */
export function delayRecordOf(e: EntityLike): DelayedResolution | undefined {
  const r = meta(e).delayedResolution;
  return r && typeof r === 'object' && !Array.isArray(r) && typeof (r as any).resolveBy === 'string'
    ? (r as DelayedResolution)
    : undefined;
}

/** The step's delay while it stands: chosen and not ended. */
export function openDelayOf(e: EntityLike): DelayedResolution | undefined {
  const r = delayRecordOf(e);
  return r && !r.endedAt ? r : undefined;
}

/**
 * A step is complete when its own mark says so. A telescoped step is named by its
 * chart's desired outcome, and mark_action_complete writes to that outcome and to
 * the chart, so either one counts.
 */
export function isStepComplete(step: EntityLike, entities: Entity[] = []): boolean {
  if (meta(step).completionStatus === true) return true;
  if (step?.entityType === 'desired_outcome') {
    const chart = entities.find(e => e.name === `${meta(step).chartId}_chart` && e.entityType === 'structural_tension_chart');
    return meta(chart).completionStatus === true;
  }
  return false;
}

/** completed, delayed or pending, read from the step the reference names. */
export function deriveStepStatus(step: EntityLike, entities: Entity[] = []): StepStatus {
  if (isStepComplete(step, entities)) return 'completed';
  if (openDelayOf(step)) return 'delayed';
  return 'pending';
}

/** Whole days until resolveBy, counted up as the CLI counts due dates. Negative once it has passed. */
export function daysRemaining(record: Pick<DelayedResolution, 'resolveBy'>, now: number = Date.now()): number {
  const days = Math.ceil((Date.parse(record.resolveBy) - now) / DAY_MS);
  return days === 0 ? 0 : days; // never -0
}

/** A delay that stands past its resolveBy is owed. */
export function isOwed(record: DelayedResolution, now: number = Date.now()): boolean {
  return !record.endedAt && Date.parse(record.resolveBy) < now;
}

/** A step as delay_resolution, end_delayed_resolution and get_action_step report it. */
export interface DelayedStepView {
  actionStepName: string;
  /** written: an action_step entity. telescoped: a sub-chart, named by its desired outcome. */
  kind: 'written' | 'telescoped';
  /** The chart this step advances. */
  chartId: string;
  /** For a telescoped step, its own sub-chart. */
  telescopedChartId?: string;
  title: string;
  dueDate?: string;
  status: StepStatus;
  delayedResolution?: DelayedResolution;
  delayedResolutionHistory: DelayedResolution[];
}

/** One line of list_delayed_resolutions. */
export interface DelayedResolutionEntry {
  actionStepName: string;
  kind: 'written' | 'telescoped';
  chartId: string;
  telescopedChartId?: string;
  title: string;
  status: StepStatus;
  resolveBy: string;
  daysRemaining: number;
  owed: boolean;
  primaryChoice: string | null;
  reason: string;
  chosenBy: string;
  chosenAt: string;
  wakeOn: string[];
  session: AgentSessionRef | null;
  endedAt?: string;
  endedBy?: string;
  outcome?: DelayedResolutionOutcome;
  endNote?: string;
}
