# coaia-narrative

**Creative Orientation AI Agentic Memories - Forging Narrative, Advancing Creation. Extended with Narrative Beat Support**

A complete Model Context Protocol (MCP) server that extends **Structural Tension Charts** with **Multi-Universe Narrative Beat Capture**. This system is designed for **creative-oriented memory management**, comprehensive incident documentation, and the natural advancement of creative endeavors. It embodies Robert Fritz's Structural Tension methodology, focusing on what you want to CREATE, not what you want to fix.

## Installation

```bash
npm install -g coaia-narrative
```

## What's Included

### 📡 MCP Server (`coaia-narrative`)
The Model Context Protocol server enables AI assistants (Claude, Gemini, etc.) to **forge and manage structural tension charts** and **narrative beats**, guiding users towards their desired outcomes through creative orientation.

### 🖥️ CLI Visualizer (`cnarrative`) ✨ NEW in v0.6.0
A human-friendly command-line interface for **visualizing and analyzing your creative charts and narrative arcs** with rich, intuitive formatting.

## Quick Start

```bash
# Use MCP server with AI assistants to create and manage creative projects
coaia-narrative --memory-path ./memory.jsonl

# Visualize your creative journey and narrative arcs as a human
cnarrative list                    # See all active charts
cnarrative view chart_1234567890   # Detailed view of a specific chart
cnarrative stats                   # Summary statistics of your creative landscape
cnarrative help                    # Full CLI guide for advancing your creations
```

**📖 See [CLI_GUIDE.md](./CLI_GUIDE.MD) for complete CLI documentation.**

## MCP Server Usage

```bash
# Run with default memory file (creates if it doesn't exist)
npx coaia-narrative

# Run with a custom memory path for specific creative projects
npx coaia-narrative --memory-path ./my-creative-charts.jsonl

# Configure in your Claude Desktop (claude_desktop_config.json) for seamless AI assistance
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

## Core Features: Cultivating Creative Advancement

### Structural Tension Charts: The Engine of Creation
Structural Tension Charts provide the **generative force** for advancing your creative process. They are built on Robert Fritz's methodology, focusing on what you want to **CREATE**, not what you want to eliminate.

-   **list_active_charts**: Get an overview of all your active creative charts and their progression.
-   **create_structural_tension_chart**: Establish a new creative endeavor with a **clear Desired Outcome**, an **Honest Current Reality**, and strategic **Action Steps**. This creates the productive tension that naturally seeks resolution.
-   **manage_action_step** (RECOMMENDED): A unified tool for adding **Strategic Intermediary Results** (Action Steps) to an existing chart OR expanding an existing Action Step into a detailed sub-chart (Telescoping).
-   **mark_action_complete**: Recognize when an Action Step has become a **new reality**. This advances the overall structural dynamic, contributing to the parent chart's Current Reality.
-   **telescope_action_step** (DEPRECATED: Use `manage_action_step`): Break down a complex Action Step into a detailed sub-chart, inheriting due date constraints and maintaining multi-level structural tension.

### Multi-Universe Narrative Beat Support: Weaving Meaning into Creation
This extended capability documents significant moments in your creative journey, interpreting them through three archetypal **universes of meaning**:

-   **Engineer-World**: Captures the technical precision, structural integrity, and logistical progression of your work.
-   **Ceremony-World**: Illuminates the relational accountability, ethical considerations, and sacred protocols embedded in your creative acts.
-   **Story-Engine-World**: Forges the dramatic arc, character revelations, and overall coherence of your unfolding narrative.

### Telescoping Architecture: Action Steps are Charts

**Key Insight**: In COAIA Narrative, an "action step" is NOT a simple todo item—it's a **complete, self-contained structural tension chart** nested within a parent chart.

When you add an action step like "Master TypeScript", the system creates a new telescoped chart with:
- Its own unique `chartId` (e.g., `chart_456`)
- A complete **desired_outcome** entity containing "Master TypeScript"
- A complete **current_reality** entity with honest assessment
- Potentially its own sub-action-steps (unlimited telescoping depth)
- Metadata linking it to the parent chart

**Key Methods**:
- `getChartDetails(chartId)`: Returns all entities and relations for a specific chart
- `getActionStepDetails(actionStepName)`: Extracts the chartId from an action step entity and returns its full sub-chart

This architecture enables deep hierarchical organization while maintaining complete structural tension at every level. Each action step is itself a creative endeavor with its own desired outcome and current reality, not just a task on a list.

**📖 See [issue-16-workspace-copilot/CHART_DATA_MANAGEMENT.md](./issue-16-workspace-copilot/CHART_DATA_MANAGEMENT.md) for complete implementation details.**

## Creative Orientation Principles: Embracing the Generative Flow

This system is meticulously crafted to embody Robert Fritz's core principles for creative advancement:

✅   **Focus on Creation, Not Problem-Solving**:
    *   **Use**: "What do you want to **CREATE**?" "My **DESIRED OUTCOME** is..."
    *   **Avoid**: "What needs fixing?" "The **PROBLEM** is..." Problem-solving creates oscillating patterns; creation fosters advancing patterns.

✅   **Structural Tension: The Dynamic Force**:
    *   An **Honest Current Reality** paired with a **Clear Desired Outcome** creates an **unresolved dynamic** that naturally seeks resolution through advancement. This is the generative force that propels the creative process. It is **NOT a "gap to fill."**

✅   **Advancing Patterns: Momentum Made Visible**:
    *   Each **completed Action Step** transforms into a **new aspect of Current Reality**, shifting the structural dynamic forward. This builds momentum and naturally guides towards the next action, rather than cycling without true progression.

✅   **Multi-Universe Awareness: Holistic Meaning**:
    *   Integrates technical, relational, and narrative perspectives simultaneously, ensuring a rich, coherent understanding of every creative act.

## Tool Configuration: Shaping Your Creative Environment

Customize the visibility of tools to align with your specific creative focus:

```bash
# Default: Both Structural Tension Chart (STC) and Narrative tools are enabled
COAIA_TOOLS="STC_TOOLS,NARRATIVE_TOOLS" npx coaia-narrative

