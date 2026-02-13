# COAIA MCP Tools

This directory contains all MCP (Model Context Protocol) tool schemas organized by category.

## 📁 Directory Structure

```
tools/
├── stc/              Structural Tension Chart tools (11 tools)
├── narrative/        Narrative Beat tools (3 tools)
├── knowledge-graph/  Traditional Knowledge Graph tools (9 tools)
└── system/           System/meta tools (1 tool)
```

## 🎯 Quick Navigation

### By Use Case

**"I want to work with structural tension charts"**
→ See [stc/README.md](stc/README.md)

**"I want to capture story beats and narrative"**
→ See [narrative/README.md](narrative/README.md)

**"I want traditional entity/relation operations"**
→ See [knowledge-graph/README.md](knowledge-graph/README.md)

**"I want to configure LLM behavior"**
→ See [system/README.md](system/README.md)

### By Tool Group

COAIA organizes tools into groups that can be enabled/disabled via environment variables:

**STC_TOOLS** - Structural tension chart operations (11 tools)
```bash
COAIA_TOOLS="STC_TOOLS" npx coaia-memory
```

**NARRATIVE_TOOLS** - Narrative beat operations (3 tools)
```bash
COAIA_TOOLS="NARRATIVE_TOOLS" npx coaia-memory
```

**KG_TOOLS** - Knowledge graph operations (9 tools)
```bash
COAIA_TOOLS="KG_TOOLS" npx coaia-memory
```

**CORE_TOOLS** - Essential subset (4 tools)
```bash
COAIA_TOOLS="CORE_TOOLS" npx coaia-memory
```

**Mix and match:**
```bash
COAIA_TOOLS="STC_TOOLS,KG_TOOLS" npx coaia-memory
COAIA_TOOLS="STC_TOOLS,NARRATIVE_TOOLS,init_llm_guidance" npx coaia-memory
```

## 📊 Tool Count Summary

| Category | Tools | Purpose |
|----------|-------|---------|
| STC | 11 | Create and manage structural tension charts |
| Narrative | 3 | Capture multi-universe story beats |
| Knowledge Graph | 9 | Traditional entity/relation operations |
| System | 1 | LLM configuration and guidance |
| **Total** | **24** | Complete MCP tool set |

## 🚀 Common Workflows

### Getting Started with Charts

1. **See what exists** - `list_active_charts` ([stc/list_active_charts.json](stc/list_active_charts.json))
2. **Create new chart** - `create_structural_tension_chart` ([stc/create_structural_tension_chart.json](stc/create_structural_tension_chart.json))
3. **Add actions** - `manage_action_step` ([stc/manage_action_step.json](stc/manage_action_step.json))
4. **Track progress** - `update_action_progress` ([stc/update_action_progress.json](stc/update_action_progress.json))
5. **Complete actions** - `mark_action_complete` ([stc/mark_action_complete.json](stc/mark_action_complete.json))

### Expanding Detail

1. **See chart actions** - `list_active_charts`
2. **Expand action** - `manage_action_step` with `parentReference` = action name
   - Creates sub-chart automatically
   - Maintains hierarchy
   - Inherits due dates

### Capturing Narrative

1. **Create beat** - `create_narrative_beat` ([narrative/create_narrative_beat.json](narrative/create_narrative_beat.json))
2. **Add context** - Include prose, lessons, universes
3. **Expand beat** - `telescope_narrative_beat` ([narrative/telescope_narrative_beat.json](narrative/telescope_narrative_beat.json))
4. **View story** - `list_narrative_beats` ([narrative/list_narrative_beats.json](narrative/list_narrative_beats.json))

### Custom Knowledge Graph

1. **Create entities** - `create_entities` ([knowledge-graph/create_entities.json](knowledge-graph/create_entities.json))
2. **Connect them** - `create_relations` ([knowledge-graph/create_relations.json](knowledge-graph/create_relations.json))
3. **Add facts** - `add_observations` ([knowledge-graph/add_observations.json](knowledge-graph/add_observations.json))
4. **Search** - `search_nodes` ([knowledge-graph/search_nodes.json](knowledge-graph/search_nodes.json))

## 📝 Schema Format

