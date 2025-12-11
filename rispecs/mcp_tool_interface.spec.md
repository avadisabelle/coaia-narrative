# MCP Tool Interface & Natural Language Integration Component
## RISE Specification for AI Assistant Integration

**Component Purpose**: Expose COAIA Memory's structural tension methodology through MCP tools that enable natural conversation about creative work while maintaining creative orientation and proper methodology use.

---

## 🎯 What This Component Enables Users to Create

- **Conversational Creative Work**: Discuss creative goals and progress naturally
- **LLM-Guided Methodology**: AI assistants can guide users toward creative orientation
- **Flexible Tool Access**: Different use cases get appropriate tool sets
- **Natural Progression Discovery**: Tools themselves guide toward right actions
- **Educational Integration**: Methodology teaching happens through tool use

---

## 📋 Natural Language Describing Functional Aspects

### Conversational Flow with Tools

**User in Claude Code**:
```
User: "I want to start a podcast about storytelling techniques"

Claude (reading tool descriptions): 
  - Sees create_structural_tension_chart tool
  - Recognizes this is creative goal, not problem-solving
  - Responds: "Great! Let's set up a structural tension chart. 
    First, what's your current reality? What do you have now 
    related to podcasting?"

User: "I've got microphone, never recorded anything, no audience yet"

Claude (calling create_structural_tension_chart):
  - desiredOutcome: "Create engaging storytelling podcast"
  - currentReality: "Have microphone, no recording/editing experience, no audience"
  - dueDate: "2025-06-30"
  - actionSteps: ["Learn recording/editing", "Create first 5 episodes", "Build audience"]

System (validates):
  - ✅ "Create" = creative orientation
  - ✅ Current reality is factual, not "ready to"
  - ✅ Action steps are strategic intermediary results
  - Returns chart created

Claude: "Perfect! I've created your podcast chart. You've got 3 action steps 
distributed across 6 months. Let's break down 'Learn recording/editing' further 
since that's your first step."

User: "Sure, break that down"

Claude (calling add_action_step):
  - Parents: podcast chart
  - Action: "Learn recording/editing"
  - Current reality: "Have microphone, no experience with DAW software"
  - System creates telescoped chart maintaining approach
```

### Tool Grouping Strategy

**STC_TOOLS** (Default): Structural Tension Chart focus
- Primary tools: create_structural_tension_chart, add_action_step, telescope_action_step
- Progress tools: mark_action_complete, list_active_charts, update_action_progress
- Reality tools: update_current_reality, update_desired_outcome
- Use when: LLM is primarily supporting creative projects and learning goals

**KG_TOOLS**: Traditional knowledge graph tools
- create_entities, create_relations, add_observations
- delete_entities, delete_relations, delete_observations
- search_nodes, open_nodes, read_graph
- Use when: LLM needs broader knowledge management beyond structural tension

**CORE_TOOLS**: Minimal viable set
- list_active_charts (see what exists)
- create_structural_tension_chart (create new charts)
- add_action_step (add to existing)
- mark_action_complete (track progress)
- Use when: Simple, focused creative work without complex hierarchies

---

## 🔧 Implementation Requirements

### Tool Definitions

#### Core STC Tools

**create_structural_tension_chart**
```
Purpose: Create new creative structure
Inputs:
  - desiredOutcome (required): What to CREATE (must pass creative orientation check)
  - currentReality (required): Honest assessment (must pass delayed resolution check)
  - dueDate (required): ISO8601 date for completion
  - actionSteps (optional): Strategic intermediate results
  
Validation:
  - Detects problem-solving words in desiredOutcome
  - Detects readiness language in currentReality
  - Provides educational error message if violated
  - Rejects incomplete charts until proper framing

Returns: New chart ID and created entities/relations
```

**add_action_step**
```
Purpose: Add strategic action to existing chart (creates telescoped chart)
Inputs:
  - parentChartId (required): Which chart to add to
  - actionStepTitle (required): What action to take
  - dueDate (optional): Due date (auto-distributed if not provided)
  - currentReality (required): Current state relative to THIS action
  
Validation:
  - Ensures current reality is factual
  - Creates structural tension at sub-level
  - Validates parent chart exists
  
Returns: New telescoped chart ID
```

