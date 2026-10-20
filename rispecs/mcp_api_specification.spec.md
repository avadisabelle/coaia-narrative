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

### Tool Registry at 0.24.1

`src/tool-definitions.ts` registers 35 tools; `src/tool-groups.ts` places them in groups. By default (`COAIA_TOOLS` unset) `STC_TOOLS`, `NARRATIVE_TOOLS` and `init_llm_guidance` are enabled: 23 tools. Revised 2026-10-20 from Miadi Chronicle Episode 297 (`miadi-chronicle://297`).

| group | tools | detailed in |
|---|---|---|
| `STC_TOOLS` (19) | `create_structural_tension_chart`, `telescope_action_step`, `add_action_step`, `manage_action_step`, `remove_action_step`, `mark_action_complete`, `get_chart_progress`, `list_active_charts`, `get_chart`, `get_action_step`, `update_action_progress`, `update_current_reality`, `update_desired_outcome`, `update_chart_due_date`, `delay_resolution`, `list_delayed_resolutions`, `end_delayed_resolution`, `link_chart_to_github_issue`, `perform_mmot_evaluation` | sections 1 to 9, 20 and 22 to 24 below; `delayed_resolution.spec.md` for the three delay tools; `coaia-github/` for the issue link; `src/tool-definitions.ts` for `get_chart`, `get_action_step`, `remove_action_step` and `update_chart_due_date` |
| `NARRATIVE_TOOLS` (3) | `create_narrative_beat`, `telescope_narrative_beat`, `list_narrative_beats` | sections 10 to 12, `narrative_beat_creation.spec.md` |
| `WAMPUM_TOOLS` (3) | `create_wampum_belt`, `add_wampum_bead`, `read_wampum_belt` | `wampum_belt_visualization.spec.md` |
| `KG_TOOLS` (9) | `create_entities`, `create_relations`, `add_observations`, `delete_entities`, `delete_observations`, `delete_relations`, `search_nodes`, `open_nodes`, `read_graph` | sections 13 to 19 |
| ungrouped (1) | `init_llm_guidance` | section 21 |

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
    },
    "elementsOfPerformance": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "description": { "type": "string" },
          "type": { "type": "string", "enum": ["DESIGN", "EXECUTION"] }
        },
        "required": ["description", "type"]
      },
      "description": "Optional criteria for autonomous self-evaluation (optional)"
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

#### 3. add_action_step (⚠️ DEPRECATED)

**Purpose**: Add strategic intermediate result to existing chart. Use `manage_action_step` instead.

... [rest of add_action_step] ...

#### 4. telescope_action_step (⚠️ DEPRECATED)

**Purpose**: Break down action step into detailed sub-chart. Use `manage_action_step` instead.

... [rest of telescope_action_step] ...

#### 4b. manage_action_step (✨ RECOMMENDED)

**Purpose**: Unified tool for adding strategic intermediate results OR expanding existing actions into detailed sub-charts (telescoping).

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "parentReference": {
      "type": "string",
      "description": "ID of parent chart OR name of action step to telescope"
    },
    "actionDescription": {
      "type": "string",
      "description": "Title of the action step"
    },
    "currentReality": {
      "type": "string",
      "description": "Honest assessment of current state for this action context"
    },
    "initialActionSteps": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Initial sub-steps if telescoping"
    },
    "dueDate": {
      "type": "string",
      "description": "Optional ISO 8601 date"
    },
    "performanceElements": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "description": { "type": "string" },
          "type": { "type": "string", "enum": ["DESIGN", "EXECUTION"] }
        },
        "required": ["description", "type"]
      },
      "description": "Criteria for autonomous self-evaluation"
    }
  },
  "required": ["parentReference", "actionDescription"]
}
```

**Response**:
```json
{
  "chartId": "chart_456",
  "actionStepName": "chart_123_action_1",
  "message": "Action step managed successfully"
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
    },
    "completedBy": {
      "type": "string",
      "description": "The person or seat that completed it; recorded as endedBy when this ends a delayed resolution (default 'mark_action_complete')"
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

**Delayed step (0.24.1)**: when the step carries an open delayed resolution, completing it ends that delay with `outcome: "resolved"`, `endedBy` = `completedBy` (or `"mark_action_complete"`), `endNote: "completed"`. The tool's text response does not mention the ended delay; `get_action_step` shows it. See `delayed_resolution.spec.md`, rule 4b.

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

**Since 0.24.0** the progress also carries `steps` (each with `name`, derived `status` of `completed`, `delayed` or `pending`, `dueDate`, and for an open delay `resolveBy` and `owed`) and `delayedActions`. `nextAction` is the incomplete step due earliest, delayed ones included.

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
    "perspective_types": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 1,
      "description": "Perspectives that read this beat: engineer, ceremony, story_engine"
    },
    "universes": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 1,
      "description": "Deprecated alias for perspective_types (pre-0.17 name). engineer-world, ceremony-world, story-engine-world are stored as engineer, ceremony, story_engine"
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
  "required": ["parentChartId", "title", "act", "type_dramatic", "description", "prose", "lessons"],
  "$comment": "One of perspective_types or universes is also required. The handler enforces it."
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

