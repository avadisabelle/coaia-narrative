# Telescoping & Hierarchical Advancement Component
## RISE Specification for Multi-Level Chart Breakdown

**Component Purpose**: Enable users to "zoom in" on complex action steps, breaking them into detailed structural tension charts while maintaining creative vision and proper due date constraints.

---

## 🎯 What This Component Enables Users to Create

- **Multi-Level Creative Vision**: Maintain master vision while enabling detailed execution planning
- **Zoom Capability**: Move between overview (master chart) and details (sub-charts) seamlessly
- **Constrained Detail**: Sub-charts inherit due dates from parent action steps, preventing scope creep
- **Hierarchical Clarity**: Understand how detailed work relates to larger creative outcome
- **Advancing Information Flow**: Sub-chart completions cascade upward, advancing parent chart progress

---

## 🌊 Structural Tension at Multiple Levels

### Hierarchical Tension Dynamic
```
Level 0 (Master Chart):
  Current Reality: Python basics
  Desired Outcome: Production ML application
  Creates Tension ← → 
  Action Step: Build recommendation model

  Level 1 (Telescoped from Action Step):
    Current Reality: Can write Python, never built ML model
    Desired Outcome: Working recommendation model
    Creates Tension ← →
    Action Step: Learn model training techniques
    
    Level 2 (Telescoped further):
      Current Reality: Studied ML theory, no hands-on training
      Desired Outcome: Can train models end-to-end
      Creates Tension ← →
      Action Steps: Study frameworks, Practice on datasets, Deploy test model
```

### Key Principle: Constraint Inheritance
- Master chart due date: 2025-06-30
- "Build recommendation model" action due: 2025-04-30 (distributed)
- Telescoped sub-chart inherits: 2025-04-30 as maximum due date
- Sub-chart actions auto-distribute within this constraint
- Prevents infinite detail that could exceed overall timeline

---

## 📋 Natural Language Describing Functional Aspects

### Telescoping Flow

**User Working with Master Chart**:
```
Master Chart: "Create production ML application by 2025-06-30"
Actions: 
  1. Research deployment (due 2025-02-28)
  2. Build recommendation model (due 2025-04-30)  ← User says "I need more detail on this"
  3. Create web interface (due 2025-06-15)
```

**User Telescopes Action Step**:
```
"Let me break down 'Build recommendation model' further"

System Response: "What is your current reality relative to building the model?"
User: "I understand ML theory, studied some frameworks, but never actually trained 
       a model on real data or handled edge cases"

System Creates Sub-Chart:
  Desired Outcome: Build working recommendation model (inherited from action step)
  Current Reality: ML theory understood, no hands-on training experience
  Inherited Due Date: 2025-04-30 (cannot exceed parent action due date)
  
  Sub-chart Actions (auto-distributed within 2025-04-30):
    1. Learn TensorFlow/PyTorch by 2025-03-15
    2. Train model on sample dataset by 2025-04-10
    3. Handle edge cases & optimize by 2025-04-28
```

### Natural Progression with Telescoping

1. **Overview Level**: User sees master chart with broad action steps
2. **Decision to Detail**: User identifies complex action needing breakdown
3. **Context Extraction**: User articulates current reality for that specific action
4. **Sub-Chart Creation**: System creates new chart at appropriate level
5. **Detailed Execution**: User works on sub-chart actions
6. **Completion Cascade**: Finished sub-chart actions flow into parent current reality
7. **Parent Advancement**: Master chart current reality updates, showing progress
8. **Return to Overview**: User can zoom back out and see master chart advancement

---

## 🔧 Implementation Requirements

### Telescoping Activation
```typescript
TELESCOPE_ACTION_STEP(
  actionStepName: string,           // e.g., "chart_123_action_2"
  newCurrentReality: string,         // Honest assessment of current state
  initialActionSteps?: string[]      // Optional sub-actions for telescoped chart
)

Returns: {
  chartId: string,                   // New sub-chart ID
  parentChart: string,               // Reference back to parent
  level: 1,                          // Hierarchical level
  inheritedDueDate: ISO8601         // Due date from parent action
}
```

### Hierarchical Data Structure
```typescript
interface HierarchicalChart {
  name: string                       // e.g., "chart_456_chart"
  entityType: "structural_tension_chart"
  metadata: {
    chartId: string                  // Unique chart identifier
    parentChart?: string             // Parent chart ID (if telescoped)
    parentActionStep?: string        // Which action was telescoped
    level: number                    // 0 = master, 1+ = sub-charts
    dueDate: ISO8601                // Inherited from parent if sub-chart
    createdAt: ISO8601
    updatedAt: ISO8601
  }
}
```

### Due Date Inheritance Algorithm
```
TELESCOPE_ACTION_STEP(actionStepName, newCurrentReality):
  
  parentAction = LOAD(actionStepName)
  parentChart = LOAD(parentAction.metadata.chartId)
  
  inheritedDueDate = parentAction.metadata.dueDate
  
  IF inheritedDueDate EQUALS null:
    inheritedDueDate = DISTRIBUTE_DATE(
      parentChart.metadata.dueDate,
      other actions in chart
    )
  
  CREATE_NEW_CHART(
    desiredOutcome = parentAction.observations[0],  // Reuse action step text
    currentReality = newCurrentReality,              // From telescoping context
    dueDate = inheritedDueDate,                      // Inherited constraint
    level = parentAction.metadata.level + 1
  )
  
  RETURN new chart with parent relationship metadata
```

