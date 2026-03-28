# RISPEC: STC–Veritas Companion Model

> When a Structural Tension Chart is created, a Veritas Type 2 Performance Review model is born alongside it. They are companions through the full lifecycle.

**Version**: 0.1.0
**Date**: 2026-03-28
**Status**: Draft
**Issue**: miadisabelle/workspace-openclaw#46
**Depends on**: `structural_tension_chart_creation.spec.md`, `mmot_evaluation_loop.spec.md`
**External**: `veritas.rispecs/performance_review_model.spec.md`, `veritas.rispecs/mcp_server.spec.md`

---

## Current Reality

- coaia-narrative creates STCs with action steps, current reality, desired outcome
- coaia-narrative has an MMOT evaluation loop spec with DESIGN/EXECUTION Elements of Performance
- The MMOT evaluation loop is self-contained — it does not call any external evaluation engine
- Veritas (`p/veritas`) provides a formal Type 2 Performance Review system with State × Trend × Priority Matrix
- Veritas has MCP tools (`veritas_generate_model`, `veritas_mmot_evaluate`, `veritas_get_model`) and a CLI
- **No connection exists between STC creation and Veritas model creation**
- Elements of Performance in coaia-narrative are conceptual; Veritas makes them evaluable

## Desired Outcome

When an STC is created (via `create_stc` tool or CLI), a corresponding Veritas Type 2 Performance Review model is created alongside it. The STC's action steps become the model's elements. When the STC is completed or evaluated, the Veritas model provides the formal MMOT evaluation with State × Trend scoring and priority matrix.

---

## The Companion Relationship

### At STC Creation

```
create_stc({
  desired_outcome: "Pipelines that complete the ceremonial circle",
  current_reality: "Both pipelines end at Review → Done",
  action_steps: [
    "Scout agent runs PDE as first step",
    "Post-PDE inquiry agents fan out",
    "Results stored in .mw/ per direction",
    "Wisdom-keeper agent added after reviewer"
  ]
})
```

Produces BOTH:

1. **STC** (existing behavior — no change):
   - Chart entity with desired_outcome, current_reality
   - Action step entities with due dates, status

2. **Veritas Type 2 Model** (NEW — companion):
   - Model name = STC chart title
   - Elements = STC action steps, each becoming a performance dimension
   - Element descriptions = what "acceptable" means, derived from the desired outcome context
   - State/Trend = unevaluated (to be scored at MMOT time)
   - Model ID stored in STC metadata for later retrieval

### Element Mapping

| STC Action Step | Veritas Element | "Acceptable" Means |
|---|---|---|
| "Scout agent runs PDE as first step" | Scout-PDE Integration | Scout reliably calls pde_decompose before exploration |
| "Post-PDE inquiry agents fan out" | Inquiry Agent Delegation | PDE facets produce concrete inquiry agents that return results |
| "Results stored in .mw/ per direction" | Directional Storage | Results land in correct .mw/ subdirectory, QMD-indexable |
| "Wisdom-keeper agent added after reviewer" | Sacred Closing Phase | Wisdom-keeper runs, produces reflection + seed |

### At MMOT Evaluation Time

The existing `perform_mmot_evaluation` tool in coaia-narrative gains an optional path:

- **Without Veritas** (current behavior preserved): Self-contained DESIGN/EXECUTION assessment within coaia-narrative. No external call.
- **With Veritas** (new behavior when companion model exists): Calls `veritas_mmot_evaluate` on the companion model. Veritas returns formal State × Trend × Priority. coaia-narrative integrates this into its narrative beat emission.

```
perform_mmot_evaluation({
  chartId: "stc-123",
  use_veritas: true    // NEW optional flag
})

→ Reads STC metadata for veritas_model_id
→ Calls veritas_mmot_evaluate(model_id)
→ Receives: { elements: [{ name, state, trend, priority }], analysis, plan }
→ Emits narrative beat with MMOT evaluation + Veritas priorities
→ Updates STC current_reality with evaluation facts
```

### At STC Completion

When all STC action steps are marked complete:
1. Final `veritas_mmot_evaluate` runs automatically
2. MMOT evaluation becomes the formal record of how the tension resolved
3. Unresolved tensions (elements scored Critical/Warning) carry forward as seed for next PDE cycle

---

## Design Constraints

1. **Veritas is optional, not required.** STCs work without Veritas (existing behavior). Veritas enriches, not gates.
2. **Elements come from STC, not from the evaluator.** The Veritas model's elements are the STC's action steps. The agent performing MMOT evaluation does not get to invent new elements.
3. **Offline fallback.** If Veritas API is unavailable, the model can be stored as local JSON alongside the STC and evaluated via `veritas mmot evaluate --file`.
4. **Model accumulation.** Veritas models persist in the database. Future ceremonies may find existing models from previous cycles via `veritas_list_models` or `veritas_get_model`.

---

## Implementation Notes

### coaia-narrative Changes

- `create_stc` tool: After STC creation, optionally call `veritas_generate_model` with action steps as elements. Store returned model ID in chart metadata.
- `perform_mmot_evaluation` tool: Add `use_veritas` flag. When true, call `veritas_mmot_evaluate` and merge results into narrative beat.
- Schema: Add `veritasModelId?: string` to chart entity metadata.

### coaia-pde Changes

- `pde-to-stc-transformation` (stc-mapper.ts): When transforming PDE → STC, the action steps already become STC entities. No change needed — the Veritas model creation happens downstream in coaia-narrative when the STC is created.

### MCP Configuration

Veritas MCP server must be available in the agent's MCP config:
```json
{
  "veritas-mcp": {
    "command": "node",
    "args": ["/path/to/veritas-mcp/dist/index.js"],
    "transport": "stdio"
  }
}
```

Or via mcporter: `mcporter call veritas-mcp.veritas_generate_model`

---

## Quality Criteria

- ✅ STC creation still works without Veritas (backward compatible)
- ✅ Elements trace directly to STC action steps (no hallucinated criteria)
- ✅ MMOT evaluation can use Veritas or fall back to internal assessment
- ✅ Veritas model ID stored in STC metadata (retrievable later)
- ✅ Priority matrix (Critical → Success) carries into seed document for next cycle

## Anti-Patterns

- ❌ Making Veritas required for STC creation (it's enrichment, not a gate)
- ❌ Letting the evaluator add elements at evaluation time (bootstrap problem)
- ❌ Treating Veritas Success score as relational success (formal ≠ relational)
- ❌ Losing the model ID (STC and Veritas model must stay linked)
