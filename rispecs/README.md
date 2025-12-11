# COAIA Memory - RISE Framework Specifications

> Complete RISE-based specifications for rebuilding COAIA Memory from scratch

## 📚 Specification Files

This directory contains comprehensive RISE (Reverse-engineer, Intent-extract, Specify, Export) specifications for the COAIA Memory MCP server. Each file describes a major component in sufficient detail that **another LLM or developer could rebuild the entire system from these specs alone**, maintaining all creative-oriented and structural-tension-based functionality.

### 📋 Main Overview
- **[app.specs.md](./app.specs.md)** - START HERE: Complete application specification with component overview, creative intent, and how everything interconnects

### 🔧 Component Specifications

1. **[structural_tension_chart_creation.spec.md](./structural_tension_chart_creation.spec.md)**
   - Creating new structural tension charts with desired outcomes and current reality
   - Creative orientation validation
   - Due date distribution algorithms
   - Educational error messages teaching proper framing

2. **[telescoping_hierarchical_advancement.spec.md](./telescoping_hierarchical_advancement.spec.md)**
   - Breaking down action steps into detailed sub-charts
   - Due date inheritance from parent constraints
   - Hierarchical navigation (zoom in/out)
   - Information flow cascading upward from completions

3. **[advancing_pattern_tracking.spec.md](./advancing_pattern_tracking.spec.md)**
   - Progress tracking that enables momentum building
   - Completion flowing into parent current reality
   - Oscillation prevention design
   - How advancing patterns differ from problem-solving cycles

4. **[storage_knowledge_graph.spec.md](./storage_knowledge_graph.spec.md)**
   - JSONL file format for append-only safety
   - Entity/Relation/Observation data structures
   - Query operations (search, open nodes, read graph)
   - Persistence and recovery mechanisms

5. **[mcp_tool_interface.spec.md](./mcp_tool_interface.spec.md)**
   - MCP tool definitions and natural language integration
   - Tool filtering via environment variables
   - Tool grouping (STC_TOOLS, KG_TOOLS, CORE_TOOLS)
   - How tools guide toward creative orientation

6. **[educational_guidance.spec.md](./educational_guidance.spec.md)**
   - Teaching methodology through error messages
   - Progressive guidance levels (quick, full, save directive)
   - Learning through doing vs manuals
   - Principle teaching integration

---

## 🎯 Core Creative Intent

**What COAIA Memory Enables Users to Create**:
- Sustainable creative advancement toward desired outcomes
- Multi-level creative visions (master charts + detailed breakdowns)
- Visible momentum toward goals through structural advancement
- Clear understanding of how present actions advance future outcomes

**Key Principle**: Users achieve goals through **structural tension dynamics** rather than problem-solving. The gap between honest current reality and desired outcome creates natural forces that guide advancement when properly structured.

---

## 🌊 The Three Core Pillars

### 1. Creative Orientation (Not Problem-Solving)
- Focus: What you want to **CREATE**
- Language: "Establish", "Build", "Develop", "Manifest"
- Avoid: "Fix", "Eliminate", "Solve", "Prevent"
- Why: Problem-solving creates oscillating patterns; creation creates advancing patterns

### 2. Structural Tension (Current Reality ↔ Desired Outcome)
- **Current Reality**: Honest assessment of where you are now
- **Desired Outcome**: Clear vision of what you want to create
- **Tension**: The gap that naturally seeks resolution
- **Advancement**: Natural progression when properly respected

### 3. Advancing Patterns (Not Oscillating)
- Each completed action becomes fact in current reality
- Structural position shifts forward with each completion
- Next steps naturally flow from changed position
- No back-and-forth or re-doing work
- Momentum builds naturally

---

## 🔄 How Components Interconnect

```
User Describes Creative Goal
         ↓
Creation of Structural Tension Chart
(Validates creative orientation)
         ↓
Current Reality + Desired Outcome + Action Steps
(Due dates automatically distributed)
         ↓
User Works on Action Steps
(Progress tracked with optional completion)
         ↓
Action Completion
(Marked complete, flows into parent reality)
         ↓
Structural Position Shifts
(What's now true changes, new tension dynamic)
         ↓
Next Action Becomes Adjacent
(Natural progression from new structural position)
         ↓
Repeats Until Outcome Achieved
(Advancing momentum builds throughout)
         ↓
Knowledge Stored Persistently
(In JSONL file across sessions)
```

---

## 📈 Implementing from These Specs

### Quality Test: Can Another LLM Rebuild This?

When rebuilding COAIA Memory from these specifications, verify:

1. **Creative Orientation Preserved**
   - ✅ Desired outcomes use creation language
   - ✅ Current reality contains honest assessment, not assumptions
   - ✅ Validation teaches proper framing
   - ✅ Tool descriptions guide toward creativity

2. **Structural Dynamics Maintained**
   - ✅ Current reality and desired outcome always paired
   - ✅ Completed actions integrate with parent reality
   - ✅ Structural position visibly changes with completion
   - ✅ Tension properly respected (not prematurely resolved)

3. **Advancing Patterns Enabled**
   - ✅ Each completion shows clear advancement toward goal
   - ✅ Momentum visible and building
   - ✅ No oscillation or back-and-forth possible
   - ✅ Natural progression from structural position

