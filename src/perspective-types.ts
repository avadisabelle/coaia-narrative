/**
 * COAIA Narrative - Perspective types of a narrative beat
 *
 * A narrative beat records one event as three perspectives read it: the engineer
 * perspective (structure and consequence), the ceremony perspective (relationship
 * and accountability) and the story_engine perspective (arc and meaning).
 *
 * Beats written before 0.17 stored this list under `metadata.universes` with the
 * values `engineer-world`, `ceremony-world` and `story-engine-world`. Those records
 * keep that key: the preservation check in jsonl-preservation.ts fails any rewrite
 * that drops a key a record already had. New beats are written with
 * `metadata.perspective_types` and the bare values. Every reader goes through
 * `readPerspectiveTypes`, so both forms read the same.
 *
 * Pure module: no I/O, no imports.
 */

export const PERSPECTIVE_TYPES = ['engineer', 'ceremony', 'story_engine'] as const;

export type PerspectiveType = (typeof PERSPECTIVE_TYPES)[number];

/** Values written before 0.17, mapped to the value written now. */
const LEGACY_PERSPECTIVE_VALUES: Record<string, PerspectiveType> = {
  'engineer-world': 'engineer',
  'ceremony-world': 'ceremony',
  'story-engine-world': 'story_engine'
};

/**
 * Map one value to its stored form. Legacy `-world` values become the bare value.
 * Any other string passes through unchanged: the list has never been an enum, and
 * a caller's own value is not dropped.
 */
export function normalizePerspectiveType(value: string): string {
  const trimmed = value.trim();
  return LEGACY_PERSPECTIVE_VALUES[trimmed] ?? trimmed;
}

/** Normalize a list of values, dropping empty strings and repeats. */
export function normalizePerspectiveTypes(values: readonly unknown[]): string[] {
  const result: string[] = [];
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const normalized = normalizePerspectiveType(value);
    if (normalized && !result.includes(normalized)) result.push(normalized);
  }
  return result;
}

/**
 * The perspective types of a stored beat. Reads `perspective_types` first and falls
 * back to the pre-0.17 `universes` key. Legacy `-world` values come back bare.
 */
export function readPerspectiveTypes(metadata: unknown): string[] {
  if (typeof metadata !== 'object' || metadata === null) return [];
  const record = metadata as { perspective_types?: unknown; universes?: unknown };
  const values = Array.isArray(record.perspective_types)
    ? record.perspective_types
    : Array.isArray(record.universes)
      ? record.universes
      : [];
  return normalizePerspectiveTypes(values);
}
