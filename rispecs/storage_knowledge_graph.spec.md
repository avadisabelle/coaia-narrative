# Knowledge Graph Storage & Persistence Component
## RISE Specification for Memory Management Backend

**Component Purpose**: Persist user memory, creative aspirations, and relationships using a structured graph format that supports creative-oriented memory management while maintaining data integrity across sessions.

---

## 🎯 What This Component Enables Users to Create

- **Persistent Creative Memory**: Charts and relationships survive across sessions
- **Relationship Networks**: Track how different creative elements interconnect
- **Observation History**: Maintain progression records showing advancement over time
- **Query Capabilities**: Search and retrieve specific memory elements
- **Data Integrity**: Append-only format ensures transactions never corrupt

---

## 📋 Natural Language Describing Functional Aspects

### Persistent Memory Use Case
```
Session 1 - User Creates Vision:
"I want to learn machine learning by end of Q2. I know Python but no ML experience."

System Persists:
- Structural tension chart with IDs
- Desired outcome entity
- Current reality entity  
- Relations connecting them
- All stored durably to disk

Session 2 - User Reviews Progress:
"Show me my ML learning goals"

System Retrieves:
- Previously created chart from disk
- All entities and relations loaded
- User sees: "Started with Python basics, 2 weeks into learning TensorFlow"
- Momentum preserved across sessions
```

### Relationship Tracking
```
Entities Created:
1. "chart_123_chart" (master chart)
2. "chart_123_desired_outcome" (ML proficiency goal)
3. "chart_123_current_reality" (Python knowledge)
4. "chart_123_action_1" (Learn TensorFlow)
5. "dataset_project" (related knowledge)

Relations Created:
- chart_123_chart → CONTAINS → chart_123_desired_outcome
- chart_123_current_reality → CREATES_TENSION_WITH → chart_123_desired_outcome
- chart_123_action_1 → ADVANCES_TOWARD → chart_123_desired_outcome
- chart_123_action_1 → DEPENDS_ON → dataset_project

User can understand full network of how actions advance toward goals
```

---

## 🔧 Implementation Requirements

### File Format: JSONL (JSON Lines)
```
Format: One JSON object per line, no commas between lines

Advantages:
- Append-only safe (no rewriting entire file)
- Line integrity (corrupt line doesn't affect others)
- Easy streaming (process line by line)
- Human readable (can view with cat/grep)
- Transaction safe (writes complete before moving on)

Example File Content:
{"type":"entity","name":"chart_123_chart","entityType":"structural_tension_chart",...}
{"type":"entity","name":"chart_123_desired_outcome","entityType":"desired_outcome",...}
{"type":"relation","from":"chart_123_chart","to":"chart_123_desired_outcome","relationType":"contains"}
{"type":"entity","name":"chart_123_current_reality","entityType":"current_reality",...}
...
```

### Data Structure Definitions
```typescript
interface Entity {
  name: string                    // Unique identifier
  entityType: string              // Type of entity
  observations: string[]          // Observations about this entity
  metadata?: {
    dueDate?: string             // ISO8601 due date
    chartId?: string             // Which chart owns this
    phase?: 'germination' | 'assimilation' | 'completion'
    completionStatus?: boolean   // Completed? 
    parentChart?: string         // Parent if telescoped
    parentActionStep?: string    // Which action was telescoped
    level?: number               // Hierarchical level
    createdAt?: string          // Creation timestamp
    updatedAt?: string          // Last update timestamp
  }
}

interface Relation {
  from: string                    // Source entity name
  to: string                      // Target entity name
  relationType: string            // Type of relationship
  metadata?: {
    createdAt?: string
    strength?: number             // Importance/priority
  }
}
```

### File Operations

**Load Graph**:
```typescript
LOAD_GRAPH():
  
  TRY:
    data = READ_FILE(MEMORY_FILE_PATH)
    lines = data.SPLIT("\n").FILTER(line → line.TRIM() != "")
    
    entities = []
    relations = []
    
    FOR EACH line IN lines:
      item = PARSE_JSON(line)
      
      IF item.type === "entity":
        entities.PUSH(item)
      ELSE IF item.type === "relation":
        relations.PUSH(item)
    
    RETURN { entities, relations }
    
  CATCH FileNotFoundError:
    RETURN { entities: [], relations: [] }  // First run
```

**Save Graph**:
```typescript
SAVE_GRAPH(graph):
  
  lines = []
  
  FOR EACH entity IN graph.entities:
    jsonLine = JSON.STRINGIFY({ type: "entity", ...entity })
    lines.PUSH(jsonLine)
  
  FOR EACH relation IN graph.relations:
    jsonLine = JSON.STRINGIFY({ type: "relation", ...relation })
    lines.PUSH(jsonLine)
  
  content = lines.JOIN("\n")
  WRITE_FILE(MEMORY_FILE_PATH, content)  // Atomic write
  
  RETURN success
```

### Query Operations

**Search Entities**:
```typescript
SEARCH_NODES(query):
  
  graph = LOAD_GRAPH()
  
  // Match on entity name, type, or observations
  matching = FILTER(graph.entities, entity →
    entity.name.INCLUDES_CASE_INSENSITIVE(query) OR
    entity.entityType.INCLUDES_CASE_INSENSITIVE(query) OR
    entity.observations.ANY(obs → obs.INCLUDES_CASE_INSENSITIVE(query))
  )
  
  // Get related entities
  relatedNames = SET()
  FOR EACH entity IN matching:
    relatedNames.ADD(entity.name)
  
  // Filter relations to only include matching entities
  filteredRelations = FILTER(graph.relations, rel →
    relatedNames.HAS(rel.from) AND relatedNames.HAS(rel.to)
  )
  
  RETURN { entities: matching, relations: filteredRelations }
```

