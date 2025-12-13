# COAIA Memory Application Specifications (RISE Framework)

> Complete specification for rebuilding COAIA Memory from scratch as an MCP server implementing structural tension charts for creative-oriented AI assistants.

**Document Version**: 1.0  
**Framework**: RISE (Reverse-engineer, Intent-extract, Specify, Export)  
**Target Audience**: LLMs, developers, and AI systems needing to understand creative-oriented memory management

---

## 🎯 OVERVIEW: What COAIA Memory Enables

### Creative Intent
COAIA Memory enables users to **manifest desired outcomes** through structural tension dynamics rather than problem-solving approaches. Users can create charts that maintain honest awareness of current reality, clarify what they want to create, and track advancing patterns toward those outcomes.

### Key Distinction from Traditional Tools
- **NOT Problem-Solving**: Doesn't focus on "fixing", "eliminating", or "solving" problems
- **NOT Task Management**: Doesn't operate as a to-do list or project tracker
- **IS Creative Manifestation**: Helps users apply Robert Fritz's structural tension principles to advance toward desired outcomes naturally

### Structural Tension Principle
The system creates productive tension between:
- **Current Reality**: Honest assessment of where you are now
- **Desired Outcome**: Clear vision of what you want to create
- **Structural Tension**: The unresolved gap that naturally seeks resolution through advancement

This tension generates natural progression toward outcomes when properly structured.

---

## 📊 CORE FUNCTIONAL COMPONENTS

### Component 1: Knowledge Graph Storage Backend
**Purpose**: Persist memory and relationships using structured graph format

**Spec File**: `storage_knowledge_graph.spec.md`

**What It Enables Users to Create**:
- Persistent memory that survives across sessions
- Complex relationship networks between creative elements
- Observation history showing progression over time

**Natural Progression**:
1. User provides creative aspirations (desired outcomes, current reality)
2. System stores them in structured format
3. System builds relationships showing how actions advance toward goals
4. User can review progression and see their advancement

**Key Structural Dynamics**:
- JSONL format allows line-by-line integrity (append-only safety)
- Entity-Relation-Observation model supports creative tracking
- Timestamps enable progress visualization

---

### Component 2: Structural Tension Chart Creation
**Purpose**: Enable users to establish the core creative structure

**Spec File**: `structural_tension_chart_creation.spec.md`

**What It Enables Users to Create**:
- Foundation for any creative endeavor with desired outcome clarity
- Automatic distribution of due dates across action steps
- Framework for maintaining creative orientation throughout pursuit

**Natural Progression**:
1. User articulates what they want to CREATE
2. System validates creative orientation (rejects problem-solving language)
3. User assesses current reality honestly (without readiness assumptions)
4. System creates structural tension between these states
5. User identifies strategic action steps
6. System automatically distributes due dates to create natural pacing

**Key Structural Dynamics**:
- Creative Orientation Validation: Teaches users proper creative framing
- Delayed Resolution Principle: Prevents premature resolution that destroys tension
- Automatic Date Distribution: Creates natural pacing without user effort

---

### Component 3: Telescoping & Hierarchical Breakdown
**Purpose**: Enable breaking complex action steps into detailed sub-charts

**Spec File**: `telescoping_hierarchical_advancement.spec.md`

**What It Enables Users to Create**:
- Detailed plans for complex action steps without losing sight of master vision
- Multiple zoom levels: overview and deep-dive details
- Natural progression from broad vision to specific execution

**Natural Progression**:
1. User has complex action step in master chart
2. System allows "zooming in" to break into sub-chart
3. Sub-chart inherits due date from parent action step
4. Sub-chart maintains its own structural tension (current reality → desired outcome)
5. User completes sub-chart actions
6. Completions flow back into parent chart's current reality
7. Master chart advances naturally

**Key Structural Dynamics**:
- Due Date Inheritance: Sub-chart due date bounds to parent action due date
- Hierarchical Relationships: Charts know their parent and level
- Advancing Information Flow: Completions cascade upward

