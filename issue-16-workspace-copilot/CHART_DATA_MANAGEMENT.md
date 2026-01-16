# Basic Chart Data Management - Implementation Guide

## Overview

This document explains the implementation of `getChartDetails()` and `getActionStepDetails()` methods, which are fundamental to understanding the telescoping architecture of COAIA Narrative's structural tension charts.

## Key Concept: Action Steps are Charts

**Critical Understanding**: An "action step" in COAIA Narrative is NOT a simple todo item. It is a complete, self-contained structural tension chart that is nested within a parent chart.

When you create an action step like "Master TypeScript", the system creates a new telescoped chart with:
- Its own `chartId` (e.g., `chart_456`)
- A `desired_outcome` entity containing "Master TypeScript"
- A `current_reality` entity with observations about the current state
- Potentially its own sub-action-steps (further telescoping)
- Metadata linking it to the parent chart

## Implementation

### 1. `getChartDetails(chartId: string)`

**Purpose**: Returns all entities and relations for a specific chart.

**Implementation**:
```typescript
async getChartDetails(chartId: string): Promise<KnowledgeGraph | null> {
  const graph = await this.loadGraph();
  
  // Filter all entities that belong to this chart
  const chartEntities = graph.entities.filter(e => e.metadata?.chartId === chartId);
  
  if (chartEntities.length === 0) {
    return null;
  }
  
  // Get entity names for relation filtering
  const chartEntityNames = new Set(chartEntities.map(e => e.name));
  
  // Filter relations between chart entities
  const chartRelations = graph.relations.filter(r =>
    chartEntityNames.has(r.from) && chartEntityNames.has(r.to)
  );
  
  return {
    entities: chartEntities,
    relations: chartRelations,
  };
}
```

**Returns**: A complete subgraph containing:
- All entities with `metadata.chartId === chartId`
- All relations connecting those entities
- Typically includes:
  - 1 `structural_tension_chart` entity
  - 1 `desired_outcome` entity
  - 1 `current_reality` entity
  - 0+ `action_step` entities (if not telescoped)
  - 0+ telescoped chart entities (if action steps exist)

### 2. `getActionStepDetails(actionStepName: string)`

**Purpose**: Get the full details of an action step by extracting its chartId and returning the complete sub-chart.

**Implementation**:
```typescript
async getActionStepDetails(actionStepName: string): Promise<KnowledgeGraph | null> {
  const graph = await this.loadGraph();
  
  // Find the action step entity (can be 'action_step' or 'desired_outcome')
  const actionStepEntity = graph.entities.find(e => 
    e.name === actionStepName && 
    (e.entityType === 'action_step' || e.entityType === 'desired_outcome')
  );
  
  if (!actionStepEntity || !actionStepEntity.metadata?.chartId) {
    return null;
  }
  
  // Extract chartId and delegate to getChartDetails
  return this.getChartDetails(actionStepEntity.metadata.chartId);
}
```

**How it works**:
1. Finds the entity with the given name
2. Extracts the `chartId` from that entity's metadata
3. Calls `getChartDetails()` with that chartId to return the full sub-chart

**Example**:
```javascript
// You have an action step entity: chart_456_desired_outcome
const actionDetails = await getActionStepDetails('chart_456_desired_outcome');

// This:
// 1. Finds entity 'chart_456_desired_outcome'
// 2. Extracts chartId = 'chart_456'
// 3. Returns getChartDetails('chart_456')
//    which includes all entities and relations for chart_456
```

## Telescoping Architecture

### Master Chart Structure

```
Master Chart (chart_123)
├── chart_123_chart (structural_tension_chart)
├── chart_123_desired_outcome (desired_outcome)
│   └── "Master TypeScript for backend development"
├── chart_123_current_reality (current_reality)
│   └── "Know JavaScript basics, never used TypeScript"
└── Relations:
    ├── chart_123_chart → chart_123_desired_outcome (contains)
    ├── chart_123_chart → chart_123_current_reality (contains)
    └── chart_123_current_reality → chart_123_desired_outcome (creates_tension_with)
```

