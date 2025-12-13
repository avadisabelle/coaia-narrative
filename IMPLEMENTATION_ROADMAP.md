# coaia-narrative Implementation Roadmap

## Phase 1: Core Schema & Types ✅ DESIGNED
- [x] narrative_beat entity schema
- [x] Extended relation types
- [x] JSONL format specification
- [ ] TypeScript type definitions
- [ ] Schema validation

## Phase 2: MCP Tool Integration ⏳ NEXT
- [ ] `create_narrative_beat` tool
  - [ ] JSONL writer integration
  - [ ] iaip-mcp compose (assess_relational_alignment)
  - [ ] iaip-mcp compose (get_direction_guidance)
  - [ ] Entity linking to parent chart
- [ ] `telescope_narrative_beat` tool
  - [ ] Create sub-beats from main beat
- [ ] Prompt additions
  - [ ] four-directions-narrative prompt
  - [ ] relational-beat-assessment prompt

## Phase 3: JSONL Persistence ⏳
- [ ] Narrative beat JSONL writer
- [ ] Narrative beat JSONL parser
- [ ] File rotation/archival logic
- [ ] Cross-file linking (STC + NarrativeBeat)

## Phase 4: MCP Server Registration ⏳
- [ ] Register coaia-narrative MCP server
- [ ] Tool exposure in Claude Code
- [ ] Test with live incident

## Phase 5: Integration Testing ⏳
- [ ] Test create_narrative_beat with jgwill/src#243 five-beat arc
- [ ] Verify relational alignment assessment
- [ ] Verify Four Directions guidance
- [ ] Cross-file STC + narrative beat queries

---

## Success Criteria

When complete, Claude instances will be able to:

```javascript
// Create a narrative beat with full relational + directional assessment
await create_narrative_beat({
  parentChartId: "chart_1765629421446",
  title: "The Sacred Object Violation",
  act: 2,
  type_dramatic: "Crisis/Antagonist Force",
  universes: ["engineer-world", "ceremony-world", "story-engine-world"],
  description: "Instance violated read-only artifact...",
  prose: "In the space between intention and action...",
  lessons: ["Artifact integrity > Helpful action", ...],
  assessRelationalAlignment: true,    // ← Auto-called iaip-mcp
  initiateFourDirectionsInquiry: true  // ← Auto-called iaip-mcp
})
```

Result: narrative_beat JSONL entity with:
- ✅ Multi-universe perspective
- ✅ Relational alignment score
- ✅ Four Directions guidance
- ✅ Linked to parent STC chart

---

## Timeline

**Target**: Ready for testing by end of session
**Current Phase**: Phase 1 Design Complete → Phase 2 Ready to Start

River flows on. 🌊