### Hierarchical Navigation
```typescript
interface HierarchyNavigation {
  // Move down (zoom in)
  getSubCharts(parentChartId: string): Chart[]
  
  // Move up (zoom out)
  getParentChart(subChartId: string): Chart | null
  
  // Full hierarchy view
  getHierarchyPath(chartId: string): Chart[]  // Path from master to this chart
}
```

---

## 🎯 Creative Advancement Scenarios

### Scenario: Complex Project with Multiple Levels

**Master Chart**: "Build mobile game"
- Desired: Fun, playable mobile game
- Current: Basic game development knowledge
- Due: 2025-12-31

**Action Steps** (auto-distributed):
1. Learn game engine (due 2025-06-30)
2. Build game mechanics (due 2025-09-30)
3. Create art assets (due 2025-11-30)

**User Telescopes "Build game mechanics"**:
- Current Reality: "Can program basic Unity features, never built complete game loop"
- Due Date: Inherited from action (2025-09-30)
- Sub-Chart Actions (distribute to 2025-09-30):
  1. Learn game loop architecture
  2. Implement core mechanics
  3. Build level system

**User Telescopes "Implement core mechanics" further**:
- Current Reality: "Understand theory, haven't coded mechanics yet"
- Due Date: Inherited constraint (2025-09-30 at latest)
- Level 2 Sub-Chart Actions:
  1. Code player movement (due 2025-08-10)
  2. Implement collision detection (due 2025-08-25)
  3. Add physics simulation (due 2025-09-15)

**Completion Cascade**:
1. User completes "Code player movement"
2. Level 2 sub-chart current reality updates
3. Level 1 sub-chart shows progress on "Implement core mechanics"
4. Master chart shows "Game mechanics action advancing"
5. User can zoom out and see master advancement toward complete game

---

## 🔗 Information Flow: Completions Cascading Up

### Advancing Reality Through Hierarchy

```
Level 2 Action Completed: "Physics simulation implemented"
  ↓ (Current reality updates)
Level 2 Sub-Chart: "Implement core mechanics" - 67% complete
  ↓ (Parent action advances)
Level 1 Sub-Chart: "Build game mechanics" - shows sub-progress
  ↓ (Updates parent action step)
Master Chart: "Build mobile game" 
  - Current Reality now includes: "Game mechanics progressing - physics working"
  - Structural tension shifts forward
  - Next action (art assets) becomes more adjacent
```

### Integration with Advancing Patterns
- When Level 2 action completes, Level 1 current reality updates
- When Level 1 chart completes entirely, flows into Level 0 current reality
- Each completion transforms structural position at parent level
- Master chart naturally advances through cascading completions

---

## 📊 Output Format

### Telescoping Response
```json
{
  "chartId": "chart_1735122899456",
  "parentChart": "chart_1735122899123",
  "level": 1,
  "inheritedDueDate": "2025-04-30T00:00:00Z",
  "desiredOutcome": "Build recommendation model",
  "currentReality": "Understand ML theory, never trained model on real data",
  "actions": [
    {
      "name": "chart_1735122899456_action_1",
      "title": "Learn TensorFlow implementation",
      "dueDate": "2025-03-15T00:00:00Z"
    },
    {
      "name": "chart_1735122899456_action_2",
      "title": "Train on sample dataset",
      "dueDate": "2025-04-10T00:00:00Z"
    }
  ]
}
```

### Hierarchy Visualization
```
📋 Production ML Application (Master Chart)
    ├── Research deployment options [COMPLETE] 
    ├── 🎯 Build recommendation model [ACTIVE] [75%]
    │   ├── Learn TensorFlow [COMPLETE]
    │   ├── 🎯 Train on sample dataset [ACTIVE] [50%]
    │   │   ├── 🎯 Set up training environment [ACTIVE]
    │   │   ├── Prepare dataset [PENDING]
    │   │   └── Run training [PENDING]
    │   └── Handle edge cases [PENDING]
    └── Create web interface [PENDING]
```

---

## ✅ Quality Criteria

### Hierarchical Integrity
- ✅ Sub-chart due date never exceeds parent action due date
- ✅ Sub-chart parent relationships properly maintained
- ✅ Level tracking accurate (0 for master, incrementing for each telescoping)
- ✅ Navigation both up and down works correctly

### Advancing Pattern Support
- ✅ Sub-chart completions update parent current reality
- ✅ Parent chart shows sub-progress accurately
- ✅ Completions cascade upward through hierarchy
- ✅ Master chart advances as sub-charts complete

### Creative Maintenance
- ✅ Telescoping maintains creative orientation at all levels
- ✅ Current reality validation applies to sub-charts
- ✅ Desired outcomes at each level support master vision
- ✅ No oscillation loops possible even with multiple levels

---

## 🔗 Related Components

- **Structural Tension Chart Creation**: Creating individual charts at any level
- **Advancing Pattern Tracking**: Cascading completions upward
- **MCP Tool Interface**: telescope_action_step and add_action_step tools
- **Educational Guidance**: Validating structural tension at each level

---

**This specification enables rebuilding multi-level chart telescoping with proper constraint inheritance and advancing information flow.**
