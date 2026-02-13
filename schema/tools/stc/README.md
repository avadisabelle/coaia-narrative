# Structural Tension Chart Tools (STC)

This directory contains the core tools for creating and managing structural tension charts based on Robert Fritz's creative methodology.

## 🎯 Philosophy

Structural tension charts organize creative work around **what you want to create** (desired outcome) rather than problems to solve. The productive tension between desired outcome and current reality naturally seeks resolution through the path of least resistance.

**Key Principles:**
- **Structural Tension** = Desired Outcome + Current Reality
- **Advancing Patterns:** Completed actions flow into current reality, changing the structure
- **Telescoping:** Break down complex actions into detailed sub-charts
- **Creative Orientation:** Focus on creation, not problem-solving

## 📋 Tools in This Directory

### Core Workflow Tools

**[list_active_charts.json](list_active_charts.json)** / **[.yaml](list_active_charts.yaml)** ⭐
- **START HERE** - See all charts with progress metrics
- Shows chart ID, outcome, completion percentage, due dates
- Returns action steps with status
- **Most commonly used tool** for chart overview

**[create_structural_tension_chart.json](create_structural_tension_chart.json)** / **[.yaml](create_structural_tension_chart.yaml)**
- Create new chart with desired outcome and current reality
- Define initial action steps
- Set due date for chart completion
- Automatically distributes action step due dates

**[add_action_step.json](add_action_step.json)** / **[.yaml](add_action_step.yaml)** ⚠️ *Deprecated*
- **Use `manage_action_step` instead**
- Add new action steps to existing charts
- Kept for backward compatibility

**[manage_action_step.json](manage_action_step.json)** / **[.yaml](manage_action_step.yaml)** ✨ **RECOMMENDED**
- Unified interface for adding OR expanding action steps
- Auto-detects whether to add new action or telescope existing one
- Replaces both `add_action_step` and `telescope_action_step`
- Simpler API with intelligent behavior

**[telescope_action_step.json](telescope_action_step.json)** / **[.yaml](telescope_action_step.yaml)** ⚠️ *Deprecated*
- **Use `manage_action_step` instead**
- Break down action steps into detailed sub-charts
- Kept for backward compatibility

**[mark_action_complete.json](mark_action_complete.json)** / **[.yaml](mark_action_complete.yaml)**
- Mark action steps as complete
- Observations flow into current reality automatically
- Creates advancing pattern momentum
- Updates chart progress

### Progress & Updates

**[update_action_progress.json](update_action_progress.json)** / **[.yaml](update_action_progress.yaml)**
- Add progress observations to action steps
- Track work without marking complete
- Optionally update current reality simultaneously
- **Use for:** Partial progress, status updates

**[update_current_reality.json](update_current_reality.json)** / **[.yaml](update_current_reality.yaml)**
- Add observations directly to current reality
- **Use for:** External changes, new information, context shifts
- **Note:** Completed actions add to reality automatically

**[update_desired_outcome.json](update_desired_outcome.json)** / **[.yaml](update_desired_outcome.yaml)**
- Change the desired outcome of a chart
- **Use for:** Clarifying the outcome, pivoting direction
- Works for both master charts and telescoped sub-charts

**[get_chart_progress.json](get_chart_progress.json)** / **[.yaml](get_chart_progress.yaml)**
- Detailed progress metrics for a specific chart
- Shows completion percentage, remaining actions, timeline
- **Note:** `list_active_charts` provides similar info for all charts

### Advanced Tools

**[creator_moment_of_truth.json](creator_moment_of_truth.json)** / **[.yaml](creator_moment_of_truth.yaml)**
- Deep assessment prompts for creative reflection
- Evaluates structural integrity
- Identifies advancing vs oscillating patterns
- **Use for:** Creative coaching, chart quality assessment

**[remove_action_step.json](remove_action_step.json)** / **[.yaml](remove_action_step.yaml)**
- Remove action steps from charts
- ⚠️ **Use with caution** - breaks structural integrity if action is part of pattern
- Updates relations and cleans up orphaned data

## 🎯 Tool Group: STC_TOOLS

These tools are grouped as `STC_TOOLS` in the COAIA_TOOLS environment variable:

```bash
# Enable only STC tools (default)
COAIA_TOOLS="STC_TOOLS" npx coaia-memory

# Enable STC + system tools
COAIA_TOOLS="STC_TOOLS,init_llm_guidance" npx coaia-memory
```

**STC_TOOLS includes:**
1. create_structural_tension_chart
2. telescope_action_step *(deprecated)*
3. add_action_step *(deprecated)*
4. remove_action_step
5. mark_action_complete
6. get_chart_progress
7. list_active_charts ⭐
8. update_action_progress
9. update_current_reality
10. update_desired_outcome
11. creator_moment_of_truth
12. manage_action_step ✨

## 🚀 Common Workflows

### Creating a New Chart

```javascript
// Step 1: Create chart
{
  "desiredOutcome": "Build and deploy a Python web application",
  "currentReality": "Know basic Python, never used web frameworks",
  "dueDate": "2026-03-15T00:00:00Z",
  "actionSteps": [
    "Complete Django tutorial",
    "Build CRUD practice app",
    "Deploy to production"
  ]
}

// Result: chart_123 with 3 action steps
// Due dates auto-distributed evenly
```

### Tracking Progress

```javascript
// Step 1: See all charts
list_active_charts
// Returns: Chart IDs, progress %, actions with status

// Step 2: Update progress on an action
{
  "actionStepName": "chart_123_action_1",
  "progressObservation": "Completed models and views sections",
  "updateCurrentReality": false
}

// Step 3: Complete the action
{
  "actionStepName": "chart_123_action_1"
}
// Observations flow into current reality automatically
```

