# COAIA Data Model Schemas

This directory contains the core data model schemas that define how COAIA stores and represents knowledge, structural tension charts, and narrative information.

## 📋 Files in This Directory

### Core Schemas

**[entity.json](entity.json)** / **[entity.yaml](entity.yaml)**
- Complete Entity structure specification
- All entity types (structural_tension_chart, desired_outcome, action_step, narrative_beat, etc.)
- Full metadata specification with all optional fields
- Examples and documentation

**[relation.json](relation.json)** / **[relation.yaml](relation.yaml)**
- Complete Relation structure specification
- All relation types (creates_tension_with, advances_toward, telescopes_into, etc.)
- Metadata for relation context and strength
- Examples showing structural tension connections

**[knowledge-graph.json](knowledge-graph.json)** / **[knowledge-graph.yaml](knowledge-graph.yaml)**
- Container structure for in-memory graph representation
- Combines entities array + relations array
- Example showing a complete structural tension chart

**[storage-format.json](storage-format.json)** / **[storage-format.yaml](storage-format.yaml)**
- JSONL (JSON Lines) persistence format
- Type discriminator pattern (entity vs relation)
- Line-by-line storage specification
- Examples showing actual file format

### Legacy

**[legacy-jsonl-data.schema.json](legacy-jsonl-data.schema.json)**
- Original JSONL schema (kept for backward compatibility)
- Use `storage-format.json` for new implementations

## 🏗️ Data Model Architecture

### Entity Structure

Entities are the **nodes** in the knowledge graph. Each entity represents a distinct concept, component, or piece of information.

```json
{
  "name": "chart_123_desired_outcome",
  "entityType": "desired_outcome",
  "observations": [
    "Build and deploy a Python web application"
  ],
  "metadata": {
    "chartId": "chart_123",
    "createdAt": "2026-02-13T07:00:00Z"
  }
}
```

**Key Fields:**
- `name` - Unique identifier (follows naming conventions for STC components)
- `entityType` - Type classification determining entity's role
- `observations` - Array of facts/statements (cumulative for current_reality)
- `metadata` - Rich contextual information (optional but powerful)

### Entity Types

| Type | Purpose | Usage |
|------|---------|-------|
| `structural_tension_chart` | Root container for a chart | Created by `create_structural_tension_chart` |
| `desired_outcome` | What you want to create | Single clear statement of result |
| `current_reality` | Where you are now | Accumulates observations as actions complete |
| `action_step` | Strategic intermediary action | Has dueDate and completionStatus |
| `narrative_beat` | Story moment across universes | Multi-timeline narrative capture |
| `person` | Individual or character | Traditional knowledge graph |
| `concept` | Abstract idea or principle | Traditional knowledge graph |
| `event` | Occurrence or happening | Traditional knowledge graph |
| `location` | Place or setting | Traditional knowledge graph |
| `organization` | Group or institution | Traditional knowledge graph |
| `artifact` | Physical or digital object | Traditional knowledge graph |
| `custom` | User-defined type | Extensibility |

### Relation Structure

Relations are the **edges** connecting entities. They define typed, directional relationships.

```json
{
  "from": "chart_123_current_reality",
  "to": "chart_123_desired_outcome",
  "relationType": "creates_tension_with",
  "metadata": {
    "description": "The gap creates productive structural tension",
    "createdAt": "2026-02-13T07:00:00Z"
  }
}
```

**Key Fields:**
- `from` - Source entity name
- `to` - Target entity name
- `relationType` - Type of connection
- `metadata` - Optional context, strength, description

### Relation Types

#### Structural Tension Relations (Core)

| Type | Purpose | Example |
|------|---------|---------|
| `creates_tension_with` | Reality → Outcome tension | current_reality → desired_outcome |
| `advances_toward` | Action → Outcome progression | action_step → desired_outcome |
| `telescopes_into` | Action → Sub-chart expansion | action_step → sub_chart |
| `flows_into` | Completed action → Reality | completed_action → current_reality |

#### Graph Relations (Traditional)

