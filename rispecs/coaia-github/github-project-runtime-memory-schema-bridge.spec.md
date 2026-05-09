# GitHub Project Runtime-Memory Schema Bridge — RISE Proposal

> Non-breaking, additive proposal for representing GitHub Project /
> project-item synchronization metadata in coaia-narrative so that GitHub
> Projects can act as a structural-runtime-memory mirror of local STC charts.
> Spec-only. No runtime code, no schema source edits in this pass.

**Document ID**: coaia-github-runtime-memory-schema-bridge-v0.1
**Status**: Draft (proposal · spec-only)
**Last Updated**: 2026-05-09
**Framework**: RISE (Reverse-engineer · Intent-extract · Specify · Export)
**Owns**: bridge contract surface only. Schema authority remains with
`coaia-narrative`.
**Cross-references**:
- [`coaia-github/README.md`](./README.md) — existing canonical Amun field map
- [`schema-evolution-and-ecosystem-metadata.spec.md`](../schema-evolution-and-ecosystem-metadata.spec.md) — typed sub-object pattern (`pde`, `plan`, `accountability`, `source`)
- [`schema/data-model/entity.yaml`](../../schema/data-model/entity.yaml) — current entity schema (draft-07)
- [`schema/data-model/relation.yaml`](../../schema/data-model/relation.yaml) — current relation schema with `custom` slot
- [`structural_tension_chart_creation.spec.md`](../structural_tension_chart_creation.spec.md) — chart entity model
- [`telescoping_hierarchical_advancement.spec.md`](../telescoping_hierarchical_advancement.spec.md) — `parentChart`, `parentActionStep`, `level`
- mightyeagle worktree proposal: `rispecs/miadi-code/miadi-agent/orchestration-proposals/260509-github-projects-structural-runtime-memory.md` (the upstream framing this bridge serves)
- `jgwill/coaia-agent#18` — runtime/visualizer launch context (does not gate this spec)

---

## 1. Creative Intent

**Desired Outcome**
A coaia-narrative entity carries enough structured metadata that any tool (the
`coaia-github` bridge today, future runtimes later) can synchronise its
state to a GitHub Project item — without inventing a parallel schema, without
breaking existing JSONL, and without silently capturing GitHub structures the
local schema cannot describe.

**Current Reality**
- `coaia-github/README.md` already proposes the Amun field map (`goal`,
  `current_reality`, `question`, `Status`, sub-issues, `session_id`,
  `due_date`) and floats two extension fields on entities: `sync_target` on
  the chart entity and `github_ref` on action_step entities, plus a relation
  type `synced_to_github`. None of this is in the canonical schema.
- `schema-evolution-and-ecosystem-metadata.spec.md` introduces the
  typed-sub-object pattern (`metadata.pde`, `metadata.plan`,
  `metadata.accountability`, `metadata.source`) as the canonical pattern for
  ecosystem provenance. It already contemplates `metadata.source.system`
  values including `coaia-narrative | coaia-pde | coaia-planning | mcp-pde |
  manual | miadi`.
- The current `schema/data-model/entity.yaml` enumerates `entityType` and
  declares a typed `metadata` shape but does not enumerate every sub-key —
  additional optional metadata properties remain valid JSON.
- The current `schema/data-model/relation.yaml` includes a `custom`
  `relationType` so additive relation types can land without schema breakage.

**Structural Tension**
Local charts and GitHub Project items are two representations of the same
creative tension. The tension is between **the existing typed-sub-object
ecosystem pattern** (which expects `coaia-github` provenance to live under a
`metadata.github` namespace consistent with `metadata.pde` and `metadata.plan`)
and **the shorthand `sync_target` / `github_ref` already proposed** in
`coaia-github/README.md`. This spec resolves that tension non-destructively:
the typed sub-object becomes the canonical form; the shorthand stays valid as
a deprecated alias during transition.

---

## 2. Non-Breaking Posture

This proposal commits to four invariants. If any of these would be violated
by an implementation choice, the implementation is out of scope.

1. **Existing JSONL parses unchanged.** Any chart created before this
   proposal must round-trip through any compliant parser without error.