---

### Component 4: Advancing Pattern Tracking & Completion
**Purpose**: Track progress in ways that naturally advance toward outcomes

**Spec File**: `advancing_pattern_tracking.spec.md`

**What It Enables Users to Create**:
- Success-building momentum where each completion changes the structural dynamic
- Progress tracking that prevents oscillating patterns
- Visual advancement indicators showing movement toward outcomes

**Natural Progression**:
1. User marks action step complete
2. System records completion as fact in current reality
3. Current reality shifts, creating new structural tension
4. New tension naturally guides next steps
5. System shows user they are advancing, not stuck
6. Momentum builds naturally without forced effort

**Key Structural Dynamics**:
- Completion → Current Reality Transformation: Completed actions become part of current reality facts
- Oscillation Prevention: Completing actions creates forward momentum, not back-and-forth
- Momentum Visualization: Charts show clear progress toward outcomes

---

### Component 5: MCP Tool Interface & Natural Language Integration
**Purpose**: Make structural tension methodology accessible through natural conversation

**Spec File**: `mcp_tool_interface.spec.md`

**What It Enables Users to Create**:
- Seamless conversation about creative work without technical jargon
- AI assistants that guide users toward creative orientation
- Tool filtering for different use cases (STC focus vs. KG focus)

**Natural Progression**:
1. User describes creative aspirations in natural language
2. LLM translates to proper structural tension chart
3. System validates creative orientation before accepting
4. User interacts conversationally about progress
5. System guides users away from problem-solving language
6. LLM surfaces guidance when needed

**Key Structural Dynamics**:
- Tool Groups: STC_TOOLS for creative work, KG_TOOLS for traditional knowledge graphs
- Configurable Filtering: Different LLMs/contexts get appropriate tools
- Educational Validation: System teaches methodology while working

---

### Component 6: Educational Guidance System
**Purpose**: Teach creative orientation and structural tension principles

**Spec File**: `educational_guidance.spec.md`

**What It Enables Users to Create**:
- Understanding of why creative orientation works better than problem-solving
- Vocabulary for structural thinking
- Ability to recognize and correct oscillating patterns

**Natural Progression**:
1. New user/LLM uses system
2. System detects common mistakes (problem-solving language, false readiness)
3. System provides specific, educational error messages
4. User learns methodology through interaction
5. User gradually internalizes creative orientation principles

**Key Structural Dynamics**:
- Error-as-Teaching: Validation errors explain WHY something is wrong
- Progressive Complexity: Guidance scales from quick reference to comprehensive
- Methodology Integration: Teaching happens during normal tool use

---

## 🔧 HOW COMPONENTS INTERCONNECT

### Data Flow Architecture

```
User Input (Natural Language)
    ↓
MCP Tool Interface (validates tool request)
    ↓
Structural Tension Validation (rejects problem-solving language)
    ↓
Knowledge Graph Manager (executes operation)
    ↓
Storage Backend (persists entities/relations)
    ↓
Hierarchy Management (maintains parent/child relationships)
    ↓
Output Formatting (presents as natural progression summary)
```

### Structural Advancement Pattern

```
Create Chart (Desired Outcome + Current Reality)
    ↓ creates tension
Add Action Step (breaks tension into manageable progression)
    ↓ identifies intermediate results
Telescope Action (detail one action step further)
    ↓ maintains due date constraints
Track Progress (actions advancing toward outcome)
    ↓ records completion
Mark Complete (completion becomes new reality)
    ↓ structural tension progresses
System advances toward desired outcome naturally
```

---

## 🎯 CREATIVE ADVANCEMENT SCENARIOS

### Scenario 1: Creating a Web Application
**User Intent**: "I want to create a modern web app that helps teams collaborate"

**Current Structural Reality**: "I have JavaScript experience, built 2 small projects, never deployed to production"