All tool schemas follow the same pattern:

**JSON Schema Format:**
```json
{
  "type": "object",
  "properties": {
    "paramName": {
      "type": "string|number|array|...",
      "description": "Clear description of parameter purpose"
    }
  },
  "required": ["paramName"]
}
```

**Both Formats Available:**
- `tool_name.json` - JSON Schema
- `tool_name.yaml` - YAML equivalent

Use whichever format works better for your tooling.

## 🎨 Creative Orientation

All STC and Narrative tools are designed around **creative orientation** principles:

**Focus on Creation:**
- What do you want to create? (desired outcome)
- Where are you now? (current reality)
- What actions advance toward the outcome?

**Avoid Problem Orientation:**
- Not: "What problems do I have?"
- Not: "What needs fixing?"
- Not: "What should I avoid?"

See [system/README.md](system/README.md) for the `init_llm_guidance` tool that teaches this to LLMs.

## 🔍 Finding the Right Tool

### "I want to..."

**Create a new chart**
→ `create_structural_tension_chart` ([stc/](stc/))

**See all my charts**
→ `list_active_charts` ([stc/](stc/))

**Add an action to a chart**
→ `manage_action_step` ([stc/](stc/))

**Break down an action in detail**
→ `manage_action_step` with parent reference ([stc/](stc/))

**Mark an action complete**
→ `mark_action_complete` ([stc/](stc/))

**Update progress without completing**
→ `update_action_progress` ([stc/](stc/))

**Change current reality directly**
→ `update_current_reality` ([stc/](stc/))

**Refine the desired outcome**
→ `update_desired_outcome` ([stc/](stc/))

**Capture a story moment**
→ `create_narrative_beat` ([narrative/](narrative/))

**See all narrative beats**
→ `list_narrative_beats` ([narrative/](narrative/))

**Create custom entities**
→ `create_entities` ([knowledge-graph/](knowledge-graph/))

**Search for anything**
→ `search_nodes` ([knowledge-graph/](knowledge-graph/))

**Get complete graph data**
→ `read_graph` ([knowledge-graph/](knowledge-graph/))

**Initialize LLM with guidance**
→ `init_llm_guidance` ([system/](system/))

## ⚙️ Environment Configuration

Control which tools are available using environment variables:

```bash
# Default: STC + Narrative + init_llm_guidance
COAIA_TOOLS="STC_TOOLS,NARRATIVE_TOOLS,init_llm_guidance"

# Only STC tools
COAIA_TOOLS="STC_TOOLS"

# Everything
COAIA_TOOLS="STC_TOOLS,NARRATIVE_TOOLS,KG_TOOLS,init_llm_guidance"

# Specific tools only
COAIA_TOOLS="list_active_charts,create_structural_tension_chart,mark_action_complete"

# Disable specific tools from a group
COAIA_TOOLS="KG_TOOLS"
COAIA_DISABLED_TOOLS="delete_entities,delete_relations"
```

See main documentation for complete configuration options.

## 🏗️ Tool Dependencies

### Foundational Layer
**Knowledge Graph Tools** provide the foundation:
- Entity and relation storage
- CRUD operations
- Search and retrieval

### Abstraction Layers
**STC Tools** build on KG:
- Create chart entities with specific types
- Use semantic relation types
- Implement chart-aware operations

**Narrative Tools** build on KG:
- Create narrative_beat entities
- Support multi-universe tagging
- Track dramatic structure

### Meta Layer
**System Tools** configure behavior:
- Provide LLM guidance
- Initialize creative orientation context

## 🔗 Related Documentation

- **[../data-model/README.md](../data-model/README.md)** - Entity and Relation schemas
- **[../README.md](../README.md)** - Schema folder overview
- **[../examples/](../examples/)** - Usage examples
- **Main README:** `/README.md` - Project overview

## 📚 External Resources

- **MCP Protocol:** [Model Context Protocol](https://modelcontextprotocol.io)
- **Robert Fritz:** [Structural Tension Methodology](https://robertfritz.com)
- **Original KG:** [mcp-knowledge-graph](https://github.com/shaneholloman/mcp-knowledge-graph)

---

For detailed information on specific tool categories, navigate to the subdirectories above.
