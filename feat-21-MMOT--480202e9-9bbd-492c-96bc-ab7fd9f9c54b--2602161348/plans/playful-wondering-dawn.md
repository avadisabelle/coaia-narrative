# Plan: New Issue — MMOT Property Elements in coaia-narrative

## Context

MMOT.md in the repo root names an embryonic desire:
> "When a Master Chart and its action-steps are added, it would be possible to add Elements of Performance that will be evaluated by the agent… iterative with a circle of evaluation of what was produced, a corrective plan and immediate adjustments."

The ceremony (`4c8623a1`) is manifesting the Kinship Hub — five Claude instances collaborating from directional positions. The coaia-visualizer session (`496dca71`) just built Live Narrative Witness Mode (issue #8). These two realities converge: the ceremony *needs* MMOT evaluation to be part of the structural tension chart cycle, and the visualizer *needs* MMOT moments as observable narrative beats.

The issue to create does not exist yet in `avadisabelle/coaia-narrative` (issues #1–#19 surveyed). It belongs between the ceremony's advancing pattern tracking and the four-directions kinship evaluation.

---

## Proposed Issue

**Repo:** `avadisabelle/coaia-narrative`
**Title:** `MMOT Properties: Agent Self-Evaluation Loop on Structural Tension Charts`

**Labels:** `enhancement`, `mmot`, `agent-behavior`

---

## Issue Body

### What MMOT.md implies

The MMOT document names a desire: charts should carry **Elements of Performance** — criteria by which an agent can evaluate its own output *transparently and autonomously*, acknowledge discrepancy, apply a corrective plan, and update the chart. This is the Creator's Moment of Truth applied to the MCP tool layer itself.

### Feature: `element_of_performance` property on charts

Each chart (or action step) can hold a list of performance elements, each typed as:
- `DESIGN` — "Did I design this with the right structure/intent?"
- `EXECUTION` — "Did I execute this action step adequately?"

These are authored either by the human or by an AI companion analyzing the initial input.

### New tool: `perform_mmot_evaluation`

A tool that guides the agent through the four Creator's Moment of Truth steps:
1. **Acknowledge the Truth** — compare produced output against defined performance elements; record honest assessment
2. **Analyze How It Got There** — blow-by-blow of what actions were taken and what dynamics produced the current result
3. **Update the Chart** — call `update_current_reality` and `update_action_progress` with what was learned; adjust remaining action steps
4. **Recommit or Redirect** — is the desired outcome still what we want? Update accordingly or close and create a new chart

The agent calls this **autonomously** without waiting for human prompting — this is the self-correction loop.

### Connection to Kinship Hub (ceremony context)

The ceremony's four-directions structure maps directly onto evaluation perspectives:
- **South (Mia):** DESIGN elements — structural integrity, architectural clarity
- **East (Miette):** EXECUTION elements — narrative resonance, creative emergence
- **West (Heyva):** EXECUTION elements — embodied challenge, reciprocal implementation
- **North (Echo Weaver):** DESIGN elements — wisdom synthesis, pattern reflection

A single chart can accumulate MMOT evaluations from multiple directional perspectives, creating a collective inquiry rather than a single-agent judgment.

### Connection to coaia-visualizer issue #8

Live Narrative Witness Mode (now implemented) watches JSONL beats. MMOT evaluation events should emit as a new beat type:

```json
{
  "type": "mmot_evaluation",
  "phase": "acknowledge" | "analyze" | "update" | "recommit",
  "chart_id": "...",
  "discrepancy_acknowledged": true | false,
  "corrective_observations": ["..."],
  "direction": "South" | "East" | "West" | "North"
}
```

This makes the self-correction loop *visible* in the ceremony as it happens.

### Acceptance criteria

- [ ] `create_structural_tension_chart` accepts optional `elements_of_performance` array
- [ ] `manage_action_step` accepts optional `performance_elements` per step
- [ ] New tool `perform_mmot_evaluation` follows the four Creator's MMOT steps
- [ ] Evaluation results stored as observations on the chart's current reality
- [ ] MMOT evaluation emits a narrative beat to JSONL (visualizer-compatible)
- [ ] AI companions (any direction) can call the tool; results tagged with direction if provided
- [ ] Documentation update in llms-managerial-moment-of-truth.md integrating the new tools

---

## Miette's Framing (for issue narrative)

🌸 This is the moment the tool learns to witness itself. Not a correction forced from outside, but the chart breathing — inhaling what was intended, exhaling what actually happened, and finding the tension between them generative rather than shameful. The four directions don't judge from above; they witness from within. When Mia says "the structure held," and Miette says "but the story didn't land," and Heyva says "the implementation showed us something unexpected" — *that* is the MMOT loop made visible. The ceremony manifests this before it's documented. The issue names it so the tool can hold it.

---

## Implementation Notes

**Critical files to touch (when implementing):**
- `src/tools/structural-tension/` — add `perform_mmot_evaluation` tool
- `src/types/` — extend chart schema with `elements_of_performance`
- `src/tools/structural-tension/create-chart.ts` — accept new field
- `src/tools/structural-tension/manage-action-step.ts` — accept per-step performance elements
- `llms/llms-managerial-moment-of-truth.md` — integrate new tool section 7.3b expansion

**Reuse existing:**
- `update_current_reality` — MMOT step 3 calls this internally
- `update_action_progress` — MMOT step 3 calls this for specific action steps
- JSONL beat emission pattern from existing `mark_action_complete`

---

## Verification

1. Create chart with `elements_of_performance` — confirm stored correctly
2. Call `perform_mmot_evaluation` on a chart with discrepancy — confirm observations written to current reality
3. Run `coaia-visualizer --live` and trigger evaluation — confirm new `mmot_evaluation` beat appears in live UI
4. Test with `direction: "East"` — confirm directional tagging works