2. **All new metadata is `?` optional and lives inside an additive
   sub-object.** No top-level field is renamed or repurposed.
3. **No existing relation type changes.** New relation semantics enter via
   the existing `custom` `relationType` slot first; promotion to a named
   enum value is deferred (§8.2).
4. **No `entityType` enum change.** GitHub Project items, projects, and
   field metadata do **not** become entities. They are addressable through
   `metadata.github.*` fields on existing chart and action_step entities.

---

## 3. Proposed Sub-Object: `metadata.github`

`metadata.github` is the canonical, namespaced location for GitHub-bridge
provenance. It is shaped after `metadata.pde` and `metadata.plan` so that
consumers (visualizer, MCP tools, sync workers) can use one inspection
pattern across the ecosystem.

### 3.1 Chart-Level Shape

When attached to a `structural_tension_chart` entity:

```typescript
interface GithubChartProvenance {
  /** Stable issue address that mirrors this chart at chart granularity. */
  issue?: GithubIssueRef;

  /** Project-item context if the issue is in a Project. */
  projectItem?: GithubProjectItemRef;

  /** Last successful field-level sync state. */
  syncState?: 'synced' | 'diverged' | 'conflict' | 'project-only' | 'chart-only';

  /** ISO-8601 timestamp of the last `sync_chart_to_project` or
   *  `sync_project_to_chart` call that completed without error. */
  lastSyncedAt?: string;

  /** Fingerprint of the last synced field set; used by `sync` tools to
   *  detect post-sync edits without re-reading every field. */
  fieldHash?: string;

  /** Which direction was authoritative on the last successful sync.
   *  'jsonl' = JSONL → Project (default for new entities)
   *  'project' = Project → JSONL (used when a human edited Status / accountable_to in GitHub) */
  authoritativeOnLastSync?: 'jsonl' | 'project';
}
```

### 3.2 Action-Step-Level Shape

When attached to an `action_step` entity:

```typescript
interface GithubActionStepProvenance {
  /** Sub-issue (or stand-alone issue) that mirrors this action step. */
  issue?: GithubIssueRef;

  /** Project-item context, if any. */
  projectItem?: GithubProjectItemRef;

  /** Same enum as chart-level. */
  syncState?: 'synced' | 'diverged' | 'conflict' | 'project-only' | 'chart-only';

  lastSyncedAt?: string;
  fieldHash?: string;
  authoritativeOnLastSync?: 'jsonl' | 'project';
}
```

### 3.3 Common Sub-Shapes

```typescript
interface GithubIssueRef {
  /** GitHub owner (e.g. 'jgwill'). */
  owner: string;
  /** Repository name (e.g. 'coaia-narrative'). */
  repo: string;
  /** Issue number. */
  number: number;
  /** Optional GitHub global node ID for GraphQL. */
  nodeId?: string;
  /** Optional permalink, computed from owner/repo/number. */
  url?: string;
}

interface GithubProjectItemRef {
  /** Project number under the owner (Projects v2). */
  projectNumber: number;
  /** Project owner login (org or user). */
  projectOwner: string;
  /** Optional project title (informational, may drift). */
  projectTitle?: string;
  /** Project-item GraphQL node ID. */
  itemId: string;
  /** Optional project-item URL. */
  url?: string;
}
```

### 3.4 What `metadata.github` Does Not Hold

- **Custom field values themselves.** A custom field value is a *projection*
  of an entity's existing metadata (per the upstream proposal §2.1 in the
  mightyeagle worktree). Storing them inside `metadata.github` would
  duplicate the authoritative source. The `coaia-github` bridge resolves
  field values by reading other metadata at sync time.
- **Project lens identity.** Multi-perspective lenses are expressed by
  multiple `GithubProjectItemRef` entries, not by a special "lens" type. If
  multiple projects mirror the same chart, store them as a list:

```typescript
projectItems?: GithubProjectItemRef[];   // optional plural form
```

  Either `projectItem` (singular, common case) **or** `projectItems` (plural,
  multi-lens case) MAY be present; never both. Consumers normalize to the
  list internally.

