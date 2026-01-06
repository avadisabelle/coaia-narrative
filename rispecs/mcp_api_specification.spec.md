# MCP API Specification Component
## RISE Specification for MCP Tool Implementation

**Component Purpose**: Provide developers with complete API contracts, data schemas, and implementation requirements necessary to regenerate all MCP tools from creative specifications, maintaining structural dynamics and validation constraints.

---

## 🎯 What This Component Enables Developers to Create

- **Complete Tool Implementation**: Regenerate all MCP tools from scratch using this specification
- **Type-Safe Integration**: Implement tools with proper input validation and error handling
- **Consistent Data Structures**: Align storage, processing, and response formats
- **Cross-Platform Compatibility**: Work across Claude Code, Gemini, and other LLM clients
- **Validated Advancement**: Ensure creative orientation is maintained through validation

---

## 📋 MCP Tool Definitions & Schemas

### Tool Registry Structure

All MCP tools follow this definition pattern:

```typescript
{
  name: string                    // Unique tool identifier
  description: string             // Creative-oriented description
  inputSchema: {
    type: "object"
    properties: { ... }          // Parameter definitions
    required: [...]              // Required fields
  }
}
```

---

## 🔧 Complete Tool Specifications

### Structural Tension Chart Tools

#### 1. create_structural_tension_chart

**Purpose**: Create foundational creative structure with desired outcome, current reality, and paced action steps.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "desiredOutcome": {
      "type": "string",
      "minLength": 1,
      "maxLength": 500,
      "description": "Specific result to create (creative language, not problem-solving)"
    },
    "currentReality": {
      "type": "string",
      "minLength": 1,
      "maxLength": 500,
      "description": "Honest factual assessment of present state"
    },
    "dueDate": {
      "type": "string",
      "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}",
      "description": "ISO 8601 date for chart completion"
    },
    "actionSteps": {
      "type": "array",
      "items": { "type": "string" },
      "description": "List of strategic intermediate results (optional)"
    }
  },
  "required": ["desiredOutcome", "currentReality", "dueDate"]
}
```

**Response**:
```json
{
  "chartId": "chart_1765629421446",
  "desiredOutcome": "Create engaging storytelling podcast",
  "currentReality": "Have microphone, no experience",
  "dueDate": "2025-06-30T00:00:00Z",
  "createdAt": "2025-12-13T20:00:00Z",
  "actionSteps": ["Learn recording/editing", "Create 5 episodes", "Build audience"],
  "progress": 0,
  "totalActions": 3,
  "completedActions": 0
}
```

**Validation Rules**:
- Desired outcome must use creative language ("create", "build", "manifest")
- Current reality must be factual, not aspirational ("have X" not "ready for X")
- Due date must be valid ISO 8601 format
- Action steps must be named results, not processes
- Return error if creative orientation not detected

---

#### 2. list_active_charts

**Purpose**: Overview of all active structural tension charts with hierarchy and progress.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {}
}
```

**Response**:
```json
[
  {
    "chartId": "chart_1765629421446",
    "desiredOutcome": "Create engaging podcast",
    "currentReality": "Have microphone, no experience",
    "dueDate": "2025-06-30T00:00:00Z",
    "progress": 0.33,
    "completedActions": 1,
    "totalActions": 3,
    "level": 0,
    "parentChart": null,
    "actionSteps": [...]
  }
]
```

---

#### 3. add_action_step

**Purpose**: Add strategic intermediate result to existing chart.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "parentChartId": {
      "type": "string",
      "description": "ID of parent structural tension chart"
    },
    "actionStepTitle": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "description": "Name of strategic intermediate result"
    },
    "currentReality": {
      "type": "string",
      "minLength": 1,
      "maxLength": 500,
      "description": "Current reality for this action step context"
    },
    "dueDate": {
      "type": "string",
      "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}",
      "description": "Due date for this action (optional)"
    }
  },
  "required": ["parentChartId", "actionStepTitle", "currentReality"]
}
```

**Response**:
```json
{
  "chartId": "chart_1765629421446_action_1",
  "parentChart": "chart_1765629421446",
  "actionStepTitle": "Learn recording/editing",
  "currentReality": "Have microphone, no DAW experience",
  "desiredOutcome": "Proficient with recording workflow",
  "createdAt": "2025-12-13T20:00:00Z"
}
```

---

#### 4. telescope_action_step

**Purpose**: Break down action step into detailed sub-chart.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "actionStepName": {
      "type": "string",
      "description": "Name/ID of action step to telescope"
    },
    "newCurrentReality": {
      "type": "string",
      "minLength": 1,
      "description": "Updated current reality for sub-chart"
    },
    "initialActionSteps": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Sub-steps within this action"
    }
  },
  "required": ["actionStepName", "newCurrentReality"]
}
```