**telescope_action_step**
```
Purpose: Break down an existing action into detailed sub-chart
Inputs:
  - actionStepName (required): Which action to detail
  - newCurrentReality (required): Honest assessment for sub-level
  - initialActionSteps (optional): Initial sub-actions
  
Validation:
  - Validates current reality is factual
  - Preserves parent due date as constraint
  
Returns: New sub-chart with inherited due date
```

**mark_action_complete**
```
Purpose: Mark action done, update current reality
Inputs:
  - actionStepName (required): Which action to complete
  
Processing:
  - Marks action as complete
  - Adds completion as FACT to parent current reality
  - Shifts structural position forward
  
Returns: Confirmation with advancement shown
```

**list_active_charts**
```
Purpose: Overview of all active creative work
Inputs: None (shows everything)
  
Output Format:
  - Hierarchical tree showing master + sub-charts
  - Progress percentages
  - Due dates
  - ID references for other operations
  
Use Case: "What am I working on?"
```

**update_action_progress**
```
Purpose: Track work without marking complete
Inputs:
  - actionStepName (required)
  - progressObservation (required): What progress made
  - updateCurrentReality (optional): Also update parent reality?
  
Use Case: "I'm 40% done with this" (without forcing completion)
```

**update_current_reality**
```
Purpose: Add observations to chart's current reality
Inputs:
  - chartId (required)
  - newObservations (required): Facts about current state
  
Use Case: External conditions change, update structural position
```

#### Traditional KG Tools

**create_entities / create_relations / add_observations**
```
Purpose: Traditional knowledge graph operations
Usage: For non-structural-tension use cases
Note: Descriptions guide users to STC tools for creative work
```

**search_nodes / open_nodes / read_graph**
```
Purpose: Query and inspect stored data
Note: read_graph with warning "rarely needed"
```

### Tool Filtering Architecture

**Environment Variables**:
```bash
# Enable tool groups and/or specific tools
COAIA_TOOLS="STC_TOOLS,KG_TOOLS"
COAIA_TOOLS="STC_TOOLS init_llm_guidance"
COAIA_TOOLS="create_structural_tension_chart list_active_charts"

# Disable specific tools from enabled groups
COAIA_DISABLED_TOOLS="delete_entities,delete_relations"
```

**Programmatic Filtering**:
```typescript
function getEnabledTools(): Set<string> {
  
  // Parse enabled tools from env
  const enabledStr = process.env.COAIA_TOOLS || 'STC_TOOLS,init_llm_guidance'
  const enabledGroups = enabledStr.split(/[,\s]+/)
  
  // Expand tool groups to individual tools
  const enabledTools = new Set<string>()
  
  FOR EACH group IN enabledGroups:
    IF group IS tool group name:
      enabledTools.ADD_ALL(TOOL_GROUPS[group])
    ELSE:
      enabledTools.ADD(group)  // Individual tool
  
  // Remove disabled tools
  const disabledStr = process.env.COAIA_DISABLED_TOOLS || ''
  const disabledTools = disabledStr.split(/[,\s]+/)
  
  FOR EACH tool IN disabledTools:
    enabledTools.DELETE(tool)
  
  RETURN enabledTools
}
```

### Tool Descriptions Guide Users

Each tool has description that guides toward creative orientation:

```typescript
{
  name: "create_structural_tension_chart",
  description: "Create a new structural tension chart with desired outcome, 
    current reality, and optional action steps. 
    
    CRITICAL: Use creative orientation (what you want to CREATE) not 
    problem-solving (what you want to fix/solve). Current reality must 
    be factual assessment, never 'ready to begin'.",
  
  inputSchema: { ... }
}
```

---

## 📊 MCP Server Integration