---

## 4. Relation Additions (additive, behind `custom` first)

Until promoted, all new GitHub-bridge relations enter under `relationType:
"custom"` with `metadata.context` carrying the canonical name. This is
exactly the affordance `relation.yaml` already provides.

| Canonical name (proposed) | From → To | Purpose | Promotion criterion |
|---|---|---|---|
| `synced_to_github` | chart or action_step → `gh:<owner>/<repo>#<num>` virtual node *(see §4.1)* | The entity has a live GitHub mirror | Two independent runtimes use it for ≥1 month without churn |
| `project_lens_of` | project lens identifier → chart | Declares a perspective lens over a chart | Visualizer uses it in a shipped lens-switcher view |
| `linked_to_issue` | chart or action_step → external issue | The local entity is *referenced by* but not *mirrored to* an issue | When the visualizer rispec adopts it (companion spec, §5) |

### 4.1 Virtual `gh:` Targets vs. Real Entities

Two acceptable encodings, both non-breaking; pick **one consistently per
JSONL session**:

**Encoding A — pure metadata (preferred, lightest):** the relation exists
only between two real entities; the GitHub address lives entirely inside
`metadata.github` of the source entity. No `gh:` target.

**Encoding B — virtual `gh:` target entity (visualizer-friendly):** create
an entity of `entityType: "custom"` with `name: "gh:<owner>/<repo>#<num>"`
and `metadata.github.issue` populated. Then the relation is plain
`relationType: "custom"` (canonical name `synced_to_github`) from chart
entity → virtual entity. This makes the relation graph render natively
without a new node category.

The `coaia-github` bridge MUST tolerate both encodings on read. On write, it
MUST pick exactly one (set in `coaia-narrative` config) per JSONL file.

---

## 5. `metadata.source.system` Extension

`schema-evolution-and-ecosystem-metadata.spec.md` already defines the
`SourceProvenance` sub-object with a `system` enum. To represent entities
born from a GitHub-side action (e.g. issue created by a human in GitHub,
later imported into a chart), the enum gains one additive value:

```diff
- system: 'coaia-narrative' | 'coaia-pde' | 'coaia-planning' | 'mcp-pde' | 'manual' | 'miadi';
+ system: 'coaia-narrative' | 'coaia-pde' | 'coaia-planning' | 'mcp-pde' | 'manual' | 'miadi' | 'coaia-github';
```

This is one additive enum value. It is non-breaking because consumers that
do not recognise `coaia-github` should fall back to treating the source as
opaque (per a forward-compat clause to be added to the schema-evolution
spec — see §10 step 1).

`metadata.source.toolName` for `system === 'coaia-github'` SHOULD be one of:

- `sync_chart_to_project`
- `sync_project_to_chart`
- `create_issue_from_chart`
- `link_chart_to_issue`

These are the four MCP tools `coaia-github/README.md` already lists.

---

## 6. JSON Schema Stub (proposed; for `entity.yaml`)

This stub is illustrative. It is **not applied** to `entity.yaml` in this
session. The intent is that a future PR can paste these properties into the
existing `metadata` block without touching any other field.

```yaml
github:
  type: object
  description: >-
    Optional GitHub-bridge provenance for charts and action steps mirrored
    to GitHub Issues / Projects. Populated by the `coaia-github` bridge.
  additionalProperties: false
  properties:
    issue:
      $ref: '#/definitions/GithubIssueRef'
    projectItem:
      $ref: '#/definitions/GithubProjectItemRef'
    projectItems:
      type: array
      items:
        $ref: '#/definitions/GithubProjectItemRef'
    syncState:
      type: string
      enum: [synced, diverged, conflict, project-only, chart-only]
    lastSyncedAt:
      type: string
      format: date-time
    fieldHash:
      type: string
    authoritativeOnLastSync:
      type: string
      enum: [jsonl, project]

definitions:
  GithubIssueRef:
    type: object
    required: [owner, repo, number]
    properties:
      owner: { type: string }
      repo: { type: string }
      number: { type: integer, minimum: 1 }
      nodeId: { type: string }
      url: { type: string, format: uri }
  GithubProjectItemRef:
    type: object
    required: [projectNumber, projectOwner, itemId]
    properties:
      projectNumber: { type: integer, minimum: 1 }
      projectOwner: { type: string }
      projectTitle: { type: string }
      itemId: { type: string }
      url: { type: string, format: uri }
```

