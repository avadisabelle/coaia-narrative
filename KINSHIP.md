# KINSHIP

## 1. Identity and Purpose
- Name: coaia-narrative (avadisabelle/coaia-narrative)
- Local role in this system: Elder sibling and schema authority. Defines the Entity/Relation JSONL format that all STC tools read and write.
- What this place tends / protects: The structural integrity of how charts, narratives, and knowledge graphs are represented — Entity/Relation JSONL is the canonical transport format
- What this place offers (its gifts): `cnarrative` CLI (ls, view, add-action, export, mmot), MCP server, JSONL schema at `schema/`, Entity/Relation types that all siblings depend on

## 2. Lineage and Relations
- Ancestors:
  - `shaneholloman/mcp-knowledge-graph` — original fork, knowledge graph MCP server
  - Robert Fritz's structural tension methodology
- Descendants:
  - `Miadi-18/lib/coaia-narrative` — consumed as git submodule for schema authority
- Siblings (peer projects it walks with):
  - `/a/src/coaia-pde/` — PDE→STC bridge, produces JSONL compatible with this schema
  - `/a/src/coaia-planning/` — plan→STC transformer, emits this schema's JSONL
  - `/a/src/coaia-visualizer/` — web UI that serves this schema's JSONL files
  - `/a/src/mia-code/miaco/` — CLI that should write this schema (convergence pending)
- Related hubs:
  - `/workspace/repos/jgwill/medicine-wheel/` — `ontology-core` defines the semantic meaning; this repo defines the representation
  - `/a/src/mcp-pde/` — upstream decomposition engine; its output feeds into STC creation here
  - `/workspace/repos/jgwill/veritas/` — MMOT evaluator that operates on charts stored in this format
  - `/home/mia/.openclaw/workspace/` — `.mw/south/` is the directional workspace where charts live

## 3. Human and More-than-Human Accountabilities
- People / roles: Guillaume (jgwill) — steward and architect
- Communities: CoAIA agent ecosystem (Mia, Miette, Tushell, Ava)
- More-than-human relations: The structural tension methodology itself — charts are not task lists but creative tension structures
- Existing covenants: MIT license. JSONL schema contract consumed by all siblings. OCAP® compliance via ontology-core

## 4. Responsibilities and Boundaries
- Responsibilities:
  - Maintain Entity/Relation JSONL schema as canonical STC representation
  - Keep `schema/` documentation aligned with implementation
  - Ensure `cnarrative` CLI reads any valid JSONL regardless of which tool wrote it
- Reciprocity: Sibling repos contribute schema extensions back; coaia-narrative validates them
- Boundaries and NOs:
  - Does NOT define ontological meaning — that belongs to medicine-wheel/ontology-core
  - Does NOT decompose prompts — that belongs to mcp-pde
  - Does NOT serve web UI — that belongs to coaia-visualizer
- Tensions held:
  - Relation to ontology-core `StructuralTensionChart` type — alignment confirmed but formal bridge not yet built (miadisabelle/workspace-openclaw#28)
  - miaco chart writes flat JSON, not this schema — convergence needed

## 5. Accountability and Change Log
- Steward(s): Guillaume D.-Isabelle (jgwill)
- How and when reviewed: On schema changes or when new siblings adopt the format
- Relational change log:
  - [2025-03-19] — Miadi-18 submodule integration documented
  - [2026-03-21] [pi-mono] — KINSHIP.md upgraded. Elder sibling role formalized. `.mw/south/` identified as directional workspace for charts. Convergence issue: miadisabelle/workspace-openclaw#28