**Response**:
```json
{
  "chartId": "chart_1765629421446_action_1_sub",
  "parentAction": "Learn recording/editing",
  "currentReality": "No DAW experience",
  "actionSteps": ["Choose DAW", "Complete tutorials", "Record test podcast"]
}
```

---

#### 5. mark_action_complete

**Purpose**: Complete action step and update current reality.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "actionStepName": {
      "type": "string",
      "description": "Action step ID to mark complete"
    }
  },
  "required": ["actionStepName"]
}
```

**Response**:
```json
{
  "actionStepName": "Learn recording/editing",
  "status": "completed",
  "completedAt": "2025-12-13T20:00:00Z",
  "parentChartId": "chart_1765629421446",
  "updatedCurrentReality": "Proficient with recording workflow"
}
```

---

#### 6. update_action_progress

**Purpose**: Track progress without marking action complete.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "actionStepName": {
      "type": "string",
      "description": "Action step being tracked"
    },
    "progressObservation": {
      "type": "string",
      "minLength": 1,
      "description": "Progress observation without completion"
    },
    "updateCurrentReality": {
      "type": "boolean",
      "description": "Whether to add to current reality (optional)"
    }
  },
  "required": ["actionStepName", "progressObservation"]
}
```

**Response**:
```json
{
  "actionStepName": "Learn recording/editing",
  "progressObservation": "Completed Audacity tutorials, working on mixing",
  "currentRealityUpdated": true,
  "timestamp": "2025-12-13T20:00:00Z"
}
```

---

#### 7. update_current_reality

**Purpose**: Add observations directly to current reality.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "chartId": {
      "type": "string",
      "description": "Chart to update"
    },
    "newObservations": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 1,
      "description": "Observations about current reality"
    }
  },
  "required": ["chartId", "newObservations"]
}
```

---

#### 8. update_desired_outcome

**Purpose**: Modify desired outcome of chart.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "chartId": {
      "type": "string"
    },
    "newDesiredOutcome": {
      "type": "string",
      "minLength": 1,
      "description": "Updated desired outcome (creative language)"
    }
  },
  "required": ["chartId", "newDesiredOutcome"]
}
```

---

#### 9. get_chart_progress

**Purpose**: Detailed progress information for specific chart.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "chartId": {
      "type": "string",
      "description": "Chart ID to get progress for"
    }
  },
  "required": ["chartId"]
}
```

**Response**:
```json
{
  "chartId": "chart_1765629421446",
  "progress": 0.33,
  "completedActions": 1,
  "totalActions": 3,
  "desiredOutcome": "Create engaging podcast",
  "currentReality": "Learn recording/editing complete; creating episodes",
  "actionSteps": [...]
}
```

---

### Narrative Beat Tools

#### 10. create_narrative_beat

**Purpose**: Create dramatic narrative beat within structural tension chart.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "parentChartId": {
      "type": "string",
      "description": "Parent structural tension chart"
    },
    "title": {
      "type": "string",
      "minLength": 1,
      "description": "Beat title"
    },
    "act": {
      "type": "number",
      "enum": [1, 2, 3],
      "description": "Dramatic act number"
    },
    "type_dramatic": {
      "type": "string",
      "enum": ["Exposition", "Rising Action", "Climax", "Resolution", "Discovery", "Crisis", "Integration"],
      "description": "Dramatic type"
    },
    "universes": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 1,
      "description": "Perspectives: Engineer World, Ceremony World, Story Engine World"
    },
    "description": {
      "type": "string",
      "minLength": 1,
      "description": "Technical/factual description"
    },
    "prose": {
      "type": "string",
      "minLength": 1,
      "description": "Character-level narrative prose"
    },
    "lessons": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Lessons extracted from this beat"
    },
    "assessRelationalAlignment": {
      "type": "boolean",
      "description": "Whether to assess relational alignment"
    }
  },
  "required": ["parentChartId", "title", "act", "type_dramatic", "universes", "description", "prose", "lessons"]
}
```

---

#### 11. telescope_narrative_beat

**Purpose**: Break down narrative beat into detailed sub-beats.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "parentBeatName": {
      "type": "string"
    },
    "newCurrentReality": {
      "type": "string"
    },
    "initialSubBeats": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "title": { "type": "string" },
          "type_dramatic": { "type": "string" },
          "description": { "type": "string" },
          "prose": { "type": "string" },
          "lessons": { "type": "array", "items": { "type": "string" } }
        }
      }
    }
  },
  "required": ["parentBeatName", "newCurrentReality"]
}
```

---

#### 12. list_narrative_beats

**Purpose**: List all narrative beats for a chart.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "parentChartId": {
      "type": "string",
      "description": "Chart to list beats for (optional)"
    }
  }
}
```