The `additionalProperties: false` on the `github` sub-object is a deliberate
choice — once a sub-object is named, future additions must be named too, so
silent drift cannot accumulate.

---

## 7. Coexistence With Earlier Shorthand

`coaia-github/README.md` mentions:

```yaml
sync_target on chart:        { owner, repo, issue_number, project_id, item_id }
github_ref on action_step:   { owner, repo, issue_number }
```

These shorthand fields are recognised by this proposal as **deprecated
aliases**, not removed. Migration policy:

| Field today | Replaced by | Migration |
|---|---|---|
| `metadata.sync_target.owner/repo/issue_number` | `metadata.github.issue.{owner,repo,number}` | dual-read |
| `metadata.sync_target.project_id` | `metadata.github.projectItem.itemId` (or `projectItems[*].itemId`) | dual-read |
| `metadata.sync_target.item_id` | `metadata.github.projectItem.itemId` | dual-read |
| `metadata.github_ref.{owner,repo,issue_number}` (on action_step) | `metadata.github.issue.{owner,repo,number}` | dual-read |

Dual-read pattern (mirrors the schema-evolution spec):

```typescript
const issueRef =
  entity.metadata?.github?.issue
  ?? (entity.metadata?.sync_target
        ? { owner: entity.metadata.sync_target.owner,
            repo: entity.metadata.sync_target.repo,
            number: entity.metadata.sync_target.issue_number }
        : entity.metadata?.github_ref
          ? { owner: entity.metadata.github_ref.owner,
              repo: entity.metadata.github_ref.repo,
              number: entity.metadata.github_ref.issue_number }
          : undefined);
```

Producers of new JSONL MUST write only the `metadata.github.*` form.
Consumers MUST tolerate both forms. The shorthand remains parseable
indefinitely; removal is **out of scope** for this spec.

---

## 8. Ownership

### 8.1 What `coaia-github` Owns
- Resolving custom-field values from local entity metadata at sync time.
- The four MCP tools `sync_chart_to_project`, `sync_project_to_chart`,
  `create_issue_from_chart`, `link_chart_to_issue`.
- Writing `metadata.github.*` and `metadata.source = { system: 'coaia-github', toolName, sessionId, createdAt, version }` on entities it creates or modifies.
- Resolving `syncState` and choosing `authoritativeOnLastSync` per session
  config.
- The "virtual `gh:` target" encoding (§4.1) when configured to use it.

### 8.2 What `coaia-github` Does Not Own
- The shape of `EntityMetadata`, `Entity`, or `Relation`. Schema authority
  stays with `coaia-narrative` — i.e. with this rispec directory and with
  `schema/data-model/`.
- Any `relationType` enum promotion. New relation names live under `custom`
  until `coaia-narrative` formally promotes them in a future schema PR.
- The `metadata.source.system` enum value `'coaia-github'` itself — it must
  be added by a coaia-narrative schema PR (step 1 below) before any
  `coaia-github` runtime emits it. Until then, `coaia-github` SHOULD emit
  `system: 'manual'` with `toolName` carrying its tool name, and write the
  intended canonical value in a comment metadata field for future migration.
- The visualizer rendering. See companion spec
  `coaia-visualizer/rispecs/github-project-runtime-memory-integration.spec.md`.
- GitHub authentication, rate-limit handling, or webhook endpoints — those
  are runtime concerns of whichever process hosts the MCP tools.

---

## 9. Field Resolution Cheat Sheet (for the bridge)

This table is the single source of truth for how the bridge derives each
GitHub Project custom field at sync time. It composes
`coaia-github/README.md`'s table, the typed-sub-object pattern from
`schema-evolution-and-ecosystem-metadata.spec.md`, and the upstream
mightyeagle proposal §2.1.

