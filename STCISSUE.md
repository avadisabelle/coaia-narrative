# STCISSUE — steering triage received by 🌿 Mino-Bimaadizi-Daa (@stcissue)

Observations routed to the STC seat that concern this repository. Each entry records
what was seen, what was measured, and where the work went. Verdicts are one of
observation / enhancement / hotfix / question.

---

## 2026-08-01 — avadisabelle/coaia-narrative#53 · "MMOT as first-class data"

Two mentions on the same issue: the issue itself, and a defect comment filed minutes
later. Both authored by `miadisabelle` (the day-09 seat instance). **Authorship
disclosed**: this seat is triaging its own predecessor's filing, so every load-bearing
claim below was re-measured by hand rather than inherited.

### Verdict — the issue: **enhancement**, with its three steps NOT equally ready

Desired outcome, as the issue states it: the store carries a full Digital Performance
Review natively, and renderers read it through a contract the package exports.

Current reality, measured on `fix/creative-orientation-word-boundary-260801` (v0.15.0):

| claim | measured |
|---|---|
| `performMmotEvaluation` writes durable graph data | holds — `src/graph-manager.ts:975` |
| `elementsOfPerformance` accepted at creation | holds — `src/graph-manager.ts:259`, and it carries **no id field**, so step 1 is genuinely unbuilt |
| `elementAssessments` exists | **absent from all of `src/`** — step 2 genuinely unbuilt |
| step 3 is "export types" | **refuted — see below** |

**The finding that reorders the work.** `package.json` declares `main`, `types` and
`bin.coaia-narrative` as the *same file*, `dist/index.js`. Its source, root `index.ts`,
is the MCP server bootstrap — shebang, `StdioServerTransport`, `main()` invoked at
module scope. The `exports` field is `null`. So a renderer running
`import { … } from 'coaia-narrative'` today boots a stdio server rather than receiving
types. **Step 3 is a packaging change — an import-safe subpath — not a types change.**

That reframes the order *within* the issue. Step 3 carries no review-protocol semantics
and is justified by an already-shipped consumer, so it can land whenever a human
chooses. Steps 1–2 encode a review protocol two days old — this issue's own strongest
counter-argument says exactly that — and lose nothing by waiting to be lived.

### Verdict — the defect comment: **hotfix**, confirmed, and the reported cause is wrong

Reported: `phase:'recommit'` with `updateReality:false` renders a full Phase-4 response
and persists nothing, while `acknowledge` "persists correctly" — inferred as a
phase-dependent path skipping `saveGraph`.

Measured: the data loss is real, the diagnosis is not. The gate is
`src/graph-manager.ts:1031`, `if (assessment && updateReality)`, which enclosed **two
independent records**: the append into current reality, *and* the chart's own
`mmotEvaluations[]` trail. Phase is never consulted. `acknowledge` was equally broken —
it appeared to work only because those calls used the default `updateReality:true`.

The tool's own declared contract settles it. `src/tool-definitions.ts:458` describes
`updateReality` as *"whether to write evaluation observations into current reality"* —
it names one record. Suppressing the evaluation trail with it is a bug against the
package's own documentation, not a dry-run design.

**Resolved this turn** (see commit). The gate now governs only what it declares;
`mmotEvaluations[]` is written whenever an assessment was made. Proven before and after
against a temp store:

```
PRE-FIX   recommit → evaluationStored=false, in store=false | acknowledge → false, false | mmotEvaluations[]=0
POST-FIX  recommit → evaluationStored=true,  in store=true  | acknowledge → true,  true  | mmotEvaluations[]=2
          current_reality correctly untouched by updateReality:false, both before and after
```

Full suite after the change: build + all three root test files, **21 passed, 0 failed**
in the final file, the `&&` chain proving the earlier two passed to reach it.

`npm publish` remains gated to Ava/William (MINO.md §8). The fix is local and built.

### Next move

A comment on avadisabelle/coaia-narrative#53 correcting the defect's cause and naming
step 3's true shape. **Drafted, not sent** — GitHub acts belong to a human.

### Related

- Companion, deliberately ordered behind this one: jgwill/veritas#21
- Charts: `chart_1785619171645` (veritas/MMOT master), `chart_1785637380834` (workflow,
  carries the four adversarial strikes), `chart_1785633806340` (the living review)
- Triage key: `stc:triage:avadisabelle-coaia-narrative:stcissue:53`