| Type | Purpose |
|------|---------|
| `part_of` | Component membership |
| `related_to` | General association |
| `depends_on` | Dependency relationship |
| `influences` | Causal influence |
| `precedes` / `follows` | Temporal ordering |
| `contains` | Containment |
| `member_of` | Group membership |
| `owns` | Ownership |
| `created_by` | Creation attribution |
| `mentions` / `references` | Citation |
| `custom` | User-defined |

### Metadata Specification

#### Common Metadata Fields

**Temporal:**
- `createdAt` - ISO 8601 timestamp of creation
- `updatedAt` - ISO 8601 timestamp of last modification
- `dueDate` - ISO 8601 timestamp for completion target

**Structural Tension:**
- `chartId` - Reference to parent chart (e.g., "chart_123")
- `phase` - Creative phase: "germination", "assimilation", "completion"
- `completionStatus` - Boolean for action_step completion
- `level` - Integer hierarchy depth (0 = root, 1+ = telescoped)
- `parentChart` - Chart ID of parent (for telescoped charts)
- `parentActionStep` - Entity name of parent action (for telescoped charts)

**Narrative:**
- `act` - Act number (1, 2, or 3) for three-act structure
- `type_dramatic` - Dramatic beat type (e.g., "inciting_incident", "climax")
- `universes` - Array of universe/timeline identifiers
- `timestamp` - In-universe date/time reference
- `narrative.description` - Brief narrative description
- `narrative.prose` - Full prose text
- `narrative.lessons` - Array of lessons learned

**Assessment:**
- `relationalAlignment.assessed` - Whether assessed
- `relationalAlignment.score` - Alignment score (0-100)
- `relationalAlignment.principles` - Array of aligned principles
- `fourDirections.north_vision` - Vision/clarity
- `fourDirections.east_intention` - New beginnings
- `fourDirections.south_emotion` - Heart wisdom
- `fourDirections.west_introspection` - Reflection

## 💾 Storage Format (JSONL)

Data is persisted in **JSON Lines** format where each line is a complete JSON object.

**Key Characteristics:**
- One record per line (entity OR relation)
- Each line is valid JSON independently
- `type` field discriminates between entity and relation
- Append-only friendly (add new lines without parsing entire file)
- Human-readable and version-control friendly

**Example memory.jsonl:**
```jsonl
{"type":"entity","name":"chart_123","entityType":"structural_tension_chart","observations":["Python learning"],"metadata":{"chartId":"chart_123","level":0}}
{"type":"entity","name":"chart_123_desired_outcome","entityType":"desired_outcome","observations":["Deploy Python web app"],"metadata":{"chartId":"chart_123"}}
{"type":"entity","name":"chart_123_current_reality","entityType":"current_reality","observations":["Know Python basics"],"metadata":{"chartId":"chart_123"}}
{"type":"relation","from":"chart_123_current_reality","to":"chart_123_desired_outcome","relationType":"creates_tension_with"}
```

**Loading Process:**
1. Read file line by line
2. Parse each line as JSON
3. Check `type` field
4. Add to `entities` array if type="entity"
5. Add to `relations` array if type="relation"
6. Result: KnowledgeGraph with populated arrays

See `storage-format.json` for complete schema.

## 🎯 Naming Conventions

### Chart Component Names

**Pattern:** `chart_{chartId}_{component}`

**Examples:**
- `chart_123` - The chart itself
- `chart_123_desired_outcome` - The desired outcome entity
- `chart_123_current_reality` - The current reality entity
- `chart_123_action_1` - First action step
- `chart_123_action_2` - Second action step

**Chart ID Format:** `chart_{timestamp}`
- Timestamp is milliseconds since epoch
- Example: `chart_1739401797348`
- Ensures global uniqueness

### Telescoped Chart Names

When an action step is telescoped into a sub-chart:

**Parent:** `chart_123_action_1`
**Sub-chart:** `chart_456` (new unique ID)
**Relation:** `chart_123_action_1` --[telescopes_into]--> `chart_456`

