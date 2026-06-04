# Narrative Beat Tools

This directory contains tools for capturing and organizing narrative beats across multiple universes and timelines - perfect for multi-layered storytelling and complex narrative structures.

## 🎭 Purpose

Narrative beats are story moments that can exist across different universes, timelines, or narrative layers. They complement structural tension charts by providing a framework for capturing the **story** of creative work, not just the structure.

**Use Cases:**
- Multi-universe fiction writing
- Parallel timeline tracking
- Remixed narrative contexts (same story, different worlds)
- Capturing lessons and insights from creative journeys
- Documenting the "story behind the work"

## 📋 Tools in This Directory

**[create_narrative_beat.json](create_narrative_beat.json)** / **[.yaml](create_narrative_beat.yaml)**
- Create a narrative moment/beat
- Specify act (1, 2, or 3 in three-act structure)
- Tag with dramatic type (inciting_incident, midpoint, climax, etc.)
- Associate with one or more universes
- Include prose, description, and lessons

**[telescope_narrative_beat.json](telescope_narrative_beat.json)** / **[.yaml](telescope_narrative_beat.yaml)**
- Expand a beat into a detailed sub-story
- Break down complex moments into finer beats
- Maintain universe context
- Create nested narrative structures

**[list_narrative_beats.json](list_narrative_beats.json)** / **[.yaml](list_narrative_beats.yaml)**
- List all narrative beats
- Filter by act, universe, or dramatic type
- See beat hierarchy (telescoped beats)
- Overview of story structure

## 🎯 Tool Group: NARRATIVE_TOOLS

These tools are grouped as `NARRATIVE_TOOLS` in the COAIA_TOOLS environment variable:

```bash
# Enable STC + Narrative tools (default)
COAIA_TOOLS="STC_TOOLS,NARRATIVE_TOOLS" npx coaia-memory

# Enable only Narrative tools
COAIA_TOOLS="NARRATIVE_TOOLS" npx coaia-memory
```

**NARRATIVE_TOOLS includes:**
1. create_narrative_beat
2. telescope_narrative_beat
3. list_narrative_beats

## 🎬 Three-Act Structure

Narrative beats follow the classical three-act structure:

**Act 1: Setup**
- Inciting incident
- Character introduction
- World establishment
- Initial situation

**Act 2: Confrontation**
- Rising action
- Midpoint reversal
- Complications
- Stakes increase

**Act 3: Resolution**
- Climax
- Falling action
- Resolution
- Denouement

## 🌍 Multi-Universe Support

Beats can exist in multiple universes simultaneously:

```javascript
{
  "beatDescription": "The moment of realization",
  "act": 2,
  "type_dramatic": "midpoint",
  "universes": [
    "primary_timeline",
    "alternate_universe_a",
    "dream_sequence"
  ],
  "prose": "In every world, at this precise moment, the truth became clear..."
}
```

**Use Cases:**
- Parallel timelines in sci-fi
- Alternate POVs in same story
- Different narrative framings
- Remixed contexts (literary, mythic, technical)

## 📊 Data Structure

### Narrative Beat Entity

```json
{
  "name": "beat_123",
  "entityType": "narrative_beat",
  "observations": [
    "The protagonist discovers the hidden truth"
  ],
  "metadata": {
    "act": 2,
    "type_dramatic": "midpoint",
    "universes": ["main_timeline", "flashback_sequence"],
    "timestamp": "2026-02-13",
    "narrative": {
      "description": "Critical revelation scene",
      "prose": "The room fell silent as the evidence became undeniable...",
      "lessons": [
        "Truth emerges when resistance stops",
        "Awareness changes everything"
      ]
    },
    "createdAt": "2026-02-13T07:00:00Z"
  }
}
```

### Telescoped Beats

```json
// Parent beat
{
  "name": "beat_123",
  "entityType": "narrative_beat",
  "observations": ["The discovery sequence"],
  "metadata": {
    "act": 2,
    "type_dramatic": "midpoint"
  }
}

// Telescoped into sub-beats
{
  "name": "beat_456",
  "entityType": "narrative_beat",
  "observations": ["Finding the first clue"],
  "metadata": {
    "act": 2,
    "parentBeat": "beat_123",
    "level": 1
  }
}
{
  "name": "beat_457",
  "entityType": "narrative_beat",
  "observations": ["Connecting the dots"],
  "metadata": {
    "act": 2,
    "parentBeat": "beat_123",
    "level": 1
  }
}
```

## 🚀 Common Workflows

### Capturing a Story Beat

```javascript
{
  "beatDescription": "First encounter with the mystery",
  "act": 1,
  "type_dramatic": "inciting_incident",
  "universes": ["main_timeline"],
  "timestamp": "Day 1",
  "prose": "It started with a question that shouldn't have been asked...",
  "lessons": ["Curiosity opens doors", "Questions have power"]
}
```

### Expanding a Beat

