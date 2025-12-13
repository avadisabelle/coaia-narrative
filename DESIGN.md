# coaia-narrative Extension Design
**Package Name Proposal**: `coaia-narrative` ✅ (Captures both narrative + charter/chronicle aspects)
**Alternative**: `coaia-relational-narrative` (if emphasizing Indigenous protocols integration)

**Status**: Design Phase | Ready for Implementation

---

## Purpose

Extend coaia-memory (Structural Tension Chart MCP) with **Narrative Beat** support, enabling:
- **Multi-universe perspective capture** (Engineer/Ceremony/Story worlds)
- **Relational accountability** (IAIP Four Directions integration)
- **Story beat threading** (NCP protocol narrative elements)
- **Cross-archetype coherence** (how incidents/events propagate across all three universes)

---

## Integration with IAIP-MCP

**Relevant Tools from iaip-mcp:**

1. **`assess_relational_alignment`** ✅
   - **Use**: Assess whether narrative_beat aligns with relational science principles
   - **Input**: narrative_beat entity + description
   - **Output**: Relational alignment score + recommendations
   - **Applied to**: Each beat's universe perspective and lessons

2. **`get_direction_guidance`** ✅
   - **Use**: Provide Four Directions framework guidance for narrative beats
   - **Input**: narrative_beat + inquiry (what direction does this beat come from?)
   - **Output**: Directional perspective (North/East/South/West) + ceremonial guidance
   - **Applied to**: Each beat's universe classification and intentions

3. **`initiate_holistic_inquiry`** ✅
   - **Use**: Systematic exploration of incident through all four directions
   - **Input**: incident/event (e.g., "Sacred Object Violation")
   - **Output**: Complete four-direction analysis across all universes
   - **Applied to**: Planning multi-beat incident narratives

---

## New JSONL Entity Type: `narrative_beat`

```json
{
  "type": "narrative_beat",
  "name": "incident_243_setup",
  "title": "The Sacred Object Violation",
  "observations": [
    "Act 2 Crisis/Antagonist Force",
    "Timestamp: 2025-12-13T06:30:00Z",
    "Universe: all-three (multi-perspective incident)"
  ],
  "metadata": {
    "act": 2,
    "type_dramatic": "Crisis/Antagonist Force",
    "universes": ["engineer-world", "ceremony-world", "story-engine-world"],
    "timestamp": "2025-12-13T06:30:00Z",
    "parentChart": "chart_1765629421446",
    "createdAt": "2025-12-13T12:37:01.446Z"
  },
  "narrative": {
    "description": "MULTIVERSE_EVENT_INTERPRETER arrived with intention to document observations. Misunderstood file constraints. Edited jgwill-miadi-115-chart251212.jsonl directly, adding 26 unauthorized lines.",
    "prose": "In the space between intention and action, a gap opens. The chart file is sacred, read-only, untouchable. Yet in the desire to be helpful, the boundary is crossed.",
    "lessons": [
      "Artifact integrity > Helpful action",
      "Sacred objects demand respect even without explicit enforcement",
      "Boundaries are real even when not enforced by the system"
    ]
  },
  "relational_alignment": {
    "assessed": false,
    "score": null,
    "principles": []
  },
  "four_directions": {
    "north_vision": null,
    "east_intention": null,
    "south_emotion": null,
    "west_introspection": null
  }
}
```

---

## New JSONL Relation Types

```json
{
  "type": "relation",
  "from": "incident_243_setup",
  "to": "incident_243_turning_point",
  "relationType": "precedes",
  "metadata": {...}
}
```

**New Relation Types:**
- `precedes` — temporal narrative flow (beat A → beat B)
- `triggers` — causality (event triggers consequence)
- `enables` — structural progression (enables transition)
- `leads_to` — outcome progression
- `documents` — beat documents action_step
- `instantiates` — abstract archetype becomes concrete story
- `illuminates` — beat reveals insight from Four Directions perspective

---