**Get Specific Nodes**:
```typescript
OPEN_NODES(names):
  
  graph = LOAD_GRAPH()
  nameSet = NEW_SET(names)
  
  // Get exact entities
  matching = FILTER(graph.entities, entity →
    nameSet.HAS(entity.name)
  )
  
  // Get relations between these entities
  filteredRelations = FILTER(graph.relations, rel →
    nameSet.HAS(rel.from) AND nameSet.HAS(rel.to)
  )
  
  RETURN { entities: matching, relations: filteredRelations }
```

---

## 📊 Entity Type System

### Core Entity Types for Structural Tension Charts

**structural_tension_chart**: Master container
- Observations: Chart creation timestamp
- Metadata: chartId (level 0), dueDate, phases

**desired_outcome**: What user wants to create
- Observations: [0] = outcome description, [1+] = related observations
- Metadata: chartId (which chart), dueDate

**current_reality**: Factual current state
- Observations: [0] = initial assessment, [1+] = updates from completions
- Metadata: chartId, timestamps

**action_step**: Strategic intermediary results
- Observations: [0] = action title, [1+] = progress observations
- Metadata: chartId, dueDate, completionStatus, level (if telescoped)

### Traditional Knowledge Graph Entity Types
- **person**: Individual entities
- **concept**: Ideas and principles
- **event**: Dated occurrences
- **project**: Discrete projects
- **custom**: User-defined types

---

## 🔗 Relation Type System

### Core Relation Types

**Structural Tension Relations**:
- `creates_tension_with`: Links current reality to desired outcome
- `advances_toward`: Actions moving toward desired outcomes
- `contains`: Charts containing entities
- `telescopes_into`: Hierarchical breakdown relationship
- `flows_into`: Completion flowing into parent reality

**Traditional Relations**:
- `depends_on`: Dependency relationships
- `related_to`: General associations
- `supports`: Foundation/support relationships
- Custom relation types supported

---

## 🎯 Data Integrity & Recovery

### Append-Only Safety
```
Write Operation:
1. New entity/relation prepared in memory
2. Complete JSON line created
3. Atomic append to file
4. Operation succeeds or fails completely
5. No partial writes possible

Corruption Resistance:
- Single corrupted line doesn't affect graph
- Can filter out unparseable lines
- Valid lines remain readable
- Recovery by removing corrupt line
```

### Backup Strategy
```
Automatic Backup Points:
- Every 100 save operations: copy to memory-backup-{timestamp}.jsonl
- User can revert to known state
- No manual intervention needed
```

### Crash Recovery
```
Scenario: Process crashes mid-write
Result: File ends with partial line
Recovery: 
  TRY:
    Load file normally
  CATCH on last line:
    Remove last incomplete line
    Load remaining valid lines
  RETURN recovered graph
```

---

## 📈 Performance Characteristics

### Scalability
- **Small Projects**: <1000 entities/relations (instant)
- **Medium Projects**: 1000-10000 (milliseconds)
- **Large Projects**: 10000+ (seconds, but acceptable for background use)

### Optimization Techniques
```typescript
// Cache loaded graph in memory
cachedGraph = null

GET_GRAPH():
  IF cachedGraph IS NOT null:
    RETURN cachedGraph
  
  graph = LOAD_FROM_DISK()
  cachedGraph = graph
  RETURN graph

// Invalidate cache after writes
SAVE_GRAPH(graph):
  WRITE_TO_DISK(graph)
  cachedGraph = null  // Refresh on next read
```

---

## 🔧 Configuration

### Memory File Path
```bash
# Default location (installation directory)
coaia-memory

# Custom location via CLI
coaia-memory --memory-path /path/to/my-charts.jsonl

# Relative paths converted to absolute
--memory-path ./my-memory.jsonl
  → /current/working/directory/my-memory.jsonl
```

### File Size Management
```
Typical Scenarios:
- Small user: 100 KB (simple charts)
- Active user: 1-5 MB (multiple projects)
- Power user: 10-50 MB (complex hierarchies)

Monitoring:
- System warns if approaching 1 GB
- Recommends archiving old completed charts
```

---

## 📊 Output Format

### Graph Dump Response
```json
{
  "entities": [
    {
      "name": "chart_123_chart",
      "entityType": "structural_tension_chart",
      "observations": ["Chart created 2025-01-01"],
      "metadata": {
        "chartId": "chart_123",
        "level": 0,
        "dueDate": "2025-12-31T00:00:00Z"
      }
    }
  ],
  "relations": [
    {
      "from": "chart_123_current_reality",
      "to": "chart_123_desired_outcome",
      "relationType": "creates_tension_with"
    }
  ]
}
```

---

## ✅ Quality Criteria

### Data Persistence
- ✅ All data survives across sessions
- ✅ File format human-readable
- ✅ Corruption resistance built-in
- ✅ Append-only safety enforced

### Query Capability
- ✅ Can search by entity name/type/observations
- ✅ Can get specific named entities
- ✅ Relations filter correctly
- ✅ Hierarchies navigable

### Performance
- ✅ Load times acceptable for interactive use
- ✅ Saves complete before returning
- ✅ Memory usage reasonable
- ✅ Scaling maintains performance

---

## 🔗 Related Components

- **Structural Tension Chart Creation**: Creates entities stored here
- **Telescoping**: Maintains hierarchical relationships
- **Advancing Pattern Tracking**: Updates observations in entities
- **MCP Tool Interface**: read_graph, search_nodes, open_nodes tools

---

**This specification enables rebuilding persistent, queryable knowledge graph storage that supports creative-oriented memory management.**