```javascript
// Original beat: "The discovery sequence"
// Want to capture it in detail

{
  "beatName": "beat_123",
  "detailedDescription": "Breaking down the discovery moment",
  "subBeats": [
    "Notice the inconsistency",
    "Test the hypothesis",
    "Confirm the truth",
    "Accept the implications"
  ]
}

// Creates 4 sub-beats under beat_123
// Maintains act and universe context
```

### Filtering Narrative View

```javascript
// See all Act 2 beats
{
  "filterByAct": 2
}

// See beats in specific universe
{
  "filterByUniverse": "alternate_timeline_a"
}

// See all midpoint beats
{
  "filterByDramaticType": "midpoint"
}
```

## 🎨 Narrative + Structural Tension

Narrative beats complement structural tension charts:

**Structural Tension Chart:**
- The **mechanics** of creation
- Desired outcome + current reality
- Action steps and progress
- **What** you're creating

**Narrative Beats:**
- The **story** of creation
- Lessons and insights
- Emotional/dramatic moments
- **How it feels** to create

**Combined Power:**
```
Chart: "Build Python web app"
  Action: "Complete Django tutorial"
    Beat: "The moment authentication finally clicked"
      Prose: "After three days of confusion, the concept of middleware suddenly made perfect sense..."
      Lesson: "Confusion precedes clarity"
```

## 📖 Dramatic Types

Common dramatic beat types:

**Act 1:**
- `ordinary_world` - Status quo before change
- `inciting_incident` - The catalyst event
- `call_to_adventure` - The challenge appears
- `crossing_threshold` - Commitment to change

**Act 2:**
- `rising_action` - Complications build
- `midpoint` - Major reversal or revelation
- `low_point` - All seems lost
- `stakes_increase` - Consequences intensify

**Act 3:**
- `climax` - Peak dramatic moment
- `falling_action` - Immediate aftermath
- `resolution` - Conflicts resolved
- `denouement` - New normal established

## 🌟 Advanced Features

### Lessons Learned

Each beat can capture insights:

```javascript
{
  "lessons": [
    "Structural tension naturally seeks resolution",
    "Honest current reality enables advancement",
    "Creation differs fundamentally from problem-solving"
  ]
}
```

**Use for:**
- Documenting creative insights
- Tracking evolution of understanding
- Building wisdom library
- Teaching others

### Cross-Universe Patterns

Track how the same beat manifests across universes:

```javascript
{
  "beatDescription": "The moment of choice",
  "universes": [
    "technical_implementation",  // Code architecture decision
    "narrative_layer",           // Character choosing path
    "mythic_context"             // Hero accepting quest
  ],
  "prose": "The pattern appears in every context: commitment creates clarity."
}
```

### Hierarchical Storytelling

Nest beats for detailed narrative structure:

```
Beat: "The Complete Journey" (Act 1-3)
  ├─ Beat: "Act 1: Beginning" (Act 1)
  │   ├─ Beat: "Ordinary World"
  │   ├─ Beat: "Inciting Incident"
  │   └─ Beat: "Threshold Crossing"
  ├─ Beat: "Act 2: Struggle" (Act 2)
  │   ├─ Beat: "Rising Complications"
  │   ├─ Beat: "Midpoint Reversal"
  │   └─ Beat: "Low Point"
  └─ Beat: "Act 3: Resolution" (Act 3)
      ├─ Beat: "Climax"
      └─ Beat: "New Normal"
```

### Wampum Belt Sequencing (Parallel Non-Linear Model)

In addition to linear beat sequencing, the engine now supports a parallel **Wampum Belt** model:

- `create_wampum_belt` — define a non-linear mnemonic grid (`rows` × `cols`)
- `add_wampum_bead` — add a bead with mnemonic anchor, positional meaning, and optional ceremony/accountability links
- `read_wampum_belt` — read full belt or resolve bead reading by relational position (`left` / `center` / `right`)

This does **not** replace narrative beats. It runs alongside them as a relational memory layer.

## 🔗 Relation to Other Systems

### Integration with STC

Narrative beats can reference chart components:

```javascript
{
  "beatDescription": "Completing the first major action step",
  "observations": [
    "References chart_123_action_1 completion",
    "The moment Django tutorial finally made sense"
  ],
  "metadata": {
    "relatedChartAction": "chart_123_action_1"
  }
}
```

### Pure Narrative Usage

Beats don't require charts - use independently for:
- Fiction writing
- Journaling
- Documentation
- Storytelling

## 🔗 Related Documentation

- **[../stc/README.md](../stc/README.md)** - Structural Tension Chart tools
- **[../knowledge-graph/README.md](../knowledge-graph/README.md)** - Foundation KG tools
- **[../../data-model/README.md](../../data-model/README.md)** - Entity and Relation schemas
- **[../../README.md](../../README.md)** - Schema overview

## 📚 Story Structure Resources

- **Three-Act Structure:** Classical dramatic framework
- **Hero's Journey:** Joseph Campbell's monomyth
- **Save the Cat:** Blake Snyder's beat sheet
- **Narrative Remixing:** Contextual transposition techniques

---

**Remember:** Narrative beats capture the **story** of creative work. Use them to document insights, track emotional/dramatic moments, and see patterns across different contexts.
