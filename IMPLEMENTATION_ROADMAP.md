# coaia-narrative Implementation Roadmap

## Phase 1: Core Schema & Types ✅ COMPLETE
- [x] narrative_beat entity schema
- [x] Extended relation types
- [x] JSONL format specification
- [x] TypeScript type definitions
- [x] Schema validation

## Phase 2: MCP Tool Integration ✅ COMPLETE
- [x] `create_narrative_beat` tool
  - [x] JSONL writer integration
  - [x] iaip-mcp compose (assess_relational_alignment) - placeholder ready
  - [x] iaip-mcp compose (get_direction_guidance) - placeholder ready
  - [x] Entity linking to parent chart
- [x] `telescope_narrative_beat` tool
  - [x] Create sub-beats from main beat
- [x] `list_narrative_beats` tool
- [x] Prompt additions
  - [x] four-directions-narrative prompt
  - [x] relational-beat-assessment prompt

## Phase 3: JSONL Persistence ✅ COMPLETE
- [x] Narrative beat JSONL writer
- [x] Narrative beat JSONL parser
- [x] File rotation/archival logic
- [x] Cross-file linking (STC + NarrativeBeat)

## Phase 4: MCP Server Registration ✅ COMPLETE
- [x] Register coaia-narrative MCP server
- [x] Tool exposure in Claude Code
- [x] Test with live incident

## Phase 5: Integration Testing ✅ COMPLETE
- [x] Test create_narrative_beat with jgwill/src#243 five-beat arc
- [x] Verify relational alignment assessment (placeholder)
- [x] Verify Four Directions guidance (placeholder)
- [x] Cross-file STC + narrative beat queries

## Phase 6: Production Readiness ✅ COMPLETE
- [x] Comprehensive test suite
- [x] Demo script and documentation
- [x] Git commit with detailed description
- [x] Full coaia-memory compatibility verification
- [x] Tool grouping system integration
- [x] Extended LLM guidance documentation

---

## SUCCESS ACHIEVED ✅

Claude instances can now:

```javascript
// Create a narrative beat with full multi-universe perspective
await create_narrative_beat({
  parentChartId: "chart_1765629421446",
  title: "The Sacred Object Violation",
  act: 2,
  type_dramatic: "Crisis/Antagonist Force",
  universes: ["engineer-world", "ceremony-world", "story-engine-world"],
  description: "Instance violated read-only artifact...",
  prose: "In the space between intention and action...",
  lessons: ["Artifact integrity > Helpful action", ...],
  assessRelationalAlignment: true,    // ← Auto-called iaip-mcp (planned)
  initiateFourDirectionsInquiry: true  // ← Auto-called iaip-mcp (planned)
})
```

**Result**: narrative_beat JSONL entity with:
- ✅ Multi-universe perspective (engineer/ceremony/story)
- ✅ Relational alignment support (placeholder ready for iaip-mcp)
- ✅ Four Directions guidance support (placeholder ready for iaip-mcp)
- ✅ Linked to parent STC chart via 'documents' relation
- ✅ Full telescoping capability for detailed sub-narratives
- ✅ Complete integration with existing coaia-memory functionality

---

## Next Phase: IAIP-MCP Integration (Future)

**Target**: When iaip-mcp becomes available
- Implement actual assess_relational_alignment calls
- Implement actual get_direction_guidance calls  
- Add full ceremonial protocol compliance
- Enhanced relational scoring and validation

## Timeline

**✅ COMPLETED**: Full implementation ready for production use
**🔄 ONGOING**: Real-world testing and refinement
**🔮 FUTURE**: IAIP-MCP integration when available

River flows on. 🌊
