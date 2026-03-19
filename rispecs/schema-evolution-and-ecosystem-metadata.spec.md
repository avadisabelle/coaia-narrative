# RISPEC: Schema Evolution — Typed Ecosystem Metadata for PDE, Planning, and Accountability

> Evolving coaia-narrative's EntityMetadata from a flat bag of ad-hoc fields into a typed, ecosystem-aware schema that preserves provenance, accountability, and cross-system linking.

**Author**: Mia (Recursive DevOps Architect)  
**Status**: Proposal  
**Priority**: High  
**Affects**: coaia-narrative, coaia-pde, coaia-planning, coaia-visualizer, Miadi-18

---

## Current Reality

1. **EntityMetadata is flat and ad-hoc.** The `EntityMetadata` interface in `coaia-narrative/src/types.ts` mixes 14+ optional fields from different domains (STC lifecycle, narrative beats, MMOT evaluations, Four Directions, relational alignment) into a single flat interface. There is no structural grouping by origin or purpose.

2. **PDE metadata is scattered across ad-hoc fields.** `coaia-pde/src/types.ts` extends EntityMetadata with `pdeId?: string`, `direction?: string`, `confidence?: number`, `implicit?: boolean` — all top-level, with no namespace distinguishing PDE-sourced metadata from planning-sourced or manual metadata. The `pdeId` field on a chart entity is indistinguishable in shape from any other string field.

3. **Planning metadata uses untyped conventions.** `coaia-planning` writes `source: 'pde_decomposition'` as a flat string and `order: number`, `canTelescope: boolean` as top-level fields. These are `Record<string, unknown>` in its STCEntity type — no type safety at all.

4. **Accountability/Responsibility have a rispec but no schema.** The `accountability-responsibility-distinction.rispec.md` defines detailed YAML schemas for chart-level accountability and action-step-level responsibility, but `EntityMetadata` in `types.ts` contains neither. Every project that needs accountability must invent its own metadata pattern.

5. **Direction casing is inconsistent.** coaia-narrative uses `'South' | 'East' | 'West' | 'North'` (in `mmotEvaluations`), while coaia-pde uses `'east' | 'south' | 'west' | 'north'` (lowercase). No canonical `Direction` type exists.

6. **No source provenance.** When an entity appears in a JSONL file, there is no standard way to determine which tool created it — coaia-narrative's MCP tools, coaia-pde's STC mapper, coaia-planning's plan-to-STC converter, or manual creation.

7. **Consuming projects mirror types independently.** Miadi-18 maintains local type mirrors at `lib/coaia/`; coaia-pde copies Entity/Relation interfaces into its own `types.ts`. Schema drift is managed by convention, not enforcement.

---

## Desired Result

coaia-narrative's `EntityMetadata` evolves to include **typed sub-objects** for each metadata domain — PDE provenance, planning provenance, accountability/responsibility, and source system — so that any COAIA tool can inspect entity metadata with full type safety, no generic `Record<string, unknown>` parsing, and zero breaking changes to existing JSONL files.

---

## Canonical Direction Type

Before the sub-object extensions, establish a single canonical direction union:

```typescript
/**
 * Canonical Four Directions type.
 * Uppercase matches Medicine Wheel ceremony convention.
 * coaia-pde's lowercase values must be normalized on write.
 */
export type Direction = 'EAST' | 'SOUTH' | 'WEST' | 'NORTH';
```

**Migration note**: coaia-pde currently writes lowercase `'east'|'south'|'west'|'north'`. The `stc-mapper.ts` should normalize to uppercase on entity creation. Existing JSONL with lowercase values remains parseable — consumers should accept both casings during transition, normalizing on read.

**Impact on existing fields**: The `mmotEvaluations[].direction` field currently uses `'South'|'East'|'West'|'North'` (title-case). This should migrate to the canonical `Direction` type. Since it's already close to uppercase, the transition is minimal.

---

## Proposed Schema Extensions

### 1. PDE Provenance — `metadata.pde`

Replaces the current flat `pdeId`, `direction`, `confidence`, `implicit` fields with a structured sub-object.