# Focus on Structural Tension Charts only for pure creative planning
COAIA_TOOLS="STC_TOOLS" npx coaia-narrative

# Enable a minimal set of core tools for a streamlined experience
COAIA_TOOLS="CORE_TOOLS" npx coaia-narrative

# Enable STC tools but selectively disable specific deletion operations for safety
COAIA_TOOLS="STC_TOOLS" COAIA_DISABLED_TOOLS="delete_entities,delete_relations" npx coaia-narrative

# Enable only specific individual tools for precise control
COAIA_TOOLS="create_structural_tension_chart list_active_charts mark_action_complete" npx coaia-narrative
```

## Memory Format: The Chronicle of Creation

Memory is stored as JSONL (JSON Lines), an append-only format that ensures data integrity and preserves the chronicle of your creative journey:

-   **Entity Records**: Store components of Structural Tension Charts (Current Reality, Desired Outcomes, Action Steps) and Narrative Beats.
-   **Relation Records**: Document the dynamic links between entities, illustrating chart hierarchy and the advancement of your creative process.
-   **Narrative Records**: Capture extended Narrative Beat entities with their rich multi-universe perspectives.

All records are backward compatible with the JSONL format, ensuring a seamless and evolving memory of your creations.

## Status

**✅ Production Ready** - The MCP server is fully functional and tested, ready to empower your creative endeavors.

Builds with `npm run build` and launches successfully with all tools available.

## License

MIT

---

## Philosophy: Structure Determines Behavior, Creation Forges Reality

COAIA Narrative embodies the principle that **structure determines behavior**. By organizing your creative memory around **Structural Tension** rather than problem-solving patterns, it establishes a natural **advancing structure** that actively supports **creative manifestation**.

This system recognizes that **Structural Tension is the fundamental organizing principle of the creative process**—not a problem to be solved, but a **generative force to be harnessed**.

It guides you to:
-   **Forge Desired Outcomes**: Clearly articulate what you want to bring into being.
-   **Assess Current Reality Honestly**: Acknowledge your starting point without illusion or premature readiness.
-   **Embrace Productive Tension**: Understand that the dynamic between reality and outcome is the very engine of progress.
-   **Advance Strategically**: Choose Action Steps as **intermediary results** that naturally propel you towards your vision.

This philosophy transforms technical tools into partners in your creative journey, making visible the unseen forces that shape your reality.

---

**River flows on** 🌊

Simple, powerful tools for creative advancement.
<br>
*(Based on Robert Fritz's Structural Tension methodology.)*