**Natural Progression Steps**:
1. User creates master chart with desired outcome and current reality
2. System auto-distributes due dates across initial action steps
3. User breaks down "Build API" into telescoped sub-chart
4. Sub-chart has own structural tension (current reality: "can write endpoints", desired: "robust production API")
5. User completes API action step, which becomes fact in master chart current reality
6. Master chart now shows "API complete" as existing condition, advancing tension toward larger outcome
7. Next action steps now make sense from new structural position

**Supporting Features**:
- Chart creation with creative orientation validation
- Automatic due date distribution maintaining overall timeline
- Telescoping enabling detail without losing context
- Progress tracking showing advancement from structural position

### Scenario 2: Learning Complex Skill
**User Intent**: "I want to become proficient in Python web development"

**Current Structural Reality**: "I know basic Python syntax, never used Django or any framework"

**Natural Progression Steps**:
1. Master chart establishes tension between syntax knowledge and web development proficiency
2. Action steps identified: Learn Django, Build tutorial project, Deploy live application
3. User telescopes "Learn Django" into sub-chart
4. Sub-chart current reality: "Installed Django, read intro docs"
5. Sub-chart desired outcome: "Understand Django's MTL structure"
6. User makes progress on MTV understanding, records observation
7. Completion of Django learning becomes part of master current reality
8. Master chart now shows "Django knowledge gained" as existing fact
9. Next actions (building project, deployment) are now adjacent progression steps

**Supporting Features**:
- Honest current reality prevents false readiness assumptions
- Telescoping enables deep learning on specific topics
- Progress updates track advancement without forcing completion
- Hierarchy shows master vision maintained while zooming to details

### Scenario 3: Creative Project Development
**User Intent**: "I want to build an innovative narrative experience"

**Current Structural Reality**: "I have storytelling ideas, no experience with interactive media tools, haven't written code for 3 years"

**Natural Progression Steps**:
1. Master chart establishes creative tension toward narrative innovation
2. Action steps: Learn interactive medium, Research story structure, Prototype experience
3. User telescopes "Learn interactive medium" maintaining structural creativity focus
4. Progress observations recorded showing learning advancement without marking complete
5. User updates current reality with "Researched Twine and Ink engines, leaning toward Ink"
6. This changes structural dynamic for next action steps naturally
7. User continues iterative advancement, each progress updating structural position

**Supporting Features**:
- Creative orientation maintained throughout (not "fix storytelling problems")
- Progress updates enable detailed tracking without completion pressure
- Current reality updates enable responsive adjustments to emerging conditions
- Telescoping allows creative iteration at multiple zoom levels

---

## 🛠️ IMPLEMENTATION REQUIREMENTS

### Technology Stack
- **Runtime**: Node.js (ES modules)
- **MCP Protocol**: Model Context Protocol SDK (node implementation)
- **Storage**: JSONL file-based (line-delimited JSON for append safety)
- **Type System**: TypeScript for reliability
- **Configuration**: Environment variables for tool filtering

### Data Structures
- **Entity**: name, entityType, observations[], metadata (timestamps, status, relationships)
- **Relation**: from, to, relationType, metadata (timestamps, strength)
- **KnowledgeGraph**: arrays of entities and relations

### Key Algorithms
- **Date Distribution**: Linear distribution of action steps between start and end dates
- **Hierarchical Navigation**: Parent/child relationships maintained via metadata
- **Progress Calculation**: Completed actions / total actions percentage
- **Validation Logic**: Regex patterns detecting problem-solving and readiness language

### Error Handling
- Educational error messages that explain methodology
- Graceful file I/O with fallback to empty graph on first run
- Transaction safety via append-only JSONL format
- Clear error messages for structural inconsistencies

### Tool Filtering Architecture
- Environment variables `COAIA_TOOLS` and `COAIA_DISABLED_TOOLS`
- Tool groups: STC_TOOLS (11 tools), KG_TOOLS (9 tools), CORE_TOOLS (4 tools)
- Individual tool enabling for fine-grained control
- Tool descriptions guide users to appropriate tools

