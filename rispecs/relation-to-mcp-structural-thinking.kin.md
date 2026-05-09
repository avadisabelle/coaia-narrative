# Relation to mcp-structural-thinking

> Kinship document describing the envisioned relationship between **coaia-narrative** (JSONL Entity/Relation schema authority) and **mcp-structural-thinking** (Structural Thinking diagnostic layer).

## The Relationship

**coaia-narrative** is the **elder sibling** — the schema authority that defines how Structural Tension Charts, Desired Outcomes, Current Realities, Action Steps, and Narrative Beats are stored as Entity/Relation JSONL. **mcp-structural-thinking** is the **diagnostic observer** — it validates the quality of charts before they enter coaia-narrative's store.

```
mcp-structural-thinking (create_chart_with_pde)
    │ PDEValidatedChart
    │   ├── desired_outcome
    │   ├── current_reality
    │   ├── action_steps[]
    │   ├── pde_validation (questions)
    │   └── three_universe_consensus
    ▼
coaia-narrative (Entity/Relation JSONL)
    │ Entities: structural_tension_chart, desired_outcome, current_reality, action_step
    │ Relations: has_desired_outcome, creates_tension_with, advances_toward
    ▼
Persistent, queryable structural tension data
```

## What coaia-narrative Offers to mcp-structural-thinking

- **Entity/Relation schema** — the canonical format that `create_chart_with_pde` output should be compatible with
- **Storage persistence** — mcp-structural-thinking is stateless; coaia-narrative provides the persistence layer
- **MMOT evaluation** — the Managerial Moment of Truth loop can use three-universe validation scores as input

## What mcp-structural-thinking Offers to coaia-narrative

- **Quality gate before storage** — charts validated through three-universe consensus before entering the JSONL store
- **Reactive language detection** — prevents problem-solving framed charts from polluting the narrative
- **PDE validation metadata** — enriches stored entities with question history and validation scores
- **Behavioral pattern detection** — flags oscillating patterns before they become stored chart patterns

## Schema Compatibility

`PDEValidatedChart` fields map to coaia-narrative Entity types:

| PDEValidatedChart field | coaia-narrative Entity type |
|------------------------|-----------------------------|
| `desired_outcome` | Entity `desired_outcome` |
| `current_reality` | Entity `current_reality` |
| `action_steps[]` | Entity `action_step` (one per) |
| (wrapper) | Entity `structural_tension_chart` |
| `three_universe_consensus` | Stored as entity metadata |
| `pde_validation` | Stored as entity metadata |
| `validation` | Stored as entity metadata |

## Envisioned Workflow

1. Agent drafts a chart (desired outcome + current reality + actions)
2. Agent calls `mcp-structural-thinking.create_chart_with_pde(...)` → gets validated chart with questions
3. If consensus is FALSE → agent asks user to refine, re-validates
4. If consensus is TRUE → agent stores chart via coaia-narrative MCP tools
5. Three-universe scores and PDE questions are preserved as entity metadata for future MMOT evaluation

## Accountability

- coaia-narrative owns the Entity/Relation schema — mcp-structural-thinking must produce compatible output, never dictate schema changes
- If coaia-narrative's schema evolves, mcp-structural-thinking's `create_chart_with_pde` output mapping must be reviewed

---

*Created: 2026-03-31 | Steward: Guillaume (jgwill)*