### Telescoped Action Step (Sub-Chart)

```
Action Step Chart (chart_456)
├── chart_456_chart (structural_tension_chart)
│   └── metadata: { parentChart: 'chart_123', level: 1 }
├── chart_456_desired_outcome (desired_outcome)
│   └── "Learn TypeScript generics"
├── chart_456_current_reality (current_reality)
│   └── "Completed basic types, generics confusing"
└── Relations:
    ├── chart_456_chart → chart_456_desired_outcome (contains)
    ├── chart_456_chart → chart_456_current_reality (contains)
    ├── chart_456_current_reality → chart_456_desired_outcome (creates_tension_with)
    └── chart_456_desired_outcome → chart_123_desired_outcome (advances_toward)
```

**Key Points**:
- The action step IS the `chart_456_desired_outcome` entity
- But it's also the primary interface to chart_456
- `getActionStepDetails('chart_456_desired_outcome')` returns the ENTIRE chart_456 subgraph

## MCP Tools

### `get_chart`

```json
{
  "name": "get_chart",
  "arguments": {
    "chartId": "chart_456"
  }
}
```

Returns the full details of chart_456.

### `get_action_step`

```json
{
  "name": "get_action_step",
  "arguments": {
    "actionStepName": "chart_456_desired_outcome"
  }
}
```

Returns the same result as `get_chart` with chartId="chart_456" because it:
1. Finds the entity "chart_456_desired_outcome"
2. Extracts metadata.chartId = "chart_456"
3. Returns getChartDetails("chart_456")

## Why This Matters

This architecture enables:

1. **Deep Telescoping**: Action steps can have their own action steps, creating unlimited depth
2. **Complete Context**: Each action step maintains full structural tension (desired outcome + current reality)
3. **Consistent Interface**: Whether viewing a master chart or an action step, you get the same complete structure
4. **Parent-Child Tracking**: Telescoped charts know their parent via metadata
5. **Hierarchical Progress**: Progress rolls up from child charts to parents

## Testing

See `issue-16-workspace-copilot/test-chart-data-management.js` for comprehensive integration tests that verify:
- ✅ getChartDetails returns all entities and relations for a chart
- ✅ getActionStepDetails extracts chartId and returns full sub-chart
- ✅ Telescoped charts maintain parent-child relationships
- ✅ Action steps are complete structural tension charts

Run tests:
```bash
node issue-16-workspace-copilot/test-chart-data-management.js
```

## Example Usage

### Creating and Exploring a Telescoped Chart

```javascript
// 1. Create master chart
const master = await create_structural_tension_chart({
  desiredOutcome: "Master TypeScript",
  currentReality: "Know JavaScript basics",
  dueDate: "2026-03-15"
});
// Returns: { chartId: "chart_123", ... }

// 2. Add action step (creates telescoped chart)
const action = await add_action_step({
  parentChartId: "chart_123",
  actionStepTitle: "Learn generics",
  currentReality: "Basic types completed, generics confusing"
});
// Returns: { chartId: "chart_456", actionStepName: "chart_456_desired_outcome" }

// 3. Get full action step details
const actionDetails = await get_action_step({
  actionStepName: "chart_456_desired_outcome"
});
// Returns: Complete subgraph with:
// - chart_456_chart
// - chart_456_desired_outcome
// - chart_456_current_reality
// - All relations

// 4. Same result from get_chart
const chartDetails = await get_chart({
  chartId: "chart_456"
});
// Returns: Identical to actionDetails
```

## Conclusion

The implementation of `getChartDetails()` and `getActionStepDetails()` is elegant and consistent:
- `getChartDetails()` filters the graph by chartId
- `getActionStepDetails()` extracts the chartId from an action step entity and delegates to `getChartDetails()`
- Both return complete structural tension charts
- This enables unlimited telescoping depth while maintaining clear parent-child relationships

This architecture embodies the structural tension principle: each action step is itself a complete creative structure with its own desired outcome and current reality, not just a task on a list.
