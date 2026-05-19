import { promises as fs } from 'fs';
import type { Entity, JsonlRecord, KnowledgeGraph, Relation } from './types.js';

const ENTITY_TOP_LEVEL_KEYS = new Set(['type', 'name', 'entityType', 'observations', 'metadata']);
const RELATION_TOP_LEVEL_KEYS = new Set(['type', 'from', 'to', 'relationType', 'metadata']);
const NARRATIVE_BEAT_TOP_LEVEL_KEYS = new Set([
  ...ENTITY_TOP_LEVEL_KEYS,
  'narrative',
  'relational_alignment',
  'four_directions'
]);
const MUTABLE_METADATA_KEYS = new Set([
  'dueDate',
  'chartId',
  'phase',
  'completionStatus',
  'completedAt',
  'parentChart',
  'parentActionStep',
  'level',
  'createdAt',
  'updatedAt',
  'act',
  'type_dramatic',
  'universes',
  'timestamp',
  'elementsOfPerformance',
  'mmotEvaluations',
  'relationalAlignment',
  'fourDirections',
  'narrative',
  'isTelescopedChart',
  'telescopedChartId'
]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cloneJson<T>(value: T): T {
  return value === undefined ? value : JSON.parse(JSON.stringify(value));
}

function deepEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function removeUndefined<T extends Record<string, unknown>>(record: T): T {
  for (const key of Object.keys(record)) {
    if (record[key] === undefined) {
      delete record[key];
    }
  }
  return record;
}

function relationKey(relation: Pick<Relation, 'from' | 'to' | 'relationType'>): string {
  return `${relation.from}\u0000${relation.to}\u0000${relation.relationType}`;
}

function isEntityRecord(record: JsonlRecord): boolean {
  return record.type === 'entity' && typeof record.name === 'string';
}

function isLegacyNarrativeBeatRecord(record: JsonlRecord): boolean {
  return record.type === 'narrative_beat' && typeof record.name === 'string';
}

function isRelationRecord(record: JsonlRecord): boolean {
  return record.type === 'relation' &&
    typeof record.from === 'string' &&
    typeof record.to === 'string' &&
    typeof record.relationType === 'string';
}

function normalizeLegacyNarrativeBeat(record: JsonlRecord): Entity {
  const metadata = {
    ...(isObject(record.metadata) ? record.metadata : {}),
    narrative: isObject(record.metadata) && record.metadata.narrative !== undefined
      ? record.metadata.narrative
      : record.narrative,
    relationalAlignment: isObject(record.metadata) && record.metadata.relationalAlignment !== undefined
      ? record.metadata.relationalAlignment
      : record.relational_alignment,
    fourDirections: isObject(record.metadata) && record.metadata.fourDirections !== undefined
      ? record.metadata.fourDirections
      : record.four_directions
  };

  return removeUndefined({
    ...record,
    type: 'narrative_beat',
    name: record.name as string,
    entityType: 'narrative_beat',
    observations: Array.isArray(record.observations) ? record.observations as string[] : [],
    metadata: removeUndefined(metadata)
  }) as Entity;
}

function mergePreservedMetadata(
  originalMetadata: unknown,
  currentMetadata: unknown
): Record<string, unknown> | undefined {
  if (!isObject(originalMetadata) && !isObject(currentMetadata)) {
    return undefined;
  }

  const merged: Record<string, unknown> = {
    ...(isObject(currentMetadata) ? currentMetadata : {})
  };

  if (isObject(originalMetadata)) {
    for (const [key, value] of Object.entries(originalMetadata)) {
      if (!(key in merged) && (!MUTABLE_METADATA_KEYS.has(key) || key === 'github')) {
        merged[key] = cloneJson(value);
      }
    }
  }

  return merged;
}

function serializeEntity(entity: Entity, original?: JsonlRecord): JsonlRecord {
  const originalType = original?.type;
  const metadata = mergePreservedMetadata(original?.metadata, entity.metadata);

  if (originalType === 'narrative_beat') {
    const record: JsonlRecord = {
      ...original,
      type: 'narrative_beat',
      name: entity.name,
      observations: entity.observations
    };

    if ('entityType' in (original || {})) {
      record.entityType = entity.entityType;
    }
    if (metadata) {
      record.metadata = metadata;
    }
    if ('narrative' in (original || {}) && entity.metadata?.narrative !== undefined) {
      record.narrative = cloneJson(entity.metadata.narrative);
    }
    if ('relational_alignment' in (original || {}) && entity.metadata?.relationalAlignment !== undefined) {
      record.relational_alignment = cloneJson(entity.metadata.relationalAlignment);
    }
    if ('four_directions' in (original || {}) && entity.metadata?.fourDirections !== undefined) {
      record.four_directions = cloneJson(entity.metadata.fourDirections);
    }

    return removeUndefined(record);
  }

  return removeUndefined({
    ...original,
    ...entity,
    type: 'entity',
    metadata
  });
}

function serializeRelation(relation: Relation, original?: JsonlRecord): JsonlRecord {
  return removeUndefined({
    ...original,
    ...relation,
    type: 'relation',
    metadata: mergePreservedMetadata(original?.metadata, relation.metadata)
  });
}

function findRecord(records: JsonlRecord[], key: string): JsonlRecord | undefined {
  return records.find((record) => {
    if ((isEntityRecord(record) || isLegacyNarrativeBeatRecord(record)) && record.name === key) {
      return true;
    }
    if (isRelationRecord(record)) {
      return relationKey(record as unknown as Relation) === key;
    }
    return false;
  });
}

function validateRecordPreservation(
  beforeRecords: JsonlRecord[] | undefined,
  afterRecords: JsonlRecord[],
  graph: KnowledgeGraph
): void {
  if (!beforeRecords || beforeRecords.length === 0) {
    return;
  }

  const currentEntityNames = new Set(graph.entities.map((entity) => entity.name));
  const currentRelationKeys = new Set(graph.relations.map((relation) => relationKey(relation)));
  const failures: string[] = [];

  for (const before of beforeRecords) {
    if (isEntityRecord(before) || isLegacyNarrativeBeatRecord(before)) {
      const name = before.name as string;
      if (!currentEntityNames.has(name)) {
        continue;
      }

      const after = findRecord(afterRecords, name);
      if (!after) {
        failures.push(`${name}: record missing after write`);
        continue;
      }

      if (before.type === 'narrative_beat' && after.type !== 'narrative_beat') {
        failures.push(`${name}: legacy narrative_beat record type was flattened`);
      }

      const knownKeys = before.type === 'narrative_beat'
        ? NARRATIVE_BEAT_TOP_LEVEL_KEYS
        : ENTITY_TOP_LEVEL_KEYS;
      for (const key of Object.keys(before)) {
        if (!knownKeys.has(key) && !deepEqual(before[key], after[key])) {
          failures.push(`${name}: top-level extension field "${key}" was not preserved`);
        }
      }

      validateMetadata(name, before.metadata, after.metadata, failures);
    }

    if (isRelationRecord(before)) {
      const key = relationKey(before as unknown as Relation);
      if (!currentRelationKeys.has(key)) {
        continue;
      }

      const after = findRecord(afterRecords, key);
      if (!after) {
        failures.push(`${key}: relation missing after write`);
        continue;
      }

      for (const topLevelKey of Object.keys(before)) {
        if (!RELATION_TOP_LEVEL_KEYS.has(topLevelKey) && !deepEqual(before[topLevelKey], after[topLevelKey])) {
          failures.push(`${key}: relation extension field "${topLevelKey}" was not preserved`);
        }
      }

      validateMetadata(key, before.metadata, after.metadata, failures);
    }
  }

  if (failures.length > 0) {
    throw new Error(`COAIA JSONL metadata preservation failed:\n- ${failures.join('\n- ')}`);
  }
}

function validateMetadata(
  label: string,
  beforeMetadata: unknown,
  afterMetadata: unknown,
  failures: string[]
): void {
  if (!isObject(beforeMetadata)) {
    return;
  }
  if (!isObject(afterMetadata)) {
    failures.push(`${label}: metadata object missing after write`);
    return;
  }

  for (const [key, value] of Object.entries(beforeMetadata)) {
    if (!(key in afterMetadata)) {
      failures.push(`${label}: metadata.${key} missing after write`);
      continue;
    }

    if ((key === 'github' || !MUTABLE_METADATA_KEYS.has(key)) && !deepEqual(value, afterMetadata[key])) {
      failures.push(`${label}: metadata.${key} changed unexpectedly`);
    }
  }
}

export function parseJsonlMemory(content: string): KnowledgeGraph {
  const records = content
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line) as JsonlRecord);

  const graph: KnowledgeGraph = { entities: [], relations: [], rawRecords: records };

  for (const record of records) {
    if (isEntityRecord(record)) {
      graph.entities.push(record as unknown as Entity);
    } else if (isRelationRecord(record)) {
      graph.relations.push(record as unknown as Relation);
    } else if (isLegacyNarrativeBeatRecord(record)) {
      graph.entities.push(normalizeLegacyNarrativeBeat(record));
    }
  }

  return graph;
}