```typescript
interface PdeProvenance {
  /** UUID of the PDE decomposition that produced this entity */
  decompositionId: string;

  /** Index within the decomposition's secondary intents or actionStack */
  facetIndex?: number;

  /** Which Medicine Wheel direction this entity was classified under */
  direction?: Direction;

  /** Whether this was an implicit intent extracted by PDE (hedging language) */
  implicitIntent?: boolean;

  /** Confidence score from PDE extraction (0-1) */
  confidence?: number;

  /** Fragment of the original prompt that produced this facet */
  originalPromptFragment?: string;

  /** PDE urgency classification that determined chart dueDate */
  urgency?: 'immediate' | 'session' | 'persistent';
}
```

**Rationale**: Currently `pdeId` sits at root level indistinguishable from `chartId`. Grouping under `pde.*` makes provenance queries trivial: "show me all entities from PDE decomposition X" = `entity.metadata?.pde?.decompositionId === X`.

**What moves**: `pdeId` → `pde.decompositionId`; `direction` → `pde.direction` (for PDE-sourced entities only; action-step direction stays at root for non-PDE entities); `implicit` → `pde.implicitIntent`; `confidence` → `pde.confidence` (for PDE-sourced entities).

### 2. Plan Provenance — `metadata.plan`

Gives coaia-planning type-safe fields instead of `Record<string, unknown>`.

```typescript
interface PlanProvenance {
  /** Identifier for the plan (typically file path or generated UUID) */
  planId: string;

  /** Which STC component this entity maps to in the source plan */
  sectionType?: 'desired_outcome' | 'current_reality' | 'action_step' | 'observation';

  /** Parser confidence in the structural classification (0-1) */
  confidence?: number;

  /** Source line range in the plan markdown */
  sourceLines?: { start: number; end: number };

  /** Bidirectional sync state between plan markdown and chart JSONL */
  syncState?: 'synced' | 'diverged' | 'conflict';

  /** Last successful sync timestamp (ISO 8601) */
  lastSyncAt?: string;

  /** Whether this action step can telescope into a sub-plan */
  canTelescope?: boolean;

  /** Display order within the plan's action steps */
  order?: number;
}
```

**Rationale**: coaia-planning currently writes `source: 'pde_decomposition'`, `order`, `canTelescope`, and `confidence` as flat unknown fields. Structuring them under `plan.*` enables type-safe sync workflows and lets coaia-visualizer render sync badges.

### 3. Accountability & Responsibility — `metadata.accountability`

Promotes the `accountability-responsibility-distinction.rispec.md` schema into the type system.

```typescript
interface AccountabilityMetadata {
  /**
   * Chart-level: who is accountable for the desired outcome.
   * Accountability is singular and cannot be delegated.
   */
  accountableEntity?: string;
  accountableEntityType?: 'human' | 'ai_companion' | 'sub_agent' | 'team_lead';
  accountabilityAcceptedAt?: string;
  accountabilityContext?: string;

  /**
   * Action-step-level: who is responsible for performing this step.
   * Responsibility can be shared and delegated.
   */
  responsibleEntities?: string[];
  responsibilityType?: 'human' | 'ai_companion' | 'sub_agent' | 'team' | 'pair';
  delegatedFrom?: string;
  delegatedAt?: string;

  /** Which Medicine Wheel direction governs this accountability relationship */
  direction?: Direction;
}
```

**Design decision**: Accountability and responsibility are combined into one sub-object (not separate `accountability` and `responsibility` objects) because they form a single governance context per entity. The rispec's chart-level vs. action-step-level distinction is maintained by which fields are populated — charts populate `accountableEntity*`, action steps populate `responsibleEntities*`.

**Backward compatibility with `assignedTo`**: The existing `assignedTo` field (from `action-step-accountability.rispec.md`) remains as a shorthand. When both exist, `accountability.responsibleEntities` takes precedence.

### 4. Source System — `metadata.source`

Enables provenance tracking across the ecosystem.

```typescript
interface SourceProvenance {
  /** Which COAIA tool/system created this entity */
  system: 'coaia-narrative' | 'coaia-pde' | 'coaia-planning' | 'mcp-pde' | 'manual' | 'miadi';

  /** Version of the source system at creation time */
  version?: string;

  /** Specific MCP tool name that created this entity (e.g., 'create_structural_tension_chart') */
  toolName?: string;

  /** Session or trace identifier from the source system */
  sessionId?: string;

  /** ISO 8601 timestamp of entity creation in the source system */
  createdAt?: string;
}
```

