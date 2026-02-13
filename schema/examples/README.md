# COAIA Schema Examples

This directory contains example payloads and resulting data structures for common COAIA operations.

## 📋 Examples Available

**[stc-basic-chart.json](stc-basic-chart.json)**
- Creating a basic structural tension chart
- Shows tool payload and resulting entities/relations
- Demonstrates due date distribution
- Illustrates structural tension creation

**[stc-telescoped-chart.json](stc-telescoped-chart.json)**
- Expanding an action step into a sub-chart
- Shows hierarchical structure
- Demonstrates due date inheritance
- Illustrates multi-level telescoping

**[narrative-beat.json](narrative-beat.json)**
- Creating a narrative beat with multi-universe context
- Shows dramatic structure (three-act)
- Demonstrates prose and lessons capture
- Illustrates universe tagging

**[knowledge-graph.json](knowledge-graph.json)**
- Traditional entity/relation operations
- Custom entity types
- Custom relation types
- Search and retrieval patterns

## 🎯 How to Use These Examples

### As Learning Material
1. Read the example to understand the data structure
2. See the tool payload that creates it
3. Observe the resulting entities and relations
4. Note the metadata patterns

### As Templates
1. Copy the tool payload section
2. Modify for your use case
3. Call the appropriate MCP tool
4. Expect similar entity/relation structure

### As Test Data
1. Use examples for integration testing
2. Verify tool implementations
3. Validate schema compliance
4. Test client applications

## 📊 Example Structure

Each example file contains:

```json
{
  "description": "What this example demonstrates",
  "tool_name_payload": {
    // The parameters you'd send to the MCP tool
  },
  "resulting_entities": [
    // Entities created in the knowledge graph
  ],
  "resulting_relations": [
    // Relations created between entities
  ],
  "notes": [
    // Important observations about this pattern
  ]
}
```

## 🚀 Quick Examples

### Creating a Chart

**Tool:** `create_structural_tension_chart`

**Payload:**
```json
{
  "desiredOutcome": "Build and deploy a Python web application",
  "currentReality": "Know basic Python syntax",
  "dueDate": "2026-03-15T00:00:00Z",
  "actionSteps": [
    "Complete Django tutorial",
    "Build practice app",
    "Deploy to production"
  ]
}
```

**Result:** 6 entities + 6 relations creating structural tension

### Telescoping an Action

**Tool:** `manage_action_step`

**Payload:**
```json
{
  "parentReference": "chart_123_action_1",
  "actionDescription": "Complete Django tutorial",
  "initialActionSteps": [
    "Models chapter",
    "Views and templates",
    "Admin interface"
  ]
}
```

**Result:** New sub-chart with inherited due date and parent linkage

### Completing an Action

**Tool:** `mark_action_complete`

**Payload:**
```json
{
  "actionStepName": "chart_123_action_1"
}
```

**Result:** Observations flow to current_reality, progress increases

### Creating a Narrative Beat

**Tool:** `create_narrative_beat`

**Payload:**
```json
{
  "beatDescription": "The moment of realization",
  "act": 2,
  "type_dramatic": "midpoint",
  "universes": ["main_timeline", "alternate_universe"],
  "prose": "Everything changed in that instant...",
  "lessons": ["Truth emerges when resistance stops"]
}
```

**Result:** narrative_beat entity with rich metadata

## 🔗 Related Documentation

- **[../tools/README.md](../tools/README.md)** - Tool schemas and usage
- **[../data-model/README.md](../data-model/README.md)** - Entity and Relation specs
- **[../README.md](../README.md)** - Schema overview

---

For complete example details, see the individual JSON files in this directory.