---

## 📈 ADVANCING PATTERN VS OSCILLATING PATTERN

### Advancing Pattern (Structural Tension Dynamics)
- Each action completion adds to current reality facts
- New facts create new structural position
- Next steps naturally flow from new position
- Momentum builds - each step makes next easier
- Direction is forward toward desired outcome

**System Design for Advancement**:
- Completed actions explicitly flow into current reality
- Progress observable in changed structural position
- Charts show clear advancement metrics
- Telescoping maintains vision while enabling detail

### Oscillating Pattern (Problem-Solving Approach)
- Focus on "eliminating" problems
- Creates back-and-forth movement (fix something, it breaks elsewhere)
- No fundamental structural change
- Energy consumed maintaining status quo
- No forward momentum

**What System Prevents**:
- Rejects problem-solving language in desired outcomes
- Requires honest current reality (prevents false readiness)
- Tracks advancement not just activity
- Prevents completion without reality integration

---

## ✅ QUALITY CRITERIA FOR IMPLEMENTATION

### Creative Orientation
- ✅ All user communication uses creative language ("what you want to create")
- ✅ Validation teaches creative vs problem-solving distinction
- ✅ Desired outcome descriptions focus on manifestation
- ✅ Error messages show why creative orientation matters

### Structural Dynamics
- ✅ Current reality and desired outcome always paired
- ✅ Tension clearly displayed in chart summaries
- ✅ Completed actions automatically update reality
- ✅ Structural progression visible in UI/output

### Advancing Patterns
- ✅ Each completion shows progress toward outcome
- ✅ User can see momentum building
- ✅ Action steps advance from new structural positions
- ✅ No oscillation loops possible
- ✅ Clear evidence of movement forward

### Natural Language Integration
- ✅ Users describe work naturally without tool jargon
- ✅ LLMs understand methodology and guide appropriately
- ✅ Common mistakes caught with educational messages
- ✅ Tool descriptions guide users to right choice

### Documentation and Guidance
- ✅ LLM receives comprehensive guidance on first run
- ✅ Tool descriptions include methodology pointers
- ✅ Error messages explain WHY something is wrong
- ✅ Examples show creative orientation patterns

---

## 🔗 COMPONENT SPECIFICATION FILES

For complete implementation details, see:

1. **storage_knowledge_graph.spec.md** - Data persistence and graph operations
2. **structural_tension_chart_creation.spec.md** - Chart creation with validation
3. **telescoping_hierarchical_advancement.spec.md** - Hierarchy and zoom levels
4. **advancing_pattern_tracking.spec.md** - Progress tracking and completion flows
5. **mcp_tool_interface.spec.md** - Tool definitions and filtering
6. **educational_guidance.spec.md** - Error messages and learning system

---

## 📋 TESTING CREATIVE ADVANCEMENT

To verify implementation supports advancing patterns:

1. Create chart: Desired outcome clear, current reality honest
2. Add action step: Creates structural tension at sub-level
3. Complete action: Verify completion added to parent current reality
4. Check progress: Verify progress reflects advancement
5. List charts: Verify hierarchy shows complete/advancing relationship
6. Observe: Each completion visibly changes structural position toward goal

---

## 🎓 CREATIVE ORIENTATION VALIDATION CHECKLIST

For each feature implementation, verify:

- ✅ Does this help users CREATE something specific?
- ✅ Does this maintain structural tension appropriately?
- ✅ Does completion advance toward outcome or just complete task?
- ✅ Would an advancing pattern naturally emerge from this?
- ✅ Would oscillating patterns be prevented by this design?
- ✅ Is the methodology teaching built into the tool?

---

**This specification is sufficient for another LLM or developer to rebuild COAIA Memory from scratch while preserving its creative-oriented methodology and structural tension principles.**