**Rationale**: When coaia-visualizer renders a chart, it currently cannot distinguish "created by agent via MCP" from "imported from PDE" from "parsed from Claude plan." The `source` sub-object makes this trivial.

---

## Complete Extended EntityMetadata Interface

```typescript
export interface EntityMetadata {
  // ==================== Existing Fields (preserved) ====================
  dueDate?: string;
  chartId?: string;
  phase?: 'germination' | 'assimilation' | 'completion';
  completionStatus?: boolean;
  parentChart?: string;
  parentActionStep?: string;
  level?: number;
  createdAt?: string;
  updatedAt?: string;
  act?: number;
  type_dramatic?: string;
  universes?: string[];
  timestamp?: string;
  elementsOfPerformance?: Array<{
    description: string;
    type: 'DESIGN' | 'EXECUTION';
  }>;
  mmotEvaluations?: Array<{
    phase: 'acknowledge' | 'analyze' | 'update' | 'recommit';
    assessment: string;
    direction?: Direction;  // migrated from 'South'|'East'|'West'|'North'
    timestamp: string;
  }>;
  relationalAlignment?: {
    assessed: boolean;
    score: number | null;
    principles: string[];
  };
  fourDirections?: {
    north_vision: string | null;
    east_intention: string | null;
    south_emotion: string | null;
    west_introspection: string | null;
  };
  narrative?: {
    description: string;
    prose: string;
    lessons: string[];
  };

  // ==================== New: Ecosystem Metadata ====================

  /** PDE provenance — populated by coaia-pde when transforming DecompositionResult → STC */
  pde?: PdeProvenance;

  /** Plan provenance — populated by coaia-planning when transforming plan markdown → STC */
  plan?: PlanProvenance;

  /** Accountability/responsibility — chart-level and action-step-level governance */
  accountability?: AccountabilityMetadata;

  /** Source system — which tool/system created this entity */
  source?: SourceProvenance;

  // ==================== Deprecated (backward-compatible) ====================
  // These flat fields are superseded by structured sub-objects above.
  // They remain valid for backward compatibility; consumers should
  // prefer the structured form when both exist.

  /** @deprecated Use pde.decompositionId instead */
  pdeId?: string;
  /** @deprecated Use pde.implicitIntent instead (for PDE-sourced entities) */
  implicit?: boolean;
  /** @deprecated Use pde.confidence or plan.confidence instead */
  confidence?: number;
  /** @deprecated Use pde.direction instead (for PDE-sourced entities) */
  direction?: string;
}
```

---

## Extended Relation Metadata

The `Relation` interface also needs extension for accountability relations:

```typescript
export interface Relation {
  from: string;
  to: string;
  relationType: string;
  metadata?: {
    createdAt?: string;
    strength?: number;
    context?: string;
    description?: string;
    /** Source system that created this relation */
    source?: SourceProvenance;
  };
}
```

### New Relation Types

| relationType | From → To | Purpose |
|---|---|---|
| `accountable_for` | accountable entity → chart | Singular, non-delegatable ownership |
| `responsible_for` | responsible entity → action_step | Can be multiple per step |
| `delegated_to` | delegator → responsible entity | Delegation chain |
| `reports_to` | responsible entity → accountable entity | Accountability line |

---

## Migration Strategy

### Phase 1: Type Extension (This Proposal)
- Add `Direction` type, `PdeProvenance`, `PlanProvenance`, `AccountabilityMetadata`, `SourceProvenance` interfaces
- Add optional `pde?`, `plan?`, `accountability?`, `source?` fields to `EntityMetadata`
- Mark deprecated fields with `@deprecated` JSDoc
- **Zero breaking changes** — all new fields are optional

### Phase 2: Producer Adoption
- `coaia-pde/src/stc-mapper.ts`: populate `pde.*` sub-object instead of flat fields; normalize direction to uppercase
- `coaia-planning/src/plan-parser.ts`: populate `plan.*` sub-object instead of `Record<string, unknown>`; populate `source.system = 'coaia-planning'`
- `coaia-narrative` MCP tools: populate `source.system = 'coaia-narrative'` and `source.toolName` on entity creation