### Server Configuration
```typescript
const server = new Server({
  name: "coaia-memory",
  version: "2.2.3",
  description: "COAIA Memory - Creative-Oriented AI Memory System. 
    🚨 NEW LLM? Run 'init_llm_guidance' first!"
})

// Register tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const enabledTools = getEnabledTools()
  return { tools: filterByEnabled(allTools, enabledTools) }
})

// Register tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  
  switch(name) {
    case "create_structural_tension_chart":
      // Call KnowledgeGraphManager method
      // Validate creative orientation
      // Return results
      break
    // ... other tools ...
  }
})
```

### Tool Discovery Flow
1. Client requests tool list via MCP
2. Server returns enabled tools based on COAIA_TOOLS
3. Client shows tools to user/LLM
4. User describes work in natural language
5. LLM selects appropriate tool
6. Tool executes with validation
7. Methodology guidance provided if needed

---

## 🎯 Error Messages as Teaching

### Creative Orientation Error
```
User: "I want to fix my procrastination problem"

System Response (before chart created):
"🌊 CREATIVE ORIENTATION REQUIRED

Desired Outcome: "Fix my procrastination problem"

❌ **Problem**: Contains problem-solving language: "fix"
📚 **Principle**: Structural Tension Charts use creative orientation - 
                  focus on what you want to CREATE, not what you want to eliminate.

🎯 **Reframe Your Outcome**:
- Instead of: "Fix procrastination"
- Use: "Create consistent work habits" or "Establish daily productivity routine"

**Why This Matters**: Problem-solving creates oscillating patterns. 
Creative orientation creates advancing patterns toward desired outcomes."
```

### Delayed Resolution Error
```
User: "I'm ready to learn Python"

System Response:
"🌊 DELAYED RESOLUTION PRINCIPLE VIOLATION

Current Reality: "I'm ready to learn Python"

❌ **Problem**: Contains readiness assumption: "ready to"
📚 **Principle**: "Tolerate discrepancy, tension, and delayed resolution" - Robert Fritz

🎯 **What's Needed**: Factual assessment of your actual current state
- ✅ "Never programmed before, interested in web development"
- ✅ "Understand programming concepts, no Python experience"
- ❌ "Ready to learn" (assumption, not fact)

**Why This Matters**: Readiness assumptions prematurely resolve the structural 
tension needed for creative advancement."
```

---

## 🛠️ Tool Usage Patterns

### Pattern 1: New Creative Goal
```
1. User describes goal
2. Claude suggests: create_structural_tension_chart
3. Claude asks: What's your current reality?
4. User answers
5. System validates and creates chart
6. Claude suggests next steps: list_active_charts or add_action_step
```

### Pattern 2: Add Detail to Goal
```
1. User: "I need more detail on step X"
2. Claude calls: add_action_step (creates telescoped chart)
3. Telescoped chart inherits parent due date
4. User can work on sub-actions
```

### Pattern 3: Progress Tracking
```
1. User describes work done
2. Claude can call:
   - update_action_progress (if not complete)
   - mark_action_complete (if done)
   - update_current_reality (if conditions changed)
3. Charts show advancement
4. System shows next natural steps
```

---

## ✅ Quality Criteria

### Tool Usability
- ✅ Tool names clearly describe what they do
- ✅ Descriptions guide toward creative orientation
- ✅ Parameters are self-documenting
- ✅ Tools encourage right methodology usage

### LLM Integration
- ✅ Tools work with natural language input
- ✅ Validation teaches methodology
- ✅ Error messages explain WHY (not just what's wrong)
- ✅ Tool filtering enables different use cases

### Methodology Preservation
- ✅ Tool descriptions reinforce creative orientation
- ✅ Validation prevents problem-solving frames
- ✅ Tools guide toward advancing patterns
- ✅ Teaching integrated throughout tool use

---

## 🔗 Related Components

- **Structural Tension Chart Creation**: Core functionality exposed
- **Advancing Pattern Tracking**: Tools for marking completion
- **Educational Guidance**: init_llm_guidance tool provides methodology overview
- **Storage Backend**: Persists all tool results

---

**This specification enables rebuilding MCP tool interface that naturally guides users toward creative-oriented, structural-tension-aware memory management.**
