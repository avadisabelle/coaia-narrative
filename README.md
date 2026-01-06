# coaia-narrative

**Creative Orientation AI Agentic Memories - Extended with Narrative Beat Support**

A complete MCP server extending structural tension charts with multi-universe narrative beat capture for comprehensive incident documentation and creative-oriented memory management.

## Installation

```bash
npm install -g coaia-narrative
```

## What's Included

### 📡 MCP Server (`coaia-narrative`)
Model Context Protocol server for AI assistants (Claude, Gemini, etc.) to create and manage structural tension charts.

### 🖥️ CLI Visualizer (`cnarrative`) ✨ NEW in v0.6.0
Human-friendly command-line interface for viewing and analyzing your charts with rich visual formatting.

## Quick Start

```bash
# Use MCP server with AI assistants
coaia-narrative --memory-path ./memory.jsonl

# Visualize charts as a human
cnarrative list                    # See all charts
cnarrative view chart_1234567890   # Detailed view
cnarrative stats                   # Summary statistics
cnarrative help                    # Full CLI guide
```

**📖 See [CLI_GUIDE.md](./CLI_GUIDE.md) for complete CLI documentation.**

## MCP Server Usage

```bash
# Run with default memory file
npx coaia-narrative

# Run with custom memory path
npx coaia-narrative --memory-path ./my-charts.jsonl

# In Claude Desktop (claude_desktop_config.json)
{
  "mcpServers": {
    "coaia-narrative": {
      "command": "npx",
      "args": ["-y", "coaia-narrative", "--memory-path", "./narrative-memory.jsonl"],
      "env": {
        "COAIA_TOOLS": "STC_TOOLS,NARRATIVE_TOOLS"
      }
    }
  }
}
```

## Core Features

### Structural Tension Charts (Proven Foundation)
- **list_active_charts** - View all charts and progress
- **create_structural_tension_chart** - Create new chart with desired outcome + current reality + action steps
- **add_action_step** - Add strategic actions (creates telescoped sub-charts)
- **telescope_action_step** - Break down actions into detailed sub-charts
- **mark_action_complete** - Complete actions and update current reality

### Narrative Beat Support (Extended Capability)
Documents complex incidents across three archetypal universes:
- **Engineer-world**: Technical/analytical perspective
- **Ceremony-world**: Relational/spiritual protocol awareness
- **Story-engine-world**: Narrative/creative progression

## Creative Orientation Principles

✅ **Focus on Creation** - "What do you want to create?" not "What needs fixing?"
✅ **Structural Tension** - Honest current reality + clear desired outcome creates natural momentum
✅ **Advancing Patterns** - Success builds momentum; completed actions flow into reality
✅ **Multi-Universe Awareness** - Technical + relational + narrative perspectives simultaneously

## Tool Configuration

```bash
# Default: Both STCs and narrative tools
COAIA_TOOLS="STC_TOOLS,NARRATIVE_TOOLS" npx coaia-narrative

# Structural tension charts only
COAIA_TOOLS="STC_TOOLS" npx coaia-narrative

# Minimal core tools
COAIA_TOOLS="CORE_TOOLS" npx coaia-narrative
```

## Memory Format

Memory stored as JSONL with:
- **Entity records** - Structural tension charts, current reality, desired outcomes, action steps
- **Relation records** - Links between entities showing chart hierarchy and advancement
- **Narrative records** - Extended narrative beat entities with multi-universe perspective

All records are backward compatible JSONL format.

## Status

**✅ Production Ready** - MCP server fully functional and tested

Builds with `npm run build` and launches successfully with all tools available.

## License

MIT
