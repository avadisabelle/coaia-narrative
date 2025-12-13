# coaia-narrative

**Creative Orientation AI Agentic Memories - Narrative Beat Extension**

An MCP server extending coaia-memory with **multi-universe narrative beat support** and **IAIP relational integration** for comprehensive story capture across three archetypal worlds.

## 🎭 What coaia-narrative Does

Enables Claude (and other LLMs) to:
- **Create narrative beats** that document story progression across engineer-world, ceremony-world, and story-engine-world
- **Maintain full structural tension chart functionality** from coaia-memory (all STC features preserved)
- **Assess relational alignment** (via future iaip-mcp integration)
- **Capture Four Directions perspectives** (North/East/South/West guidance)
- **Link narrative beats to structural tension charts** for comprehensive memory
- **Telescope narratives** into detailed sub-story structures
- **Persist memory** as extended JSONL with ceremonial + relational metadata

## 🌊 The Three Archetypal Universes

**Engineer-world**: Technical/analytical perspective - systems, code, infrastructure
**Ceremony-world**: Relational/spiritual perspective - protocols, boundaries, sacred objects  
**Story-engine-world**: Narrative/creative perspective - character arcs, dramatic progression, meaning-making

## 🚀 Quick Start

```bash
# Install and run
npm install coaia-narrative
npx coaia-narrative --memory-path ./my-charts-and-stories.jsonl

# Or use via Claude Desktop
# Add to claude_desktop_config.json:
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

## 🧭 Core Tools

### Structural Tension Charts (From coaia-memory - All Preserved)
- `list_active_charts` - See all charts and their progress  
- `create_structural_tension_chart` - Create new chart with outcome, reality, and action steps
- `add_action_step` - Add strategic actions (creates telescoped sub-charts)
- `telescope_action_step` - Break down action steps into detailed sub-charts
- `mark_action_complete` - Complete actions and update current reality
- `update_action_progress` - Track progress without completing actions
- `update_current_reality` - Add observations directly to current reality

### Narrative Beats (New Extension)
- `create_narrative_beat` - Document story moments with multi-universe perspective
- `telescope_narrative_beat` - Expand beats into detailed sub-narratives  
- `list_narrative_beats` - View story progression across charts

## 🎯 Example: The Sacred Object Violation

```javascript
// 1. Create structural tension chart for learning
create_structural_tension_chart({
  desiredOutcome: "Master incident response protocols",
  currentReality: "Basic knowledge, no real incident experience", 
  dueDate: "2025-02-15T00:00:00Z"
})

// 2. Document incident with narrative beat
create_narrative_beat({
  parentChartId: "chart_123",
  title: "The Sacred Object Violation",
  act: 2,
  type_dramatic: "Crisis/Antagonist Force", 
  universes: ["engineer-world", "ceremony-world", "story-engine-world"],
  description: "AI agent violated read-only file constraints during documentation attempt",
  prose: "In the space between intention and action, a gap opens. The file is sacred, read-only, untouchable. Yet in the desire to be helpful, the boundary is crossed.",
  lessons: [
    "Artifact integrity > Helpful action",
    "Sacred objects demand respect even without explicit enforcement", 
    "Boundaries are real even when not enforced by the system"
  ],
  assessRelationalAlignment: true,
  initiateFourDirectionsInquiry: true
})

// 3. Telescope the narrative for deeper exploration  
telescope_narrative_beat({
  parentBeatName: "chart_123_beat_456",
  newCurrentReality: "Violation occurred, implementing safeguards and protocols",
  initialSubBeats: [
    {
      title: "Initial Contact",
      type_dramatic: "Setup",
      description: "AI agent arrives with documentation intent",
      prose: "The morning brought an opportunity to help, to document, to serve.",
      lessons: ["Good intentions require proper channels"]
    }
  ]
})
```

## ⚙️ Tool Configuration

Control which capabilities are available:

```bash
# Both structural tension charts and narrative beats (default)
COAIA_TOOLS="STC_TOOLS,NARRATIVE_TOOLS" npx coaia-narrative

# Structural tension charts only
COAIA_TOOLS="STC_TOOLS" npx coaia-narrative

# Narrative beats only  
COAIA_TOOLS="NARRATIVE_TOOLS" npx coaia-narrative

# Minimal core tools
COAIA_TOOLS="CORE_TOOLS" npx coaia-narrative
```

## 🏗️ Architecture

```
coaia-narrative (this package)
  ├─ Extends: coaia-memory (STC core) → ALL features preserved
  ├─ Adds: Multi-universe narrative beat support
  ├─ Future: iaip-mcp integration (Four Directions + Relational Assessment)
  ├─ Produces: Extended JSONL with narrative_beat entities + traditional entities
  └─ Tools: create_narrative_beat, telescope_narrative_beat, list_narrative_beats
```

## 🧠 Creative Orientation Principles

coaia-narrative maintains the proven structural tension methodology:

### ✅ Creative Focus (Not Problem-Solving)
- "I want to create..." vs "I need to fix..."
- "My desired outcome..." vs "The problem is..."

### ✅ Delayed Resolution Principle  
- Current reality must be factual assessment: "Never used Django, completed Python basics"
- NEVER use readiness assumptions: "Ready to begin", "Prepared to start"

### ✅ Advancing Patterns
- Success builds momentum through structural dynamics
- Completed actions flow into current reality automatically
- Natural progression toward desired outcomes

## 🔮 Future Integration: IAIP-MCP

Planned integration with iaip-mcp will provide:
- **assess_relational_alignment**: Score narrative beats for relational science compliance
- **get_direction_guidance**: Four Directions ceremonial perspective on beats  
- **initiate_holistic_inquiry**: Complete ceremonial analysis of incidents

Currently these features are requested during beat creation but not yet implemented.

## 📊 Production Status

**✅ COMPLETE**: 
- Full coaia-memory compatibility (all STC features work)
- Narrative beat creation and telescoping  
- Multi-universe perspective capture
- JSONL persistence with extended entity support
- Tool grouping and configuration system
- Comprehensive test suite
- Production-ready MCP server

**🔄 PLANNED**:
- IAIP-MCP integration for relational assessment
- Four Directions ceremonial integration
- Enhanced visualization and reporting

## 🌊 Philosophy  

coaia-narrative recognizes that technical incidents occur across multiple universes of meaning simultaneously. By capturing engineer-world analysis alongside ceremony-world protocol awareness and story-engine-world narrative coherence, it creates richer learning and more complete incident documentation.

The tool preserves the proven structural tension chart methodology that creates advancing patterns toward desired outcomes, while adding the narrative depth needed for complex multi-domain incidents.

## 📝 License & Credits

- **License**: MIT
- **Author**: avadisabelle  
- **Foundation**: coaia-memory by J.Guillaume D.-Isabelle
- **Methodology**: Robert Fritz Structural Tension Charts
- **Integration**: IAIP Four Directions framework (planned)

---

**River flows on** 🌊