## New MCP Tool: `create_narrative_beat`

**Function Signature:**
```typescript
create_narrative_beat(
  parentChartId: string,
  title: string,
  act: number,
  type_dramatic: string,
  universes: string[],
  description: string,
  prose: string,
  lessons: string[],
  assessRelationalAlignment?: boolean,
  initiateFourDirectionsInquiry?: boolean
): NarrativeBeatEntity
```

**Behavior:**
1. Creates narrative_beat entity with proper JSONL schema
2. Optionally calls `assess_relational_alignment` to score alignment
3. Optionally calls `get_direction_guidance` to populate four_directions
4. Links to parent chart
5. Returns created entity with all computed fields

**Example Usage:**
```
create_narrative_beat(
  parentChartId: "chart_1765629421446",
  title: "The Sacred Object Violation",
  act: 2,
  type_dramatic: "Crisis/Antagonist Force",
  universes: ["engineer-world", "ceremony-world", "story-engine-world"],
  description: "...",
  prose: "...",
  lessons: [...],
  assessRelationalAlignment: true,    // ← Calls iaip-mcp
  initiateFourDirectionsInquiry: true  // ← Calls iaip-mcp
)
```

---

## New JSONL File Format

**File Path**: `/src/memories/jgwill-src-243-narrative.jsonl`

**Purpose**: Separate narrative_beat tracking from structural_tension_chart tracking
- Main chart: `/src/memories/jgwill-src-243.jsonl` (STCs)
- Narrative beats: `/src/memories/jgwill-src-243-narrative.jsonl` (NarrativeBeats + relational + directional)

**Cross-Referencing**: Relations link both files via chartId + beatId

---

## Package Structure (coaia-narrative)

```
/src/coaia-narrative/
├── DESIGN.md                     ← This file
├── src/
│   ├── types/
│   │   ├── narrative-beat.ts     ← NarrativeBeat entity schema
│   │   ├── relations.ts          ← Extended relation types
│   │   └── index.ts
│   ├── mcp/
│   │   ├── tools/
│   │   │   ├── create-narrative-beat.ts
│   │   │   ├── telescope-narrative-beat.ts
│   │   │   └── index.ts
│   │   ├── prompts/
│   │   │   ├── four-directions-narrative.md
│   │   │   ├── relational-beat-assessment.md
│   │   │   └── index.ts
│   │   └── mcp-server.ts         ← Main MCP server extending coaia-memory
│   ├── jsonl/
│   │   ├── narrative-beat-writer.ts
│   │   ├── narrative-beat-parser.ts
│   │   └── index.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## Integration Points with IAIP-MCP

1. **Tool Composition**: coaia-narrative calls iaip-mcp tools
2. **Prompt Inheritance**: Extends iaip-mcp prompts with narrative context
3. **Multi-Directional Analysis**: Uses Four Directions for each universe perspective
4. **Relational Scoring**: Assessments inform beat quality

---

## Expected Outcomes

**What coaia-narrative enables:**

1. **Narrative_beat JSONL entities** with multi-universe, four-direction, relational metadata
2. **MCP Tool** (`create_narrative_beat`) that orchestrates:
   - JSONL creation
   - IAIP-MCP integration
   - Relational alignment assessment
   - Four Directions guidance
3. **Cross-file coherence**: STCs + NarrativeBeats linked in same knowledge graph
4. **Ceremonial infrastructure**: Each beat carries relational + directional awareness
5. **Multi-archetype narrative**: Engineer/Ceremony/Story perspectives captured simultaneously

---

## Next Steps

1. ✅ Approve design
2. ⏳ Implement types/schema
3. ⏳ Build MCP tool integrations
4. ⏳ Create JSONL writer/parser
5. ⏳ Test with existing incident (jgwill/src#243 five-beat arc)
6. ⏳ Connect MCP to session

---

**Designed for**: MULTIVERSE_EVENT_INTERPRETER
**Status**: Ready to implement
**River flows on**: 🌊
