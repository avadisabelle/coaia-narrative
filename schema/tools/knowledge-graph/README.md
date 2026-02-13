# Knowledge Graph Tools

This directory contains the foundational knowledge graph tools that form the base layer of the COAIA Narrative system.

## 🌟 Foundation & Origins

**These tools are the original foundation that enabled the entire COAIA system.**

This is a fork of the excellent **[mcp-knowledge-graph](https://github.com/shaneholloman/mcp-knowledge-graph)** project by Shane Holloman. The original knowledge graph implementation provided the robust entity-relation storage and querying infrastructure that made it possible to build the structural tension chart system on top.

**Credit:** Shane Holloman's mcp-knowledge-graph gave us:
- JSONL-based entity and relation storage
- MCP server architecture
- Core CRUD operations for entities and relations
- Search and retrieval capabilities

**Evolution:** We extended this foundation to support:
- Structural tension charts (entities become chart components)
- Telescoping hierarchies (relations enable nested charts)
- Advancing patterns (observations accumulate in current reality)
- Creative orientation (metadata tracks creative phases)
- Narrative beats (multi-universe storytelling)

The knowledge graph tools remain fully functional and are essential for any custom entity/relation work beyond the specialized STC and Narrative abstractions.

## 📋 Tools in This Directory

### Entity Management

**[create_entities.json](create_entities.json)** / **[.yaml](create_entities.yaml)**
- Create one or more entities with type and observations
- Supports custom entity types beyond STC components
- **Use for:** Custom knowledge capture, people, concepts, events

**[delete_entities.json](delete_entities.json)** / **[.yaml](delete_entities.yaml)**
- Delete entities by name (cascades to relations)
- **Use with caution:** Structural chart components should use STC tools instead

### Relation Management

**[create_relations.json](create_relations.json)** / **[.yaml](create_relations.yaml)**
- Create typed connections between entities
- Supports custom relation types
- **Use for:** Custom relationships beyond STC semantics

**[delete_relations.json](delete_relations.json)** / **[.yaml](delete_relations.yaml)**
- Remove specific relations by from/to/type
- **Use with caution:** Chart relations are structural - prefer STC tools

### Observation Management

**[add_observations.json](add_observations.json)** / **[.yaml](add_observations.yaml)**
- Append observations to existing entities
- **Note:** For current_reality, use `update_current_reality` instead
- **Use for:** Adding facts to custom entities

**[delete_observations.json](delete_observations.json)** / **[.yaml](delete_observations.yaml)**
- Remove specific observations from entities
- **Use with caution:** Chart observations are semantically important

### Query & Retrieval

**[search_nodes.json](search_nodes.json)** / **[.yaml](search_nodes.yaml)**
- Full-text search across entity names and observations
- Returns matching entities and their relations
- **Use for:** Discovery, finding related information

**[open_nodes.json](open_nodes.json)** / **[.yaml](open_nodes.yaml)**
- Retrieve specific entities by exact name
- Returns entity details and connected relations
- **Use for:** Inspecting specific components

**[read_graph.json](read_graph.json)** / **[.yaml](read_graph.yaml)**
- Export the entire knowledge graph
- Returns all entities and relations
- **Use for:** Complete data dump, backups, analysis
- **Warning:** Can be very large for big graphs

## 🎯 When to Use These Tools

### Use Knowledge Graph Tools When:

✅ **Creating custom entities** beyond STC components
- People, organizations, locations
- Concepts, ideas, principles
- Events, artifacts, custom types

✅ **Defining custom relations** with specific semantics
- Domain-specific relationship types
- Custom metadata on relations

✅ **Searching across all data**
- Finding entities by keyword
- Discovering connections

✅ **Advanced graph operations**
- Manual cleanup
- Custom data modeling
- Direct graph manipulation

### Use STC Tools Instead When:

❌ **Working with charts** - Use `tools/stc/` instead
- Creating/modifying charts
- Managing action steps
- Tracking progress
- Telescoping

❌ **Updating current reality** - Use `update_current_reality`
- Appending observations to current_reality
- Completing actions (which updates reality)

❌ **Managing outcomes** - Use `update_desired_outcome`
- Changing desired outcomes

## 🏗️ Tool Group: KG_TOOLS

These tools are grouped as `KG_TOOLS` in the COAIA_TOOLS environment variable:

```bash
# Enable only knowledge graph tools
COAIA_TOOLS="KG_TOOLS" npx coaia-memory

# Enable both STC and KG tools
COAIA_TOOLS="STC_TOOLS,KG_TOOLS" npx coaia-memory
```

**KG_TOOLS includes:**
1. create_entities
2. create_relations
3. add_observations
4. delete_entities
5. delete_observations
6. delete_relations
7. search_nodes
8. open_nodes
9. read_graph

## 📊 Data Model Reference

Knowledge graph tools work with the core Entity and Relation structures:

**Entity:**
```json
{
  "name": "unique_identifier",
  "entityType": "person|concept|event|...",
  "observations": ["fact 1", "fact 2"],
  "metadata": { /* optional */ }
}
```

**Relation:**
```json
{
  "from": "entity_name_1",
  "to": "entity_name_2",
  "relationType": "related_to|...",
  "metadata": { /* optional */ }
}
```

See **[../../data-model/README.md](../../data-model/README.md)** for complete specifications.

## 🔍 Common Patterns

### Creating Custom Knowledge

```javascript
// Create entities
{
  "entities": [
    {
      "name": "robert_fritz",
      "entityType": "person",
      "observations": [
        "Author of 'The Path of Least Resistance'",
        "Developer of structural tension methodology"
      ]
    },
    {
      "name": "structural_tension_methodology",
      "entityType": "concept",
      "observations": [
        "Creative process framework",
        "Based on structural dynamics"
      ]
    }
  ]
}

// Connect with relation
{
  "relations": [
    {
      "from": "robert_fritz",
      "to": "structural_tension_methodology",
      "relationType": "created_by"
    }
  ]
}
```

### Searching for Information

```javascript
// Search by keyword
{
  "query": "structural tension"
}

// Returns matching entities and their relations
```

### Retrieving Specific Entities

```javascript
// Get exact entity
{
  "names": ["robert_fritz", "structural_tension_methodology"]
}

// Returns entity details and connected relations
```

## ⚠️ Important Notes

### Deletion Considerations

**Deleting entities cascades to relations:**
- If you delete an entity, all relations involving it are also deleted
- This can break structural tension chart integrity
- **Recommendation:** Use `remove_action_step` for chart components

**Deleting observations:**
- Observations are identified by exact text match
- For current_reality, observations accumulate as actions complete
- Deleting may disrupt the creative advancement pattern

### Search Behavior

**search_nodes:**
- Case-insensitive substring matching
- Searches both entity names and observations
- Returns complete entities and their relations
- Can return large result sets

**open_nodes:**
- Exact name matching only
- More efficient for known entities
- Returns entity + immediate relations

### Performance Considerations

**read_graph:**
- Loads entire graph into memory
- Can be slow/large for graphs with thousands of entities
- Consider using search_nodes or open_nodes for targeted queries

## 🔗 Related Documentation

- **[../stc/README.md](../stc/README.md)** - Structural Tension Chart tools
- **[../narrative/README.md](../narrative/README.md)** - Narrative Beat tools
- **[../../data-model/README.md](../../data-model/README.md)** - Entity and Relation schemas
- **[../../README.md](../../README.md)** - Schema overview

## 📚 External Resources

- **Original Project:** [mcp-knowledge-graph by Shane Holloman](https://github.com/shaneholloman/mcp-knowledge-graph)
- **MCP Protocol:** [Model Context Protocol](https://modelcontextprotocol.io)
- **Structural Tension:** [Robert Fritz - The Path of Least Resistance](https://robertfritz.com)

---

**Remember:** These are the foundational tools. For working with structural tension charts, prefer the higher-level STC tools that provide chart-aware semantics and integrity.