---

### Knowledge Graph Tools

#### 13. create_entities

**Purpose**: Add entities to knowledge graph.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "entities": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "entityType": { "type": "string" },
          "observations": {
            "type": "array",
            "items": { "type": "string" }
          }
        },
        "required": ["name", "entityType", "observations"]
      }
    }
  },
  "required": ["entities"]
}
```

---

#### 14. create_relations

**Purpose**: Create relationships between entities.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "relations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "from": { "type": "string", "description": "Source entity name" },
          "to": { "type": "string", "description": "Target entity name" },
          "relationType": { "type": "string", "description": "Type of relationship" }
        },
        "required": ["from", "to", "relationType"]
      }
    }
  },
  "required": ["relations"]
}
```

---

#### 15-19. Other Knowledge Graph Tools

- **add_observations**: Add facts to entities
- **search_nodes**: Full-text search across graph
- **open_nodes**: Retrieve specific entity details
- **delete_entities/relations/observations**: Removal operations
- **read_graph**: Export complete graph

---

### Utility Tools

#### 20. creator_moment_of_truth

**Purpose**: Guided reflection on chart discrepancies through four-step process.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "chartId": {
      "type": "string"
    },
    "step": {
      "type": "string",
      "enum": ["full_review", "acknowledge", "analyze", "plan", "feedback"],
      "description": "Review step"
    },
    "userInput": {
      "type": "string",
      "description": "User's response for specific step"
    }
  },
  "required": ["chartId"]
}
```

---

#### 21. init_llm_guidance

**Purpose**: Initialize LLM guidance and teaching format.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "format": {
      "type": "string",
      "enum": ["full", "quick", "save_directive"],
      "description": "Guidance format type"
    }
  }
}
```

---

## 🔄 Data Models

### Structural Tension Chart Entity

```typescript
{
  name: string                    // "chart_XXX"
  entityType: "structural_tension_chart"
  observations: [
    "desiredOutcome",
    "currentReality",
    "progress metrics"
  ]
  metadata: {
    chartId: string
    desiredOutcome: string
    currentReality: string
    dueDate: ISO8601
    createdAt: ISO8601
    actionSteps: string[]
    progress: number (0-1)
    completedActions: number
    totalActions: number
  }
}
```

### Narrative Beat Entity

```typescript
{
  name: string                    // "chart_XXX_beat_YYY"
  entityType: "narrative_beat"
  observations: [
    "Act X [Type]",
    "Universe: ...",
    "Timestamp: ISO8601"
  ]
  metadata: {
    chartId: string
    act: 1|2|3
    type_dramatic: string
    universes: string[]
    timestamp: ISO8601
    narrative: {
      description: string
      prose: string
      lessons: string[]
    }
    relationalAlignment: {
      assessed: boolean
      score: number|null
      principles: string[]
    }
    fourDirections: {
      north_vision: string|null
      east_intention: string|null
      south_emotion: string|null
      west_introspection: string|null
    }
  }
}
```

---

## ✅ Validation Rules by Tool

### For All Tools
- ✅ Input must be valid JSON object
- ✅ Required fields present and non-null
- ✅ String fields have length constraints (1-500 chars typical)
- ✅ Enum fields match allowed values exactly
- ✅ Arrays have type constraints on items
- ✅ Dates must be ISO 8601 format

### Creative Orientation Validation
- ✅ Desired outcomes use creative language ("create", "build", "manifest")
- ✅ Current reality is factual, not aspirational
- ✅ Action steps are named results, not processes
- ✅ Lessons extracted are specific, not vague

### Cross-Tool Integration
- ✅ Chart IDs must reference existing charts
- ✅ Action step names must be unique within chart
- ✅ Entity names must be unique in graph
- ✅ Relationships require both entities to exist

---

## 🌊 Error Handling

### Standard Error Response
```json
{
  "error": true,
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "field": "field_name",
    "constraint": "what_constraint_was_violated"
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Input failed schema validation
- `MISSING_REQUIRED`: Required field missing
- `INVALID_FORMAT`: Field format doesn't match schema
- `NOT_FOUND`: Referenced resource doesn't exist
- `CREATIVE_ORIENTATION_ERROR`: Creative language not detected
- `DUPLICATE_KEY`: Unique constraint violated

---

## 📊 Success Criteria

An implementation is correct when:

- [ ] All 21 tools implement exact schemas as specified
- [ ] All required fields validated before processing
- [ ] All enum values enforced strictly
- [ ] Creative orientation validated where applicable
- [ ] Data models persist correctly in storage
- [ ] All responses match specified formats exactly
- [ ] Error handling provides clear constraint details
- [ ] Cross-LLM compatibility maintained (Claude, Gemini, etc.)

