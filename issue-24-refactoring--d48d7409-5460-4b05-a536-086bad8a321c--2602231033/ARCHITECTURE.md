# Architecture Plan: coaia-narrative 0.12.0 Modular Refactor

## Current State (monolith)

```
index.ts (2500 lines) — everything in one file:
  ├── CLI help text (~150 lines)
  ├── Tool groups config (~40 lines)
  ├── Entity/Relation/KnowledgeGraph interfaces (~70 lines)
  ├── KnowledgeGraphManager class (~1200 lines)
  │   ├── loadGraph / saveGraph
  │   ├── CRUD: entities, relations, observations
  │   ├── STC: createChart, telescope, addAction, markComplete, etc.
  │   ├── MMOT: performMmotEvaluation (NEW in 0.11.x)
  │   └── Narrative: createBeat, telescopeBeat, listBeats
  ├── MCP Server setup (~10 lines)
  ├── Tool definitions / schemas (~600 lines)
  ├── Tool handlers / switch cases (~500 lines)
  └── main() bootstrap (~10 lines)

cli.ts (1000 lines) — DUPLICATES Entity/Relation types from index.ts
markdown-export.ts — exports for CLI
validation.ts — input validation (standalone, clean)
generated-llm-guidance.ts — guidance text (standalone, clean)
```

## Target State (modular)

```
src/
├── types.ts                    — Entity, Relation, KnowledgeGraph, metadata interfaces
├── graph-manager.ts            — KnowledgeGraphManager class (CRUD + STC + MMOT + Narrative)
├── tool-definitions.ts         — MCP tool schemas (pure JSON objects)
├── tool-handlers.ts            — CallToolRequest dispatcher (switch → handler functions)
├── tool-groups.ts              — TOOL_GROUPS config + getEnabledTools()
├── help.ts                     — CLI help text generator
├── validation.ts               — (unchanged)
├── generated-llm-guidance.ts   — (unchanged)
├── markdown-export.ts          — (unchanged)
├── index.ts                    — MCP server wiring only (~50 lines)
└── cli.ts                      — CLI wiring only (imports from shared modules)
```

## Module Responsibilities

### `types.ts`
```typescript
export interface Entity { ... }
export interface Relation { ... }
export interface KnowledgeGraph { entities: Entity[]; relations: Relation[] }
```
- Single source of truth for data types
- Both `index.ts` (MCP) and `cli.ts` import from here
- Eliminates the type duplication between MCP and CLI

### `graph-manager.ts`
```typescript
export class KnowledgeGraphManager {
  constructor(memoryFilePath: string) { ... }
  // All existing methods, unchanged logic
}
```
- Takes `memoryFilePath` as constructor parameter (instead of module-level const)
- Contains ALL business logic: CRUD, STC, MMOT, Narrative
- No MCP-specific code — pure data operations
- Reusable by MCP server, CLI, future UI, tests

### `tool-definitions.ts`
```typescript
export const ALL_TOOL_DEFINITIONS = [ ... ];
```
- Pure data: array of MCP tool schema objects
- No logic, no imports beyond types
- Easy to review, test, and extend

### `tool-groups.ts`
```typescript
export const TOOL_GROUPS = { STC_TOOLS: [...], NARRATIVE_TOOLS: [...], ... };
export function getEnabledTools(): Set<string> { ... }
```
- Tool filtering logic isolated
- Easy to add new groups

### `tool-handlers.ts`
```typescript
export async function handleToolCall(
  name: string,
  args: Record<string, unknown>,
  manager: KnowledgeGraphManager
): Promise<McpToolResult> { ... }
```
- Pure function: tool name + args → result
- No MCP SDK dependency (just returns plain objects)
- Testable without MCP transport

### `help.ts`
```typescript
export function getHelpText(version: string): string { ... }
```
- Hardcoded branding with version parameter
- All `coaia-narrative` references

### `index.ts` (thin)
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { KnowledgeGraphManager } from "./graph-manager.js";
import { ALL_TOOL_DEFINITIONS } from "./tool-definitions.js";
import { handleToolCall } from "./tool-handlers.js";
import { getEnabledTools } from "./tool-groups.js";
import { getHelpText } from "./help.js";

// Parse args, show help, create manager, wire MCP handlers, start
```

## Migration Strategy

1. **Extract `types.ts`** from Entity/Relation/KnowledgeGraph in current index.ts
2. **Extract `graph-manager.ts`** — move class, parameterize memoryFilePath
3. **Extract `tool-definitions.ts`** — copy tool schema objects
4. **Extract `tool-groups.ts`** — move TOOL_GROUPS + getEnabledTools
5. **Extract `tool-handlers.ts`** — move switch cases into function
6. **Extract `help.ts`** — move help text
7. **Rewrite `index.ts`** — thin wiring
8. **Update `cli.ts`** — import from shared `types.ts` and `graph-manager.ts`
9. **Apply MMOT fixes** during extraction (add `manage_action_step` to STC_TOOLS, etc.)
10. **Build, test, publish 0.12.0**

## Key Constraint

**Same logic, different files.** No behavioral changes beyond:
- Adding `manage_action_step` to `STC_TOOLS`
- Fixing help text branding
- Version bump to 0.12.0

## Verification

Same as HANDOFF.md checklist — MCP handshake, tools/list, tool calls all work.
