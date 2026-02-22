# COAIA Narrative Schema Documentation

This folder contains comprehensive schema documentation for the COAIA (Creative-Oriented AI Assistant) Narrative system. The schemas define both the data models and the MCP tool interfaces that applications can use to interact with structural tension charts and knowledge graphs.

## 📁 Quick Navigation

### Data Models
- **[data-model/](data-model/)** - Core data structures (Entity, Relation, KnowledgeGraph, Storage Format)
- **[data-model-complete.json](data-model-complete.json)** - ✨ **Single consolidated file** with all data schemas
- **[data-model-complete.yaml](data-model-complete.yaml)** - Same as above in YAML format

### MCP Tools
- **[tools/stc/](tools/stc/)** - Structural Tension Chart tools (11 tools)
- **[tools/narrative/](tools/narrative/)** - Narrative Beat tools (3 tools)
- **[tools/knowledge-graph/](tools/knowledge-graph/)** - Traditional Knowledge Graph tools (9 tools)
- **[tools/system/](tools/system/)** - System/meta tools (1 tool)

### Reference Materials
- **[examples/](examples/)** - Example payloads and usage patterns
- **[index.json](index.json)** / **[index.yaml](index.yaml)** - Central registry mapping all schemas

## 🎯 For External Applications

### Quick Start: Understanding COAIA Data

If you want to understand what data COAIA stores and how it's structured:

1. **Read `data-model-complete.json`** (or `.yaml`) - This single file contains everything:
   - Entity structure with all metadata fields
   - Relation structure with all relation types
   - KnowledgeGraph container format
   - JSONL storage format specification

2. **Browse `data-model/` folder** - Same schemas broken down into individual files for easier navigation

### Quick Start: Implementing MCP Tools

If you want to implement or call COAIA's MCP tools:

1. **Check `index.json`** - Find the tool category you need
2. **Navigate to `tools/{category}/`** - Browse available tools in that category
3. **Read the tool's schema** - Each tool has both `.json` and `.yaml` versions
4. **Check `examples/`** - See real-world usage patterns

## 📊 Data Model Overview

### Core Structures

**Entity** - Nodes in the knowledge graph
- Unique name identifier
- Type classification (structural_tension_chart, desired_outcome, action_step, etc.)
- Array of observations (facts/statements)
- Rich metadata (dates, hierarchy, creative phase, narrative context)

**Relation** - Edges connecting entities
- Source entity (from)
- Target entity (to)
- Relation type (creates_tension_with, advances_toward, telescopes_into, etc.)
- Optional metadata (strength, context, description)

**KnowledgeGraph** - Container holding entities and relations
- Array of entities
- Array of relations

### Storage Format

Data is persisted in **JSONL** (JSON Lines) format:
- One JSON object per line
- Each line has a `type` field: either `"entity"` or `"relation"`
- Entity lines contain: `{type, name, entityType, observations, metadata}`
- Relation lines contain: `{type, from, to, relationType, metadata}`

See `data-model/storage-format.json` for full specification.

## 🛠️ MCP Tools Overview

### Structural Tension Chart Tools (STC_TOOLS)

**Core Workflow:**
1. `list_active_charts` - See all charts and progress
2. `create_structural_tension_chart` - Create new chart with outcome + reality
3. `add_action_step` / `manage_action_step` - Add strategic actions
4. `telescope_action_step` - Break down actions into sub-charts
5. `mark_action_complete` - Complete actions (flows into current reality)

**Updates & Progress:**
- `update_action_progress` - Track progress without completing
- `update_current_reality` - Add observations directly
- `update_desired_outcome` - Refine the desired outcome

**Advanced:**
- `get_chart_progress` - Detailed progress metrics
- `perform_mmot_evaluation` - Autonomous MMOT self-evaluation with Elements of Performance
- `remove_action_step` - Remove actions (use carefully)

See [tools/stc/README.md](tools/stc/README.md) for details.

### Narrative Beat Tools (NARRATIVE_TOOLS)

Multi-universe storytelling support:
- `create_narrative_beat` - Capture story moments across universes
- `telescope_narrative_beat` - Expand beats into detailed sub-stories
- `list_narrative_beats` - View all beats with filtering

See [tools/narrative/README.md](tools/narrative/README.md) for details.

### Knowledge Graph Tools (KG_TOOLS)

Traditional graph operations (foundation layer):
- `create_entities` - Add entities (people, concepts, events)
- `create_relations` - Connect entities with relationships
- `add_observations` - Record facts about entities
- `search_nodes` - Search across all data
- `open_nodes` - Retrieve specific entities
- `read_graph` - Export complete graph
- `delete_*` - Remove entities, relations, observations

See [tools/knowledge-graph/README.md](tools/knowledge-graph/README.md) for details.

### System Tools

- `init_llm_guidance` - Initialize LLM with creative orientation guidance

## 📝 Schema Format

All schemas are provided in **both JSON and YAML** formats with matching basenames:
- `entity.json` / `entity.yaml`
- `create_structural_tension_chart.json` / `create_structural_tension_chart.yaml`
- etc.

Choose the format that works best for your tooling.

## 🔍 Schema Conventions

### Naming Conventions

**Entity Names:**
- Charts: `chart_{id}` (e.g., `chart_123`)
- Desired Outcome: `chart_{id}_desired_outcome`
- Current Reality: `chart_{id}_current_reality`
- Action Steps: `chart_{id}_action_{n}` (e.g., `chart_123_action_1`)
- Custom entities: Any unique string

**Chart IDs:**
- Format: `chart_{timestamp}` where timestamp is milliseconds since epoch
- Example: `chart_1739401797348`

### Metadata Patterns

**Timestamps:**
- All dates in ISO 8601 format
- `createdAt` / `updatedAt` track changes
- `dueDate` for action steps and charts

**Hierarchy:**
- `level` indicates nesting depth (0 = root)
- `parentChart` references parent chart ID
- `parentActionStep` references parent action entity name
- `chartId` always references the root chart

## 🎨 Creative Orientation Principles

COAIA is built on Robert Fritz's structural tension methodology:

**Structural Tension** = Desired Outcome + Current Reality
- The gap creates productive tension
- System naturally moves toward resolution
- Action steps are strategic choices that change the structure

**Advancing Patterns:**
- Completed actions flow into current reality
- Success builds on success
- Momentum creates natural progression

**Creative vs Problem-Solving:**
- Focus on what you want to create (not problems to fix)
- Honest current reality assessment (not analysis of what's wrong)
- Action steps advance toward outcomes (not away from problems)

See the main README.md for philosophical background.

## 📚 Additional Resources

- **Main Documentation:** `/README.md` - Project overview
- **CLI Guide:** `/CLI_GUIDE.md` - Command-line interface documentation
- **Claude Integration:** `/CLAUDE.md` - MCP server usage with Claude
- **LLM Guidance:** `/llms/*.txt` - Creative orientation guidance for LLMs

## 🏗️ Schema Versioning

Current version: **2.3.0**

The schemas follow semantic versioning. Breaking changes to data structures will increment the major version.

## 💡 Contributing

When adding new tools or data fields:
1. Update the appropriate schema file(s)
2. Regenerate YAML from JSON using `node convert-to-yaml.js <file.json>`
3. Update `index.json` / `index.yaml` registry
4. Update relevant README.md files
5. Add examples to `examples/` if introducing new patterns

## 📄 License

MIT - See LICENSE file in project root

---

**For detailed information on specific schemas, navigate to the subdirectories above.**