### Expanding an Action (Telescoping)

```javascript
// Original action: "Complete Django tutorial"
// Want to break it down further

// Using manage_action_step (recommended):
{
  "parentReference": "chart_123_action_1",  // entity name
  "actionDescription": "Complete Django tutorial",
  "initialActionSteps": [
    "Work through models chapter",
    "Build views and templates",
    "Complete admin interface section"
  ]
}

// Creates chart_456 as sub-chart
// Links: chart_123_action_1 --[telescopes_into]--> chart_456
// Sub-chart inherits parent action's due date
```

### Updating Based on External Changes

```javascript
// New information affects current reality
{
  "chartId": "chart_123",
  "newObservations": [
    "Discovered Django REST framework requirement",
    "Client wants API endpoints"
  ]
}

// Current reality updated
// Structural tension increased (gap widened)
// May want to add new actions
```

### Refining the Outcome

```javascript
// Realize the outcome needs clarification
{
  "chartId": "chart_123",
  "newDesiredOutcome": "Build and deploy a Python REST API backend with Django"
}

// Desired outcome updated
// Structural tension may increase or decrease
// Action steps may need adjustment
```

## 📊 Data Structures Created

### Chart Creation Flow

When `create_structural_tension_chart` runs, it creates:

**Entities:**
1. `chart_{id}` (structural_tension_chart)
2. `chart_{id}_desired_outcome` (desired_outcome)
3. `chart_{id}_current_reality` (current_reality)
4. `chart_{id}_action_1` through `chart_{id}_action_N` (action_step)

**Relations:**
1. Chart --[contains]--> Desired Outcome
2. Chart --[contains]--> Current Reality
3. Current Reality --[creates_tension_with]--> Desired Outcome
4. Each Action --[advances_toward]--> Desired Outcome

**Metadata:**
- Chart level = 0 (root chart)
- Due dates distributed across actions
- All timestamps (createdAt, updatedAt)

### Telescoping Flow

When an action is telescoped:

**New Entities:**
1. `chart_{new_id}` (sub-chart)
2. `chart_{new_id}_desired_outcome` = parent action description
3. `chart_{new_id}_current_reality` = optional or parent reality
4. `chart_{new_id}_action_1...N` = sub-actions

**New Relation:**
- Parent Action --[telescopes_into]--> Sub-chart

**Metadata Updates:**
- Sub-chart `level = parent.level + 1`
- Sub-chart `parentChart = parent chart ID`
- Sub-chart `parentActionStep = parent action name`
- Sub-chart `dueDate ≤ parent action dueDate`

### Completion Flow

When `mark_action_complete` runs:

**Updates:**
1. Action entity `completionStatus = true`
2. Action observations appended to current reality
3. Current reality `updatedAt` timestamp

**New Relation:**
- Action --[flows_into]--> Current Reality

**Result:**
- Structural tension changes (reality closer to outcome)
- Progress % increases
- Advancing pattern momentum

## ⚙️ Advanced Features

### Due Date Distribution

When creating a chart with N actions and a due date:
- Actions get evenly distributed due dates
- Action 1 due: start + (totalDays / (N+1))
- Action 2 due: start + (2 * totalDays / (N+1))
- etc.

Example: 3 actions, 30 days total
- Action 1: Day 7.5
- Action 2: Day 15
- Action 3: Day 22.5

### Hierarchical Telescoping

Charts can be nested multiple levels:
- Level 0: Master chart
- Level 1: First telescoping
- Level 2: Second telescoping
- No limit on depth

Each level maintains:
- Parent chart reference
- Parent action step reference
- Due date inheritance (never exceeds parent)

### Progress Calculation

Progress % = (completed actions / total actions) × 100

For telescoped charts:
- Parent action shows sub-chart progress
- Completion requires all sub-actions complete
- Multi-level progress aggregation

## 🎨 Creative Orientation Patterns

### Advancing Pattern (Good)
```
1. Create chart with clear desired outcome
2. Honest current reality assessment
3. Strategic action steps
4. Complete actions → observations flow to reality
5. Reality changes → new structural tension
6. Continue advancing toward outcome
```

### Oscillating Pattern (Avoid)
```
1. Create chart with problem-focused "outcome"
2. Current reality as "what's wrong"
3. Actions as "fixes" or "solutions"
4. Completing actions doesn't change structure
5. New problems emerge → back to step 1
6. No real advancement
```

**How to Stay in Advancing Pattern:**
- Use creation-oriented language
- Focus on what you want to create
- Honest current reality (not problem analysis)
- Action steps as strategic choices
- Celebrate completions flowing to reality

## 🔗 Related Documentation

- **[../narrative/README.md](../narrative/README.md)** - Narrative Beat tools
- **[../knowledge-graph/README.md](../knowledge-graph/README.md)** - Foundation KG tools
- **[../../data-model/README.md](../../data-model/README.md)** - Entity and Relation schemas
- **[../../README.md](../../README.md)** - Schema overview

## 📚 External Resources

- **Robert Fritz:** [The Path of Least Resistance](https://robertfritz.com)
- **Creative Process:** [Structural Tension Methodology](https://robertfritz.com/structural-tension/)
- **MCP Protocol:** [Model Context Protocol](https://modelcontextprotocol.io)

---

**Remember:** These tools implement structural tension methodology. Focus on creation, maintain honest current reality, and let the structural tension naturally resolve through strategic action.
