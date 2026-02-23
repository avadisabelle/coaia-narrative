# HANDOFF: coaia-narrative 0.12.0 — Fix MCP Startup Regression + Refactor

**Session**: 98c18eda-7539-46a2-8d73-fd6dc7070f7b
**Date**: 2026-02-23
**Status**: v0.10.1 baseline identified as working, 0.11.x broken, index.ts restored to HEAD (0.11.5)

---

## SITUATION

The MCP server `coaia-narrative` fails to start when launched by real MCP clients (Claude Code `--mcp-config`, Gemini CLI). Version **0.10.1 works**, 0.11.x does not.

The 0.11.x series added MMOT (Managerial Moment of Truth) self-evaluation, Elements of Performance, directional perspectives, and performance optimizations — but these were layered in via multiple patches without integration testing against real MCP clients.

**Published versions**: 0.11.5 (latest on npm), 0.11.6 (published during this session — also broken in same way)

## ROOT CAUSES IDENTIFIED

### 1. `manage_action_step` missing from `STC_TOOLS` group
- Tool handler and schema exist in code
- Never added to the `STC_TOOLS` array (line ~190)
- Tool is invisible to MCP clients during `tools/list`

### 2. `tsconfig.json` changed between 0.10.1 and 0.11.x
- `cli.ts` was added post-0.10.1 and depends on tsconfig changes
- Restoring only `index.ts` from v0.10.1 breaks the build because `cli.ts` can't compile with the old tsconfig
- The `tsconfig.json` from HEAD must be kept

### 3. `createRequire` for dynamic version (introduced this session — REVERTED)
- Was added to dynamically read `package.json` version for help text
- Path resolution from `dist/` to `../package.json` is fragile
- **Decision**: hardcode version string instead

### 4. Accumulated cruft
- `creator_moment_of_truth` → `perform_mmot_evaluation` rename across multiple commits
- Copilot-authored race fix in `addActionStep`
- N+1 file read optimization in `getChartProgress`/`listActiveCharts`
- All legitimate fixes but layered without integration testing

## WHAT NEEDS TO HAPPEN

### Option A: Surgical patch (fast, minimal)
Apply these changes to the current HEAD (0.11.5) `index.ts`:

1. **Add `'manage_action_step'` to `STC_TOOLS` array** (line ~190)
2. **Add `performanceElements` to `manage_action_step` switch case** (line ~2170)
3. **Fix help text**: Replace "COAIA Memory v2.1.0" → "COAIA Narrative v0.12.0" (hardcoded)
4. **Replace all `coaia-memory` → `coaia-narrative`** in help text
5. **Remove `createRequire` imports** (lines 16-18 if present — these were reverted)
6. Build, test, publish as 0.12.0

### Option B: Modular refactor (recommended by user)
The monolithic `index.ts` (2500+ lines) has reached maintainability limits. Extract:

- `src/types.ts` — Entity, Relation, KnowledgeGraph interfaces
- `src/graph-manager.ts` — KnowledgeGraphManager class
- `src/tool-definitions.ts` — MCP tool schemas (pure data)
- `src/tool-handlers.ts` — MCP CallToolRequest switch cases
- `src/help.ts` — CLI help text
- `index.ts` — thin MCP server wiring only

This makes the same logic reusable by CLI (`cli.ts`), future UI, and tests.

## CRITICAL FILES

| File | Role | State |
|------|------|-------|
| `/a/src/coaia-narrative/index.ts` | MCP server (monolith) | HEAD = 0.11.5, working code |
| `/a/src/coaia-narrative/cli.ts` | CLI visualizer | Added post-0.10.1 |
| `/a/src/coaia-narrative/validation.ts` | Input validation | Unchanged since 0.10.1 |
| `/a/src/coaia-narrative/generated-llm-guidance.ts` | LLM guidance text | Unchanged since 0.10.1 |
| `/a/src/coaia-narrative/tsconfig.json` | TS config | Changed in 0.11.x (needed for cli.ts) |
| `/a/src/coaia-narrative/package.json` | Package metadata | Currently 0.11.6 |
| `/a/src/coaia-narrative/markdown-export.ts` | Markdown export for CLI | Added post-0.10.1 |