export function serializeJsonlMemory(graph: KnowledgeGraph): string {
  const rawRecords = graph.rawRecords;
  const emittedEntities = new Set<string>();
  const emittedRelations = new Set<string>();
  const entitiesByName = new Map(graph.entities.map((entity) => [entity.name, entity]));
  const relationsByKey = new Map(graph.relations.map((relation) => [relationKey(relation), relation]));
  const records: JsonlRecord[] = [];

  if (rawRecords && rawRecords.length > 0) {
    for (const original of rawRecords) {
      if (isEntityRecord(original) || isLegacyNarrativeBeatRecord(original)) {
        const name = original.name as string;
        const entity = entitiesByName.get(name);
        if (entity) {
          records.push(serializeEntity(entity, original));
          emittedEntities.add(name);
        }
        continue;
      }

      if (isRelationRecord(original)) {
        const key = relationKey(original as unknown as Relation);
        const relation = relationsByKey.get(key);
        if (relation) {
          records.push(serializeRelation(relation, original));
          emittedRelations.add(key);
        }
        continue;
      }

      records.push(original);
    }
  }

  for (const entity of graph.entities) {
    if (!emittedEntities.has(entity.name)) {
      records.push(serializeEntity(entity));
    }
  }

  for (const relation of graph.relations) {
    const key = relationKey(relation);
    if (!emittedRelations.has(key)) {
      records.push(serializeRelation(relation));
    }
  }

  validateRecordPreservation(rawRecords, records, graph);

  return `${records.map((record) => JSON.stringify(record)).join('\n')}\n`;
}

export async function readJsonlMemoryFile(memoryFilePath: string): Promise<KnowledgeGraph> {
  try {
    return parseJsonlMemory(await fs.readFile(memoryFilePath, 'utf-8'));
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { entities: [], relations: [], rawRecords: [] };
    }
    throw error;
  }
}

export async function writeJsonlMemoryFile(memoryFilePath: string, graph: KnowledgeGraph): Promise<void> {
  await fs.writeFile(memoryFilePath, serializeJsonlMemory(graph), 'utf-8');
}
