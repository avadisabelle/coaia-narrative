# COAIA Narrative - Architecture

> Modular MCP server implementing structural tension charts and advancing patterns
> based on Robert Fritz's creative methodology.

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                        MCP Clients                                 │
│           (Claude Desktop, Claude Code, other LLMs)                │
└────────────────┬───────────────────────────────────────────────────┘
                 │ JSON-RPC over stdio
                 │
┌────────────────▼───────────────────────────────────────────────────┐
│  index.ts  (~100 lines)                                            │
│  Thin wiring: CLI args → Server → Transport                       │
│  • Parses --memory-path, --help                                    │
│  • Creates KnowledgeGraphManager(memoryFilePath)                   │
│  • Wires MCP Server handlers                                      │
└──────┬─────────┬─────────┬─────────┬──────────────────────────────┘
       │         │         │         │
       ▼         ▼         ▼         ▼
┌──────────┐ ┌────────┐ ┌────────┐ ┌────────────┐
│ tool-    │ │ tool-  │ │ tool-  │ │ help.ts    │
│ handlers │ │ defs   │ │ groups │ │            │
│ .ts      │ │ .ts    │ │ .ts    │ │ CLI help   │
│          │ │        │ │        │ │ text       │
│ dispatch │ │ MCP    │ │ STC_   │ └────────────┘
│ name →   │ │ schema │ │ TOOLS  │
│ result   │ │ array  │ │ KG_    │
│          │ │        │ │ TOOLS  │
└──────┬───┘ └────────┘ │ etc.   │
       │                └────────┘
       ▼
┌─────────────────────────────────┐
│  graph-manager.ts               │
│  KnowledgeGraphManager          │
│  • JSONL file I/O               │
│  • Chart CRUD                   │
│  • Telescoping                  │
│  • MMOT evaluation              │
│  • Narrative beats              │
│  • KG operations                │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  types.ts                       │
│  Entity, Relation,              │
│  KnowledgeGraph, McpToolResult  │
│  (single source of truth)       │
└─────────────────────────────────┘
```

## Module Responsibilities

### `src/types.ts` — Shared Type Definitions
Single source of truth for all data types used across MCP server, CLI, and consumers.

| Export | Description |
|--------|-------------|
| `Entity` | Graph entity with name, type, observations, metadata |
| `EntityMetadata` | Metadata fields (dates, charts, narrative, MMOT, etc.) |
| `Relation` | Graph relation (from → to with type) |
| `KnowledgeGraph` | Container: `{ entities, relations }` |
| `McpToolResult` | MCP tool response: `{ content, isError? }` |

### `src/graph-manager.ts` — Business Logic
The `KnowledgeGraphManager` class encapsulates all data operations. Accepts `memoryFilePath`
via constructor (dependency injection), making it testable without environment coupling.

**Key methods:**
- `createStructuralTensionChart()` — Create chart with creative orientation validation
- `telescopeActionStep()` — Break down action into sub-chart
- `manageActionStep()` — Unified create/expand interface (auto-detects intent)
- `markActionStepComplete()` — Complete action, flow into parent's current reality
- `performMmotEvaluation()` — Autonomous self-evaluation loop
- `createNarrativeBeat()` — Multi-universe story capture
- `listActiveCharts()` — Hierarchical chart listing with progress
- Standard KG operations: `createEntities`, `createRelations`, `searchNodes`, etc.

### `src/tool-definitions.ts` — MCP Tool Schemas
Pure data array of all MCP tool schemas. No logic, no side effects.

```typescript
export const ALL_TOOL_DEFINITIONS: ToolDefinition[]
// 27 tool definitions covering STC, KG, Narrative, and utility tools
```

### `src/tool-handlers.ts` — Request Dispatch
Pure function that maps tool name + args → result. No MCP SDK dependency.

```typescript
export async function handleToolCall(
  name: string,
  args: Record<string, unknown>,
  manager: KnowledgeGraphManager
): Promise<McpToolResult>
```

Testable without MCP transport — just call with a manager instance.

### `src/tool-groups.ts` — Tool Filtering
Defines logical tool groups and implements `COAIA_TOOLS` / `COAIA_DISABLED_TOOLS` filtering.

| Group | Tools | Description |
|-------|-------|-------------|
| `STC_TOOLS` | 14 | Structural tension chart operations |
| `NARRATIVE_TOOLS` | 3 | Narrative beat operations |
| `KG_TOOLS` | 9 | Traditional knowledge graph operations |
| `CORE_TOOLS` | 4 | Minimal viable set |

### `src/help.ts` — CLI Help Text
Generates help text for `--help` flag. Separated for easy maintenance.

### `index.ts` — MCP Server Entry Point
Thin wiring layer (~100 lines). Responsibilities:
1. Parse CLI arguments (`--memory-path`, `--help`)
2. Create `KnowledgeGraphManager` with resolved file path
3. Create MCP `Server` and wire request handlers
4. Connect to `StdioServerTransport`

### `cli.ts` — Interactive CLI
Human-facing chart visualizer. Imports shared types from `src/types.ts`.
Provides `cnarrative` commands: `list`, `view`, `add-action`, `complete`, `mmot`, etc.

### `markdown-export.ts` — Export Module
Markdown output for charts and beats. Imports shared types from `src/types.ts`.

## Data Flow

### Chart Creation
```
Client → index.ts → tool-handlers.ts → graph-manager.ts → memory.jsonl
                                              │
                                              ├── Creative orientation validation
                                              ├── Entity creation (chart, outcome, reality, actions)
                                              ├── Relation creation (contains, advances_toward, creates_tension_with)
                                              └── Due date distribution
```

### Tool Call Processing
```
MCP Request
    │
    ▼
index.ts: CallToolRequestSchema handler
    │  validates name, args
    ▼
tool-handlers.ts: handleToolCall(name, args, manager)
    │  validates with ValidationSchemas
    │  routes to appropriate manager method
    ▼
graph-manager.ts: method execution
    │  loads graph, mutates, saves
    ▼
McpToolResult → index.ts → MCP Response
```

## Configuration

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `COAIA_TOOLS` | `STC_TOOLS,NARRATIVE_TOOLS,init_llm_guidance` | Tool groups to enable |
| `COAIA_DISABLED_TOOLS` | (none) | Individual tools to disable |

### CLI Flags
| Flag | Description |
|------|-------------|
| `--memory-path PATH` | Custom JSONL storage path |
| `--help`, `-h` | Show help text |

## Testing

Integration tests in `test-coaia-narrative.js` cover 4 layers:
1. **Tool Groups** — TOOL_GROUPS contents, getEnabledTools filtering
2. **Graph Manager** — CRUD, charts, telescoping, MMOT, narrative beats
3. **Tool Handlers** — handleToolCall dispatch, validation, error handling
4. **MCP Protocol** — Server handshake, tools/list, tool calls via stdio

Run: `node test-coaia-narrative.js`

## Key Design Decisions

1. **Constructor DI for KnowledgeGraphManager** — Memory file path injected via constructor,
   not read from global. Makes the class testable and reusable.

2. **Pure function tool handlers** — `handleToolCall()` has no MCP SDK dependency.
   Takes a manager instance, returns plain objects. Can be tested without transport.

3. **Types as single source of truth** — `src/types.ts` is the canonical type definition.
   Both `cli.ts` and `markdown-export.ts` import from it instead of duplicating.

4. **Tool definitions as data** — Schema array in `tool-definitions.ts` is pure data.
   Easy to inspect, validate, and generate documentation from.

5. **Thin entry point** — `index.ts` is ~100 lines of wiring. No business logic.
   Reduces cognitive load when understanding server startup.