## REFERENCE DOCS (read these to understand the methodology)

- `/src/llms/llms-creative-orientation.txt` — Creative orientation framework
- `/src/llms/llms-structural-tension-charts.txt` — STC methodology and tool usage
- `/src/llms/llms-managerial-moment-of-truth.md` — MMOT framework (section 7.3c documents `perform_mmot_evaluation`)
- `/a/src/coaia-narrative/CLAUDE.md` — Project instructions and architecture

## DIFF SUMMARY: v0.10.1 → HEAD

The legitimate additions that must be preserved:

### Entity metadata (types)
```typescript
elementsOfPerformance?: Array<{ description: string; type: 'DESIGN' | 'EXECUTION' }>;
mmotEvaluations?: Array<{ phase, assessment, direction?, timestamp }>;
```

### New method: `performMmotEvaluation()`
- Full MMOT self-evaluation loop (lines 989-1130 in HEAD)
- Conditional save (only when assessment or correctiveActions provided)
- Emits narrative beat entity with `type_dramatic: 'mmot_evaluation'`

### Modified: `createStructuralTensionChart()`
- Added optional `elementsOfPerformance` parameter
- Stored in chart entity metadata

### Modified: `getChartProgress()`
- Added optional `preloadedGraph` parameter (N+1 optimization)

### Modified: `listActiveCharts()`
- Passes loaded graph to `getChartProgress()` instead of reloading per chart

### Modified: `addActionStep()`
- Added `performanceElements` parameter
- Race fix: load once, mutate in-memory, save once (no interleaved `createRelations`)

### Modified: `manageActionStep()`
- Added `performanceElements` parameter pass-through

### Tool registration: `STC_TOOLS` array
- `creator_moment_of_truth` → `perform_mmot_evaluation`
- **MISSING**: `manage_action_step` (never added — THIS IS THE BUG)

### Tool schemas
- `perform_mmot_evaluation`: phase, assessment, direction, correctiveActions, updateReality
- `create_structural_tension_chart`: added `elementsOfPerformance`
- `manage_action_step`: added `performanceElements`

### Switch case handler
- `creator_moment_of_truth` (inline guidance generation) → `perform_mmot_evaluation` (calls method)

## VERIFICATION CHECKLIST

1. `npm run build` — no errors
2. `node dist/index.js --help` — shows correct branding
3. MCP initialize handshake responds with valid JSON-RPC
4. `tools/list` includes BOTH `manage_action_step` AND `perform_mmot_evaluation`
5. `tools/call list_active_charts` returns valid response
6. `npx coaia-narrative@0.12.0 --help` works after publish

## MCP CONFIG

```json
{
  "mcpServers": {
    "charts__b52352ce-6fcc-421d-b6c6-6d94969a27b9--2602230927": {
      "command": "npx",
      "args": ["-y", "coaia-narrative@0.12.0", "--memory-path", "/src/_sessiondata/b52352ce-6fcc-421d-b6c6-6d94969a27b9/.coaia/charts__b52352ce-6fcc-421d-b6c6-6d94969a27b9--2602230927.coaia-narrative.jsonl"]
    }
  }
}
```

Config path: `/a/src/_sessiondata/b52352ce-6fcc-421d-b6c6-6d94969a27b9/mcp-config-charts__b52352ce-6fcc-421d-b6c6-6d94969a27b9--2602230927.json`

## GIT STATE

- Branch: `main`
- HEAD: `b721d10` (0.11.5)
- Unpublished: 0.11.6 is on npm but package.json locally says 0.11.6
- No uncommitted changes (index.ts was restored to HEAD)
- **Do NOT push 0.11.x changes to origin** — go straight to 0.12.0