4. **User-Friendly Integration**
   - ✅ LLMs understand methodology from tool descriptions
   - ✅ Error messages teach principles, not just reject
   - ✅ Guidance available when needed
   - ✅ Natural language conversation supported

---

## 🛠️ Technology Stack (For Reference)

- **Runtime**: Node.js with TypeScript
- **MCP**: Model Context Protocol SDK
- **Storage**: JSONL (JSON Lines) format
- **Data**: Entity-Relation-Observation graph structure
- **Configuration**: Environment variables for tool filtering

---

## 📖 Creative Advancement Scenarios (Examples)

### Learning a Complex Skill
1. Create master chart: "Become proficient in Machine Learning"
2. Current reality: "Know Python, understand math, no hands-on ML experience"
3. Initial actions: Learn frameworks, Build projects, Deploy model
4. Telescope "Learn frameworks" → Deep dive into chosen framework
5. Complete framework action → Becomes part of current reality
6. "Build projects" now natural next step (foundation built)
7. Each completion demonstrates momentum toward proficiency

### Building a Product
1. Create chart: "Launch innovative mobile application"
2. Current: "Have design mockups, core team assembled, no code written"
3. Actions: Build backend, Create frontend, Deploy and launch
4. Telescope "Build backend" → API endpoints, Database schema, Integration layer
5. Complete endpoint development → Current reality: "Backend API functional"
6. Frontend development now natural next step
7. Momentum builds toward complete application

### Developing Personal Capacity
1. Create chart: "Establish sustainable creative practice"
2. Current: "Interested in writing, very inconsistent, no system"
3. Actions: Build writing habit, Create workspace, Establish routine
4. Work on habit building → Record progress without forcing completion
5. Establish writing space → Document setup progress
6. Complete routine action → Reality: "Have creative practice structure"
7. Next phases become natural continuation

---

## 🚀 Deployment Considerations

### For MCP Integration
- COAIA Memory runs as Node.js MCP server
- Configured via environment variables for tool filtering
- Custom memory paths via CLI arguments
- Educational guidance built into every tool

### For LLM Integration
- Tools work best with conversational LLMs (Claude, Gemini, etc.)
- Tool descriptions guide LLMs toward creative methodology
- Error messages provide teaching moments
- init_llm_guidance provides comprehensive methodology overview

### For Users
- Create charts using natural language
- LLMs help translate language to proper structural format
- Progress tracked through simple completions
- Momentum visible in chart hierarchies and progress

---

## ✅ Validation Checklist for Implementation

### Core Functionality
- [ ] Charts can be created with desired outcome + current reality
- [ ] Creative orientation validation rejects problem-solving language
- [ ] Delayed resolution validation rejects readiness assumptions
- [ ] Due dates auto-distribute across action steps
- [ ] Charts persist to JSONL file
- [ ] Charts can be retrieved across sessions

### Telescoping & Hierarchy
- [ ] Action steps can be broken into sub-charts
- [ ] Sub-charts inherit due dates from parent actions
- [ ] Hierarchical relationships maintained
- [ ] Navigation works both up (zoom out) and down (zoom in)

### Advancing Patterns
- [ ] Completions mark actions as done
- [ ] Completions add to parent current reality as facts
- [ ] Progress updates can be recorded without completion
- [ ] Charts show advancement percentages
- [ ] Momentum builds with each completion

### Tools & Integration
- [ ] All STC tools functioning and filtered appropriately
- [ ] Tool descriptions guide toward creative orientation
- [ ] Tool filtering works via environment variables
- [ ] Error messages provide educational value
- [ ] init_llm_guidance provides guidance at multiple levels

### Data Integrity
- [ ] JSONL append-only format prevents corruption
- [ ] Graph loads correctly from disk
- [ ] Queries return accurate results
- [ ] Hierarchical relationships intact

---

## 📞 Using These Specifications

### For Another LLM Rebuilding
1. Start with **app.specs.md** for complete overview
2. Read component specs in order (structural → hierarchical → advancing → storage → interface → guidance)
3. Implement core functionality from structural_tension_chart_creation
4. Add telescoping capabilities from hierarchical spec
5. Implement advancing pattern tracking
6. Add storage backend
7. Expose via MCP tools
8. Integrate educational guidance throughout

### For Maintaining Current Codebase
- Use specs to validate all functionality preserves creative intent
- Use specs as reference for new features
- Compare implementation against "what users can create"
- Verify advancing patterns work as documented

### For Training AI Systems
- Use as reference for understanding creative-oriented methodology
- Use scenarios as examples for teaching structural thinking
- Reference when discussing advances in creative AI systems

---

## 🎓 Robert Fritz's Structural Tension Methodology

COAIA Memory implements principles from Robert Fritz's work on structural tension and creative process:

- **Structural Tension**: The unresolved gap between current reality and desired outcome
- **Creative Orientation**: Focusing on what you want to create vs what you want to eliminate
- **Delayed Resolution**: Tolerating productive tension rather than prematurely resolving it
- **Advancing Patterns**: Structural designs that create continuous forward movement

For more information: [robertfritz.com](https://robertfritz.com)

---

**These specifications represent the complete RISE-based blueprint for COAIA Memory. Another LLM or developer with these specs and reasonable programming knowledge should be able to rebuild the entire system while preserving its creative-oriented, structural-tension-based functionality.**