#### 20. perform_mmot_evaluation

**Purpose**: Autonomous MMOT (Managerial Moment of Truth) self-evaluation on a structural tension chart.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "chartId": {
      "type": "string",
      "description": "ID of the chart to evaluate"
    },
    "phase": {
      "type": "string",
      "enum": ["full", "acknowledge", "analyze", "update", "recommit"],
      "default": "full",
      "description": "Which MMOT phase to run"
    },
    "assessment": {
      "type": "string",
      "description": "The agent's honest assessment — expected vs. delivered"
    },
    "direction": {
      "type": "string",
      "enum": ["South", "East", "West", "North"],
      "description": "Optional directional perspective for collective inquiry"
    },
    "correctiveActions": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Optional corrective action steps to add to the chart"
    },
    "updateReality": {
      "type": "boolean",
      "default": true,
      "description": "Whether to write evaluation observations into current reality"
    }
  },
  "required": ["chartId"]
}
```

**Response**:
```json
{
  "guidance": "## MMOT Phase 1: Acknowledge the Truth...\n\n**Assessment**: [assessment content]",
  "evaluationStored": true,
  "beatEmitted": true
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

### Delayed Resolution Tools (0.24.0)

Specified in full in `delayed_resolution.spec.md`. A step is named as a written step (`chart_123_action_1`) or a telescoped step (`chart_123`, `chart_123_chart` or `chart_123_desired_outcome`).

#### 22. delay_resolution

**Purpose**: Record that someone strategically chose to delay a step's resolution. The step's due date becomes `resolveBy`.

```json
{
  "type": "object",
  "properties": {
    "actionStepName": { "type": "string" },
    "resolveBy": { "type": "string", "description": "ISO date-time in the future" },
    "reason": { "type": "string" },
    "chosenBy": { "type": "string" },
    "primaryChoice": { "type": "string", "description": "Defaults to the desired outcome of the chart the step advances" },
    "wakeOn": { "type": "array", "items": { "type": "string" } },
    "session": {
      "type": "object",
      "properties": {
        "sessionId": { "type": "string" }, "agent": { "type": "string" }, "host": { "type": "string" },
        "cwd": { "type": "string" }, "tmux": { "type": "string" },
        "resumeCommand": { "type": "string" }, "inventoryRecord": { "type": "string" }
      },
      "required": ["sessionId"]
    }
  },
  "required": ["actionStepName", "resolveBy", "reason", "chosenBy"]
}
```

Refused: a completed step, a chart with no parent, a `resolveBy` that is not a date or not in the future.

#### 23. list_delayed_resolutions

**Purpose**: The standing delays, sorted by `resolveBy`, each with `daysRemaining` and `owed`.

```json
{
  "type": "object",
  "properties": {
    "dueWithinDays": { "type": "number", "description": "Owed ones included" },
    "includeEnded": { "type": "boolean", "default": false }
  }
}
```

#### 24. end_delayed_resolution

**Purpose**: End a delay by rehydrating its session or releasing the step. The record is kept.

```json
{
  "type": "object",
  "properties": {
    "actionStepName": { "type": "string" },
    "endedBy": { "type": "string" },
    "outcome": { "type": "string", "enum": ["rehydrated", "released"] },
    "endNote": { "type": "string" }
  },
  "required": ["actionStepName", "endedBy", "outcome"]
}
```

A `rehydrated` end returns the session's `resumeCommand` (or `null`). `resolved` is written only by completion.

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

### Action Step Entity (delay fields, 0.24.0)

An `action_step` entity, or a telescoped step's `desired_outcome` entity, may carry in its `metadata`:

```typescript
{
  dueDate?: ISO8601                                  // becomes resolveBy when a delay is chosen
  completionStatus?: boolean                         // unchanged by a delay
  delayedResolution?: DelayedResolution              // the current delay, open or ended
  delayedResolutionHistory?: DelayedResolution[]     // earlier records, oldest first
}
```

`DelayedResolution` and `AgentSessionRef` are defined in `delayed_resolution.spec.md`.

### Narrative Beat Entity

```typescript
{
  name: string                    // "chart_XXX_beat_YYY"
  entityType: "narrative_beat"
  observations: [
    "Act X [Type]",
    "Perspectives: ...",
    "Timestamp: ISO8601"
  ]
  metadata: {
    chartId: string
    act: 1|2|3
    type_dramatic: string
    perspective_types: string[]   // engineer | ceremony | story_engine
    universes?: string[]          // pre-0.17 records only, with -world values; readers map them
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

- [ ] Every registered tool (35 at 0.24.1) implements its schema; this file details those in its numbered sections, and the registry table names where the others are specified
- [ ] All required fields validated before processing
- [ ] All enum values enforced strictly
- [ ] Creative orientation validated where applicable
- [ ] Data models persist correctly in storage
- [ ] All responses match specified formats exactly
- [ ] Error handling provides clear constraint details
- [ ] Cross-LLM compatibility maintained (Claude, Gemini, etc.)

