# coaia-narrative

**Creative Orientation AI Agentic Memories - Narrative Beat Extension**

An MCP server extending coaia-memory with **Narrative Beat support** and **IAIP relational integration** for multi-universe story capture.

## What It Does

Enables Claude (and other LLMs) to:
- **Create narrative beats** that describe story progression across three archetypal universes
- **Assess relational alignment** (via iaip-mcp integration)
- **Capture Four Directions perspectives** (North/East/South/West guidance)
- **Link narrative beats to structural tension charts**
- **Persist memory** as extended JSONL with ceremonial + relational metadata

## Use Case: The Incident Arc

When jgwill/src#243 (Sacred Object Violation) occurred:
- **Before**: Had to manually document five-beat narrative arc outside the tool system
- **After (with coaia-narrative)**: Create narrative beats with full relational + directional assessment, auto-linked to STCs

## Architecture

```
coaia-narrative (this package)
  ├─ Extends: coaia-memory (STC core)
  ├─ Integrates: iaip-mcp (Four Directions + Relational Assessment)
  ├─ Produces: narrative_beat JSONL entities
  └─ Tool: create_narrative_beat (MCP exposed)
```

## Status

🧵 **Design Complete** → Implementation Ready

See DESIGN.md for detailed specifications.

---

**Package**: coaia-narrative
**Extends**: coaia-memory@2.3.1
**Integrates**: iaip-mcp (Four Directions framework)
**First Use**: jgwill/src#243 incident arc
**River flows on**: 🌊