### Phase 3: Consumer Adoption
- `coaia-visualizer`: render provenance badges (PDE, Plan, Manual), direction color-coding, sync state indicators, accountability badges
- `coaia-narrative` MCP tools: validate typed metadata on creation when sub-objects are present
- `Miadi-18/lib/coaia/`: update mirrored types to include new sub-objects

### Phase 4: Deprecation Cleanup (Future)
- Remove deprecated flat fields (`pdeId`, `implicit`, `confidence`, `direction` at root level)
- Consumers migrate to structured form
- JSONL migration script normalizes existing files

### Backward Compatibility Guarantees
- **Existing JSONL files remain valid.** All new fields are `?` optional. A JSONL entity from before this extension parses without error.
- **Existing code keeps working.** Flat `pdeId`, `direction`, etc. remain on the interface with `@deprecated` annotations. No compile errors.
- **Dual-read pattern.** During transition, consumers read `entity.metadata?.pde?.decompositionId ?? entity.metadata?.pdeId` to handle both old and new shapes.
- **Version tracking.** The `source.version` field lets consumers detect which schema generation produced an entity.

---

## Impact on Ecosystem

### coaia-narrative (schema authority)
- Owns the canonical type definitions
- MCP tools populate `source.system = 'coaia-narrative'` on creation
- Validation logic can type-check sub-objects when present
- JSONL storage unchanged — sub-objects serialize as nested JSON

### coaia-pde (PDE producer)
- Populates `pde.*` with decomposition provenance
- Normalizes direction to canonical `Direction` type (uppercase)
- Sets `source.system = 'coaia-pde'` on all entities it creates
- Stops writing flat `pdeId`/`implicit`/`confidence` (Phase 2)

### coaia-planning (plan producer)
- Populates `plan.*` with parsing metadata (confidence, sourceLines, syncState)
- Sets `source.system = 'coaia-planning'` on all entities
- `sync_plan_to_chart` / `sync_chart_to_plan` use `plan.syncState` and `plan.lastSyncAt`
- Replaces `Record<string, unknown>` STCEntity metadata with typed fields

### coaia-visualizer (consumer)
- Renders provenance badges: 🔬 PDE, 📋 Plan, ✍️ Manual, 🤖 Agent
- Direction color-coding uses canonical `Direction` type and `DIRECTION_META` colors
- Sync state indicators (✅ synced, ⚠️ diverged, ❌ conflict) from `plan.syncState`
- Accountability badges on chart headers; responsibility grouping on action steps
- Confidence meters on entities with `pde.confidence` or `plan.confidence`

### Miadi-18 (submodule consumer)
- Updates `lib/coaia/` type mirrors to include new sub-objects
- Can populate `source.system = 'miadi'` for webhook-triggered entities

---

## Quality Criteria

- [ ] Zero breaking changes to existing JSONL files — any entity created before this extension still parses correctly
- [ ] All new fields are independently optional — `pde`, `plan`, `accountability`, `source` can each be omitted
- [ ] TypeScript compiler catches type errors when structured sub-objects are populated incorrectly
- [ ] Canonical `Direction` type is used consistently across all sub-objects
- [ ] Deprecated field annotations guide consumers toward structured form
- [ ] Each sub-object can be adopted independently — projects don't need to implement all four at once
- [ ] Dual-read pattern documented for transition period
- [ ] Relation metadata extended for source provenance without breaking existing relations

---

## References

- [types.ts](../src/types.ts) — current EntityMetadata, Entity, Relation interfaces
- [accountability-responsibility-distinction.rispec.md](./accountability-responsibility-distinction.rispec.md) — accountability/responsibility schema proposal
- [pde-to-stc-transformation.rispec.md](/src/coaia-pde/rispecs/pde-to-stc-transformation.rispec.md) — PDE→STC field mapping
- [coaia-planning app.spec.md](/src/coaia-planning/rispecs/app.spec.md) — planning parser types and metadata
- [KINSHIP.md](../KINSHIP.md) — relational context (coaia-visualizer, Miadi-18 submodule)