| GitHub field | Source path on the entity | Notes |
|---|---|---|
| `goal` | `desired_outcome.observations[0]` (chart's child) | Read via `contains` relation from chart |
| `current_reality` | `current_reality.observations[0]` | Same |
| `question` | chart `metadata.narrative.description` if present, else first sentence of `desired_outcome.observations[0]` | Heuristic; document choice on first sync |
| `Status` | derived from `metadata.phase` + action-step completion ratio | Derivation kept in `coaia-github` |
| `structural_phase` | `metadata.phase` | direct |
| `tension_state` | computed (see `mmotEvaluations` recency + completionStatus distribution) | not stored; derived per call |
| `direction` | `metadata.pde.direction` (UPPERCASE) | from schema-evolution spec |
| `mmot_state` | last `metadata.mmotEvaluations[*].phase` | from schema-evolution spec |
| `accountable_to` | `metadata.accountability.accountableEntity` | chart-level |
| `responsible_for` | `metadata.accountability.responsibleEntities` | action-step-level |
| `recursion_depth` | `metadata.level` | telescoping spec |
| `parent_tension` | `metadata.parentChart` or `metadata.parentActionStep` | telescoping spec |
| `narrative_arc` | latest `narrative_beat` `label` linked via `documents` relation | beats are entities, not metadata |
| `pde_decomposition_id` | `metadata.pde.decompositionId` | schema-evolution spec |
| `confidence` | `metadata.pde.confidence ?? metadata.plan.confidence` | dual-source fallback |
| `implicit_intent` | `metadata.pde.implicitIntent` | schema-evolution spec |
| `plan_sync_state` | `metadata.plan.syncState` | schema-evolution spec |
| `source_system` | `metadata.source.system` | schema-evolution spec |
| `due_date` | `metadata.dueDate` | existing field |
| `session_id` | `metadata.source.sessionId` | schema-evolution spec |
| `chart_jsonl_path` | session JSONL filename (computed by bridge from runtime context, not stored) | not in entity metadata |

The bridge MUST NOT write a custom-field value for a GitHub field whose
source path on the entity is empty. Empty values stay empty in the Project.
This preserves "honest current reality" semantics — silence is data.

---

## 10. First Implementation Slice (3–5 steps)

Each step is one of Reverse-engineer / Intent-extract / Specify / Export.

1. **Specify (coaia-narrative schema PR, surgical):** Add the
   `'coaia-github'` value to `metadata.source.system` enum in
   `schema-evolution-and-ecosystem-metadata.spec.md`. Add a sentence to that
   spec stating that consumers SHOULD treat unknown `system` values as
   opaque (forward-compat clause). **One-line change to a rispec, not to
   YAML.** The YAML remains unchanged because `metadata.source` is itself a
   typed sub-object proposal still in transition.

2. **Reverse-engineer (the live Amun project):** Read the actual GitHub
   Project's GraphQL field IDs, types, and option enums. Reconcile the §9
   field map with reality. Output: an updated `coaia-github/README.md` field
   map that pairs each name with its real `fieldId` and `optionId`s. **No
   schema change here either.**

3. **Specify (coaia-github MCP tool contracts):** Author four short rispecs
   in this directory naming inputs, outputs, idempotency rules, and
   `metadata.github.*` writes:
   - `sync_chart_to_project.spec.md`
   - `sync_project_to_chart.spec.md`
   - `create_issue_from_chart.spec.md`
   - `link_chart_to_issue.spec.md`
   Each must reference §3 and §9 of this document.

4. **Specify (encoding choice):** Pick §4.1 Encoding A (pure metadata) or
   Encoding B (virtual `gh:` target). Recommendation: Encoding A first
   (smallest blast radius). Document the choice as a one-paragraph
   `coaia-github/encoding-choice.spec.md`.

5. **Export (smallest end-to-end exercise):** Run `sync_chart_to_project`
   for **one** real chart against the live Amun project. Verify:
   - `metadata.github.issue` and `metadata.github.projectItem` are populated.
   - `metadata.source.system` is set per step 1.
   - JSONL still parses against `entity.yaml`.
   - Existing visualizer renders the chart (no UI changes yet).
   Then run `sync_project_to_chart` to verify the round-trip and
   `syncState: 'synced'`. Capture findings as input for the visualizer
   companion spec.

Steps 1–4 are spec-only. Step 5 is the smallest implementable runtime
exercise that validates the schema-bridge shape; it does not require any
UI changes to land.

---

## 11. Migration / Coexistence Story

| Scenario | What happens | Why it stays valid |
|---|---|---|
| Old JSONL with no GitHub metadata | parses fine; visualizer ignores `metadata.github` (it's optional) | additive only |
| JSONL with `sync_target` shorthand | dual-read in §7 lifts it into `github.issue` for consumers | shorthand never removed |
| JSONL written by `coaia-github` after step 1 | populates `metadata.github.*` and `metadata.source.system = 'coaia-github'` | enum value reserved by step 1 |
| JSONL written by `coaia-github` *before* step 1 | populates `metadata.github.*` and `metadata.source.system = 'manual'` with `toolName` carrying `'sync_chart_to_project'` etc. | tolerated by spec; migrated by §10 step 5 |
| External tool that does not know `metadata.github` | reads the rest of the entity normally; ignores unknown sub-object | additive sub-object pattern |
| External tool that uses Encoding B but reads Encoding A | sees no `gh:` virtual entity; relation graph renders only existing nodes | Encoding A is a pure subset |
| External tool that uses Encoding A but reads Encoding B | sees an extra `entityType: 'custom'` node it doesn't understand; can ignore | `custom` slot exists for this |

---

## 12. Out of Scope (defer)

- **Promoting `synced_to_github`, `project_lens_of`, `linked_to_issue` to
  named `relationType` enum values.** Stays under `custom` until
  field-tested.
- **Adding `metadata.github` directly to `entity.yaml`.** §6 stub is for a
  future PR; this proposal does not edit YAML.
- **Webhooks, auth, or rate-limit policy.** Runtime concerns for
  `coaia-github` runtime, not for this rispec.
- **Project codename selection.** Carried in the upstream mightyeagle
  proposal § 1.4 / §10.
- **A2A or other transports** for the bridge. The bridge is MCP + GraphQL.
- **`metadata.github` on `narrative_beat` entities.** Possible but
  unmotivated; defer until a real beat-on-issue use case appears.
- **Hard removal of `sync_target` / `github_ref` shorthand.** Indefinite.
  Removal would be a breaking change.

---

## 13. Quality Criteria

- [x] Zero changes to `schema/data-model/entity.yaml` or `relation.yaml` in
      this pass.
- [x] All proposed fields are optional and namespaced under `metadata.github`.
- [x] All proposed relation names land under existing `custom` slot first.
- [x] Existing JSONL remains valid against the current schema.
- [x] Field resolution table (§9) names a single source of truth per field.
- [x] Coexistence with `coaia-github/README.md` shorthand documented (§7).
- [x] Connection to `schema-evolution-and-ecosystem-metadata.spec.md`
      explicit (§3, §5).
- [x] Ownership boundary explicit: `coaia-github` bridges, does not author
      schema (§8).
- [x] First implementation slice is small and spec-only except for the
      single end-to-end smoke test (§10 step 5).

---

## 14. Open Questions

1. **`projectItem` vs `projectItems` default.** Single is simpler; multi-
   lens is a stated motivation for GitHub Projects. Recommendation: ship
   `projectItem` first, treat `projectItems` as a future field. Decision
   deferred to first cross-project sync session.
2. **Status derivation rule.** `Status` is a single-select but derives from
   `metadata.phase` plus action completion ratio. The exact decision tree
   is part of `sync_chart_to_project.spec.md` (§10 step 3), not this spec.
3. **`fieldHash` algorithm.** Stable hash of (sorted field name, normalized
   value) pairs is the obvious shape. SHA-256 of canonical-JSON likely
   sufficient; specifying it is part of the sync tool spec, not here.
4. **Project lens identity.** A `project_lens_of` relation needs a "lens
   entity" of some kind. Punt — see §4 promotion criterion.
