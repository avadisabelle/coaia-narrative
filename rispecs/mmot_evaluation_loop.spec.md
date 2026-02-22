# MMOT Self-Evaluation & Self-Correction Component
## RISE Specification for Agent Autonomy and Witnessing

**Component Purpose**: Enable agents to witness their own output against defined Elements of Performance, acknowledge discrepancies, and execute self-correction cycles using the 4-step Managerial Moment of Truth (MMOT) framework.

---

## 🎯 What This Component Enables Users to Create

- **Self-Witnessing Agents**: Agents that autonomously monitor and evaluate their own creative advancement.
- **Transparent Self-Correction**: Visible, journey-aware correction cycles documented in narrative beats.
- **Collective Relational Inquiry**: Multi-perspective evaluation using directional protocols (Medicine Wheel).
- **High-Integrity Creations**: Outcomes that strictly adhere to defined Elements of Performance (DESIGN & EXECUTION).

---

## 🌊 The MMOT Structural Cycle

### The 4-Phase Resolution Pattern

1. **Acknowledge the Truth**:
   - **Action**: Compare delivered output against Elements of Performance.
   - **Goal**: Reach an "affirmative yes" on factual current reality.
   - **Anti-pattern**: Excuses, blame, or vague progress claims.

2. **Analyze How It Got There**:
   - **Action**: Perform a "blow-by-blow" analysis of actions and assumptions.
   - **Goal**: Identify the structural dynamics that produced the result.
   - **Focus**: Process design and execution flaws.

3. **Update the Chart**:
   - **Action**: Write new observations to current reality and add corrective action steps.
   - **Goal**: Align the structural tension chart with newly achieved truth.
   - **Effect**: Structural position shifts based on learning.

4. **Recommit or Redirect**:
   - **Action**: Make a fundamental choice about the desired outcome.
   - **Goal**: Re-establish primary intent or pivot to a new vision.
   - **Resolution**: Equilibrium found through intentional choice.

---

## 📋 Natural Language Describing Functional Aspects

### Elements of Performance (Criteria for Witnessing)

Users or AI companions define criteria at chart/step creation:
- **DESIGN**: "Did I architect this with the right structural intent?"
- **EXECUTION**: "Did I implement this adequately and with high quality?"

### The Self-Correction Journey

**Scenario**: Agent completes an implementation that doesn't meet all requirements.

1. **Agent Calls Tool**: `perform_mmot_evaluation({ chartId: "..." })`
2. **Phase 1 (Acknowledge)**: Agent reports: "Expected 7 AC, delivered 5. AC 6 and 7 failed due to path errors."
3. **Phase 2 (Analyze)**: Agent analyzes: "I assumed the local path was absolute; it was relative to the temporary directory."
4. **Phase 3 (Update)**: Agent calls tool again with `assessment` and `correctiveActions: ["Fix path resolution logic"]`.
5. **Phase 4 (Recommit)**: Agent recommits to the original outcome.
6. **Result**: A new `mmot_evaluation` beat appears in the visualizer, showing the "Turning Point" in the story.

---

## 🔧 Implementation Requirements

### Schema Extensions

```typescript
interface EntityMetadata {
  elementsOfPerformance?: Array<{
    description: string;
    type: 'DESIGN' | 'EXECUTION';
  }>;
  mmotEvaluations?: Array<{
    phase: 'acknowledge' | 'analyze' | 'update' | 'recommit';
    assessment: string;
    direction?: 'South' | 'East' | 'West' | 'North';
    timestamp: string;
  }>;
}
```

### Directional Perspective Mapping

| Direction | Perspective | Focus Area |
|---|---|---|
| **South (Mia)** | Structural/Architectural | DESIGN integrity |
| **East (Miette)** | Narrative/Emergence | EXECUTION resonance |
| **West (Heyva)** | Embodied/Reciprocal | EXECUTION implementation |
| **North (Echo Weaver)** | Wisdom/Synthesis | DESIGN pattern reflection |

### MMOT Evaluation Algorithm

```typescript
PERFORM_MMOT_EVALUATION(chartId, phase, assessment, direction, correctiveActions):
  
  chart = LOAD_CHART(chartId)
  
  // 1. Generate Guidance
  guidance = BUILD_PHASE_GUIDANCE(chart, phase)
  
  // 2. Process Assessment
  IF assessment EXISTS:
    // Update Chart Metadata
    APPEND_EVALUATION(chart, phase, assessment, direction)
    
    // Update Current Reality
    fact = "[MMOT " + phase + " [" + direction + "]] " + assessment
    APPEND_OBSERVATION(chart.currentReality, fact)
    
  // 3. Process Corrective Actions
  IF correctiveActions EXISTS:
    FOR EACH action IN correctiveActions:
      ADD_ACTION_STEP(chart, action)
      
  // 4. Emit Narrative Beat
  EMIT_BEAT({
    type_dramatic: "mmot_evaluation",
    observations: ["[MMOT " + phase + "] " + assessment],
    fourDirections: MAP_DIRECTION(direction, assessment)
  })
  
  RETURN guidance and success status
```

---

## ✅ Quality Criteria

### Agent Autonomy
- ✅ Agents can call the loop without human prompting.
- ✅ Assessment is grounded in defined Elements of Performance.
- ✅ Self-correction is documented as factual current reality.

### Narrative Integration
- ✅ Every evaluation emits an observable narrative beat.
- ✅ Multi-universe perspectives are honored in beat metadata.
- ✅ The "Turning Point" of correction is clear in the story arc.

### Structural Integrity
- ✅ The 4 phases are strictly followed (no skipping).
- ✅ Truth-telling is prioritized over "finishing."
- ✅ Recommitment is an intentional choice at the end of the loop.

---

## 🔗 Related Components

- **Structural Tension Chart Creation**: Where Elements of Performance are defined.
- **Multi-Universe Narrative Beats**: The medium through which evaluation is witnessed.
- **MCP Tool Interface**: The `perform_mmot_evaluation` tool specification.
- **Educational Guidance**: Teaching the difference between blame and MMOT.

---

**This specification enables rebuilding an autonomous self-evaluation loop that transforms agent performance into a transparent, advancing creative journey.**