The sub-chart maintains metadata:
- `parentChart: "chart_123"`
- `parentActionStep: "chart_123_action_1"`
- `level: 1` (parent was 0)

## 🔄 Data Flow Patterns

### Creating a Structural Tension Chart

1. Generate unique chart ID: `chart_{Date.now()}`
2. Create entities:
   - Chart container (`structural_tension_chart`)
   - Desired outcome (`desired_outcome`)
   - Current reality (`current_reality`)
   - Action steps (`action_step` × N)
3. Create relations:
   - Chart --[contains]--> Outcome
   - Chart --[contains]--> Reality
   - Reality --[creates_tension_with]--> Outcome
   - Each Action --[advances_toward]--> Outcome
4. Write to JSONL (append entities, then relations)

### Completing an Action

1. Find action_step entity by name
2. Set `metadata.completionStatus = true`
3. Get action observations
4. Find current_reality entity
5. Append action observations to reality's observations array
6. Update `metadata.updatedAt`
7. Create relation: Action --[flows_into]--> Reality
8. Write updates to JSONL

### Telescoping an Action

1. Find parent action_step entity
2. Generate new chart ID for sub-chart
3. Create new chart with:
   - `level = parentLevel + 1`
   - `parentChart = parentChartId`
   - `parentActionStep = actionStepName`
   - `dueDate ≤ parent action dueDate`
4. Create relation: Parent Action --[telescopes_into]--> Sub-chart
5. Write to JSONL

## 📊 Example: Complete Chart Structure

```json
{
  "entities": [
    {
      "name": "chart_123",
      "entityType": "structural_tension_chart",
      "observations": ["Python web development learning journey"],
      "metadata": {
        "chartId": "chart_123",
        "dueDate": "2026-03-15T00:00:00Z",
        "level": 0,
        "phase": "germination",
        "createdAt": "2026-02-13T07:00:00Z"
      }
    },
    {
      "name": "chart_123_desired_outcome",
      "entityType": "desired_outcome",
      "observations": ["Build and deploy a Python web application"],
      "metadata": {"chartId": "chart_123"}
    },
    {
      "name": "chart_123_current_reality",
      "entityType": "current_reality",
      "observations": [
        "Know basic Python syntax",
        "Never worked with web frameworks"
      ],
      "metadata": {"chartId": "chart_123"}
    },
    {
      "name": "chart_123_action_1",
      "entityType": "action_step",
      "observations": ["Complete Django tutorial"],
      "metadata": {
        "chartId": "chart_123",
        "dueDate": "2026-02-20T00:00:00Z",
        "completionStatus": false
      }
    },
    {
      "name": "chart_123_action_2",
      "entityType": "action_step",
      "observations": ["Build practice CRUD app"],
      "metadata": {
        "chartId": "chart_123",
        "dueDate": "2026-02-27T00:00:00Z",
        "completionStatus": false
      }
    }
  ],
  "relations": [
    {
      "from": "chart_123",
      "to": "chart_123_desired_outcome",
      "relationType": "contains"
    },
    {
      "from": "chart_123",
      "to": "chart_123_current_reality",
      "relationType": "contains"
    },
    {
      "from": "chart_123_current_reality",
      "to": "chart_123_desired_outcome",
      "relationType": "creates_tension_with",
      "metadata": {
        "description": "The gap between current skills and desired outcome creates productive tension"
      }
    },
    {
      "from": "chart_123_action_1",
      "to": "chart_123_desired_outcome",
      "relationType": "advances_toward"
    },
    {
      "from": "chart_123_action_2",
      "to": "chart_123_desired_outcome",
      "relationType": "advances_toward"
    }
  ]
}
```

## 🔗 Related Documentation

- **[../README.md](../README.md)** - Schema folder overview
- **[../tools/stc/README.md](../tools/stc/README.md)** - Tools that create/modify these structures
- **[../examples/](../examples/)** - Real-world usage examples
- **[../data-model-complete.json](../data-model-complete.json)** - All schemas in one file

---

For schema implementation details, see the individual `.json` and `.yaml` files in this directory.
