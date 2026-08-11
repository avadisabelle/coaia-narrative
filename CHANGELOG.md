# Changelog

All notable changes to COAIA Memory will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.16.1] - 2026-08-11

### 🗣️ An argument this package does not know no longer vanishes into a success

A seat telescoped a chart and passed `actionSteps` — the name its sibling
`create_structural_tension_chart` uses for exactly that concept. The real parameter on
`telescope_action_step` is `initialActionSteps`. The call returned success, the child chart was
born with **zero** steps, and `get_chart_progress` then read `0/0`. Nothing said a word, so the
next several turns were spent reporting a working package as broken — because a success that did
less than it was asked is indistinguishable from a success that did everything.

Three changes, all additive:

- **`actionSteps` is accepted as an alias for `initialActionSteps`.** Two sibling tools naming
  one concept differently is the trap; the alias closes it without renaming anything.
- **Unknown arguments are named in the result.** They are still not fatal — they never were, and
  making them so would break callers — but a call that ignored something now says so:
  `⚠️ Ignored unrecognised argument(s): …`. Applied to `create_structural_tension_chart`,
  `telescope_action_step` and `add_action_step`, the three write paths where a dropped argument
  costs a record.
- **`validate()` reports every problem at once.** It returned on the first one, so two missing
  required fields meant learning the schema across three exchanges. That drip is what makes a
  correctly-behaving tool read as broken.

Also fixed: `elementsOfPerformance` was read by the `create_structural_tension_chart` handler but
absent from its validation schema — it would have been reported as unrecognised while being
honoured.

`test-silent-argument-drop.js` holds all of it, and runs in `npm test`.

## [0.15.0] - 2026-07-31

### 🛡️ A malformed call no longer becomes chart content

A call whose argument tags did not parse did not fail — the raw call text arrived as the value
and was stored verbatim as the observation body. Seven observations in one live store carried
tails like `…landed on day-04's address.</currentReality>` followed by
`<parameter name="dueDate">2026-07-31T12:00:00Z`: a closing tag and a parameter block, persisted
as if they were prose, and rendered ever since by the visualizer, `list_active_charts`, the
chronicle surface, and any agent reading the chart to decide what to do next.

The check now lives at the write boundary, because anything that reaches the JSONL is already in
every reader's render.

#### Added

- **`src/argument-hygiene.ts`** — refuses a text body carrying plainly unparsed call syntax:
  tool-call machinery (`<parameter …>`, `<invoke …>`, `<function_calls>`, in any namespace), and
  bare closing tags for argument names. The argument vocabulary is gathered from the tool schemas
  themselves, so it cannot drift from the tools. The report names the **earliest** fragment — the
  point where prose ended and call text began — so the caller sees where to look.
- **`update_chart_due_date`** — the date a chart is due can now be changed after creation.
  `update_desired_outcome` and `update_current_reality` could already reach both halves of the
  tension; the date could only be moved by hand-editing a JSONL that several MCP instances write
  with no lock, which is how a hand-edit becomes a lost write. The chart and its desired outcome
  move together, the change is recorded as an observation on the chart, and open action steps keep
  their dates unless `redistributeActionSteps` is asked for — the count still falling after the
  new date is reported either way.
- **`scripts/scrub-unparsed-call-syntax.mjs`** — finds observations already carrying leaked call
  text across JSONL stores. Reports by default and exits non-zero; `--fix` truncates each body at
  the point the prose ended and drops what is left empty, writing a timestamped backup first. It
  imports the server's own detector, so the report and the refusal cannot disagree.

#### Changed

- `handleToolCall` scans every argument before any tool runs and returns `isError` naming the
  argument path and the fragment, so the caller can retry.
- `KnowledgeGraphManager` refuses the same bodies at `createEntities`, `addObservations`,
  `createStructuralTensionChart`, `updateCurrentReality`, `updateActionProgress`,
  `updateDesiredOutcome`, and `performMmotEvaluation` — before the graph is loaded, so a refusal
  leaves the store untouched and a batch with one bad body lands none of it. Callers that reach
  the manager directly, such as the CLI, are covered by the same rule.
- A malformed call is diagnosed before its content is judged: no creative-orientation coaching on
  a fragment of XML.

Ordinary angle brackets still write: `<div>`, `a < b`, `<rootDir>` are prose. Prose that quotes
tool-call syntax while describing this defect is refused along with the real thing — a deliberate
trade, since a refusal is loud and recoverable while a silent write is neither.

## [0.14.1] - 2026-07-29

### 🩹 A chart's own work is visible again

`list_active_charts` and `get_chart_progress` each saw one half of a chart's structure and
declared neither. A chart holds its work in two shapes — `action_step` entities on the chart
itself, and telescoped child charts — and each tool counted only one shape.

- **`list_active_charts`** built its tree from charts alone (masters at `level === 0`, children
  at `level > 0`). `action_step` entities never entered the render, so a master with no child
  chart printed `(No action steps yet)` however many steps it held. Measured on a 20-chart
  store: 45 action steps across 9 charts were absent from the output.
- **`get_chart_progress`** counted only `action_step` entities, so a chart whose work was
  telescoped into sub-charts reported `0/0` while holding real results. Three charts in that
  same store reported `0/0` while carrying child charts.

#### Changed

- `listActiveCharts()` returns each chart's own `actionSteps` and its `parentActionStep`.
- `getChartProgress()` counts telescoped child charts as units of work alongside `action_step`
  entities; a child chart is complete when its `desired_outcome` is. A child telescoped out of
  one of the chart's own steps is counted **through that step**, never twice.
- The renderer draws both shapes, marks completed steps ✅, labels child charts
  `(Telescoped Chart)` rather than `(Action Step)` — the two were indistinguishable — and shows
  a telescoped step once, on the chart line, with `← <originating step>` provenance.

Progress figures move as a result. On the reference store one master went from a reported 38%
to 33% — not a regression: the denominator finally includes work that was always there.

## [0.13.4] - 2026-05-26

### ✨ Asterion: Deep Research Foundations & Session Lineage Metadata

**Issues:** #39, #40 | **Parent:** jgwill/coaia-agent#27

Added support for tracking research packet context and conversation branching metadata to enable Atlas Chronicle workflows and session lineage reconstruction.

#### New Metadata Types

- **`metadata.foundation`** - Deep Research Foundations metadata for tracking:
  - Research packet roots and types (e.g., `atlas-chronicle`)
  - GitHub issue references (parent, baseline, inquiry, protocol, schema, visualizer)
  - Expected vs. produced artifacts
  - Evaluation status: `expected | delegated | produced | evaluated`
  - Privacy classification: `public-safe | private | mixed`
  - Publication workflow status: `planned | draft | reviewed | published`
  - Associated commit handles

- **`metadata.sessionLineage`** - Hermes session lineage tracking:
  - Platform identification (telegram, hermes, slack)
  - Parent chart and source beat references
  - Original and branch session IDs
  - Branch index and copied message count
  - Branch purpose and related issues
  - Handoff state: `requirements-created | implementation-ready | returned-to-parent`

#### Schema Updates

- Added `DeepResearchFoundationMetadata` interface to TypeScript types
- Added `HermesSessionLineageMetadata` interface to TypeScript types
- Updated `EntityMetadata` with optional `foundation` and `sessionLineage` fields
- Extended JSON Schema definitions in `schema/data-model/entity.json`
- Extended complete schema in `schema/data-model-complete.json`

#### Backward Compatibility

- All new fields are optional - existing charts continue to work unchanged
- JSONL preservation logic automatically handles new metadata (immutable like `github`)
- No migration required - new metadata populated only on new/updated entities
- Test coverage confirms preservation across read/write cycles

#### Testing

- Added comprehensive test fixtures for both metadata types
- 17 new test assertions verify nested objects, arrays, and enum values survive JSONL round-trips
- All 30 metadata preservation tests pass (13 legacy + 17 new Asterion tests)

#### Use Cases

This enhancement enables:
- Atlas to delegate research packets with clear artifact expectations
- Comparing expected vs. produced research deliverables
- Tracking evaluation and publication status for research work
- Reconstructing Hermes conversation branch maps from metadata
- Parent-child session traceability without parsing transcripts
- Implementation readiness tracking across branch handoffs

## [0.6.0] - 2026-01-03

### ✨ Major Feature: CLI Visualizer

- **NEW: `cnarrative` Command** - Human-friendly CLI for chart visualization
  - `cnarrative list` - Visual hierarchy of all charts with progress bars
  - `cnarrative view <chartId>` - Detailed chart information
  - `cnarrative stats` - Summary statistics (supports --json output)
  - `cnarrative progress <chartId>` - Detailed progress report
  - Rich visual formatting with Unicode box drawing
  - Smart date formatting (due today, overdue, days remaining)
  - Progress bars for completion tracking
  - Word wrapping for long text

### 📚 Documentation

- Added comprehensive CLI_GUIDE.md
- Updated README with CLI quick reference
- Added example workflows and troubleshooting

### 🎨 Visual Elements

- Status indicators: ✅ ⏳ 🔄 ⚠️
- Progress bars: ████████░░░░░░░░ 40%
- Smart date formatting with emoji indicators
- Hierarchical chart display
- Current reality summaries

### 🔧 Technical

- Separate CLI entry point (cli.ts)
- Shared memory loading utilities
- Added to package.json bin as `cnarrative`
- TypeScript compilation for CLI
- Zero additional dependencies (uses existing minimist)

## [2.4.0] - 2026-01-03

### 🔧 Breaking Changes

- **REMOVED `update_action_step_title`** - This tool was redundant and fundamentally broken. Since action steps are implemented as telescoped charts with `desired_outcome` entities, use `update_desired_outcome` with the action step's chart ID instead.

### ✨ Enhancements

- **Enhanced `update_desired_outcome`** - Now explicitly documented to work for BOTH master charts AND action steps. Simply provide the chart ID (whether master chart or action step chart).
- **Improved Error Clarity** - Tool descriptions now clearly explain that action steps are charts, not separate entity types.

### 📚 Migration Guide

**Before:**
```javascript
update_action_step_title("chart_123_desired_outcome", "New Title") // ❌ BROKEN
```

**After:**
```javascript
update_desired_outcome("chart_456", "New Title") // ✅ Works for action step charts
update_desired_outcome("chart_123", "New Title") // ✅ Works for master charts too
```

**How to find the chart ID for an action step:**
1. Run `list_active_charts` to see hierarchy
2. Each action step shows its chart ID (e.g., "ID: chart_456")
3. Use that chart ID with `update_desired_outcome`

## [2.3.0] - 2025-08-31

### 🚀 LLM-Intelligent Enhancement

**Key Features**:
- 🌊 Comprehensive LLM Guidance System
  - Build-time consolidated methodology documentation
  - `init_llm_guidance` tool with multiple formats (full, quick, save_directive)
  - Intelligent error handling with educational responses

- 🧠 Enhanced AI Interaction
  - Creative orientation validation
  - Delayed resolution principle enforcement
  - Problem-solving language detection
  - Comprehensive teaching messages with Robert Fritz's principles

- 📘 Documentation Improvements
  - Methodology warnings in tool descriptions
  - Intelligent error messages guiding LLMs
  - Self-documenting MCP server

### Technical Enhancements
- Updated server description to highlight LLM guidance
- Improved validation with educational error responses
- Added context extraction for current reality assessment

## [2.2.8] - 2025-08-29

### 🐛 Bug Fixes

- Resolved TypeScript type issue in `telescopeActionStepWithContext` method
- Added null coalescing to ensure proper type handling when extracting current reality from context

## [2.2.3] - 2025-08-25

### ✨ Enhancements

- **Progress-Based Reality Updates (v2.1.0 Enhancement)**
  - Added `update_action_progress` tool: Allows tracking progress on an action step without marking it complete, optionally updating current reality.
  - Added `update_current_reality` tool: Enables adding external observations directly to a chart's current reality.
  - Enhanced philosophical alignment: Supports "journey-aware" tracking, recognizing that reality changes throughout the creative process, not just upon completion.

- **Expanded Chart Management Tools**
  - Added `add_action_step` tool: Allows adding a strategic action step to an existing chart, which automatically creates a telescoped chart.
  - Added `remove_action_step` tool: Enables removal of an action step (and its associated telescoped chart).
  - Added `update_desired_outcome` tool: Provides a simple way to modify a chart's main goal.
  - Added `update_action_step_title` tool: Allows simple modification of an action step's title.

- **Improved User Experience**
  - The `list_active_charts` tool now provides a clear, hierarchical ASCII tree view of all active charts, enhancing navigation and overview.
  - Updated tool descriptions for traditional knowledge graph operations (`create_entities`, `add_observations`, `read_graph`, `open_nodes`) to guide users towards the new, more appropriate structural tension chart tools.

### 🐛 Bug Fixes

- Minor internal adjustments for version consistency and build stability.

## [2.0.0-rc.1] - 2025-08-14

### 🎯 Major Release Candidate - Structural Tension Charts

This release candidate represents a complete evolution from traditional knowledge graphs to creative-oriented memory systems based on Robert Fritz's structural tension methodology.

#### Added
- **Structural Tension Chart Architecture**
  - `structural_tension_chart` entity type for organizing creative processes
  - `desired_outcome` entities for clear, specific end results
  - `current_reality` entities for honest assessment of current state
  - `action_step` entities for strategic secondary actions with due dates
  - Automatic due date distribution between current time and chart deadline

- **Core Chart Management Tools**
  - `create_structural_tension_chart` - Create charts with outcome, reality, and action steps
  - `get_chart_progress` - Monitor advancement with completion percentages and next actions
  - `list_active_charts` - Overview of all charts sorted by level and due date
  - `mark_action_complete` - Complete actions with automatic current reality updates

- **Telescoping Functionality**
  - `telescope_action_step` - Break down action steps into detailed sub-charts
  - Proper due date inheritance from parent action steps
  - Hierarchical chart levels with parent-child relationship tracking
  - Maintains structural tension at every telescoping level

- **Advancing Pattern Support**
  - Completed actions automatically flow into current reality
  - Each completion changes structural dynamic and advances system toward desired outcome
  - Success builds momentum for continued advancement
  - Prevention of oscillating patterns through proper structural design

- **Enhanced Metadata System**
  - Due dates, completion status, and timestamps for all entities
  - Chart hierarchy tracking with parent chart and action step references
  - Creative phase support (germination, assimilation, completion)
  - Level tracking for telescoped chart organization

- **Creative Relations Framework**
  - `creates_tension_with` - Fundamental structural tension between reality and outcome
  - `advances_toward` - Action steps that advance system toward desired outcome
  - `telescopes_into` - Hierarchical chart relationships
  - `flows_into` - Completed actions updating current reality
  - `contains` - Chart container relationships

#### Enhanced
- **Knowledge Graph Foundation**
  - Extended existing entity/relation/observation architecture
  - Maintained full backward compatibility with traditional knowledge graph operations
  - Added metadata support to base Entity and Relation interfaces
  - Preserved all existing MCP tool functionality

- **Natural Language Interface**
  - Creative-oriented language patterns documented for AI assistant interaction
  - Conversation flow examples for chart creation, telescoping, and progress tracking
  - Anti-pattern language detection guidelines (avoiding problem-solving bias)
  - Educational guidance frameworks for teaching structural tension principles

#### Technical Improvements
- **TypeScript Implementation**
  - Strongly typed interfaces for all structural tension components
  - Compile-time validation of chart structure integrity
  - Enhanced error handling for chart operations
  - Modular architecture supporting extensibility

- **MCP Server Architecture**
  - Updated server name from "mcp-knowledge-graph" to "coaia-memory"
  - Version bump to 2.0.0 reflecting major functionality addition
  - All tools exposed through standard MCP interface
  - Maintained compatibility with Claude Code CLI and other MCP clients

- **Data Persistence**
  - JSONL format preservation for knowledge graph data
  - Atomic operations for chart creation and updates
  - Transactional integrity for telescoping operations
  - Efficient storage of hierarchical chart relationships

#### Documentation
- **Comprehensive Usage Examples**
  - Natural language interaction patterns for each tool
  - Chart creation scenarios with realistic desired outcomes
  - Telescoping examples showing due date inheritance
  - Progress tracking demonstrations

- **Creative Orientation Guidelines**
  - Focus on creation vs problem-solving language
  - Structural tension awareness principles
  - Advancing pattern recognition techniques
  - Anti-pattern detection and correction guidance

#### Testing & Validation
- **Test Environment Setup**
  - Pre-configured MCP client setup for easy testing
  - Sample structural tension charts with realistic data
  - Complete testing scenarios and usage instructions
  - Validation of core functionality with real user interactions

- **Real-World Validation**
  - Guitar learning chart creation and telescoping
  - Action completion tracking and reality updates
  - Cross-chart relationship management
  - Knowledge graph integration alongside structural tension charts

#### Changed
- **Package Identity**
  - Name: `mcp-knowledge-graph-mia` → `coaia-memory`
  - Description: Enhanced to reflect structural tension chart capabilities
  - Version: 1.0.3 → 2.0.0-rc.1
  - Author: Updated to J.Guillaume D.-Isabelle with Shane Holloman as contributor
  - Added Robert Fritz methodology attribution

- **Server Configuration**
  - Server name: "mcp-knowledge-graph" → "coaia-memory"
  - Updated console output to reflect creative orientation
  - Enhanced error messages with structural tension awareness

#### Removed
- None - Full backward compatibility maintained

### 🔧 Technical Details

#### Dependencies
- Maintained existing MCP SDK dependencies
- No breaking changes to existing API surface
- TypeScript configuration optimized for ES2020 target

#### Breaking Changes
- None for existing knowledge graph operations
- New tools added without affecting existing functionality
- Configuration changes only affect server name and version

#### Migration Guide
- Existing knowledge graph data fully compatible
- Update MCP server name in configuration: `mcp-knowledge-graph` → `coaia-memory`
- Add new structural tension tools to autoapprove list if desired
- No data migration required

### 🎉 Release Candidate Status

This RC demonstrates complete structural tension chart functionality validated through real-world testing. The system successfully:
- Creates meaningful structural tension charts
- Performs telescoping with proper due date inheritance  
- Tracks progress with automatic current reality updates
- Maintains advancing patterns through completion cycles
- Integrates seamlessly with traditional knowledge graph operations

**Ready for broader testing and feedback collection.**

**Next Milestone**: Guided chart creation system with quality validation and anti-pattern detection.

---

## [1.0.3] - 2025-08-08 (Pre-COAIA)

### Previous Version Notes
- Original MCP knowledge graph implementation by Shane Holloman
- Basic entity, relation, and observation management
- Standard MCP tool interface
- JSONL data persistence

*This version served as the foundation for COAIA Memory development.*
## [2.3.0] - 2026-02-13

### Schema Reorganization - Major Enhancement

#### Added
- **Hierarchical schema organization** with clear categorization
  - `schema/data-model/` - Core data structures (Entity, Relation, KnowledgeGraph, Storage Format)
  - `schema/tools/stc/` - Structural Tension Chart tools (12 tools)
  - `schema/tools/narrative/` - Narrative Beat tools (3 tools)
  - `schema/tools/knowledge-graph/` - Traditional KG tools (9 tools)
  - `schema/tools/system/` - System tools (1 tool)
  - `schema/examples/` - Usage examples and patterns

- **Consolidated data model schemas**
  - `schema/data-model-complete.json` - All data schemas in single JSON file
  - `schema/data-model-complete.yaml` - All data schemas in single YAML file

- **Central schema registry**
  - `schema/index.json` - Maps all tools, schemas, and categories
  - `schema/index.yaml` - YAML version of registry

- **Comprehensive documentation** (8 README files, 66k+ chars)
  - `schema/README.md` - Main navigation guide
  - `schema/data-model/README.md` - Complete data model documentation
  - `schema/tools/README.md` - Tools overview
  - `schema/tools/stc/README.md` - STC tools detailed guide
  - `schema/tools/narrative/README.md` - Narrative tools guide
  - `schema/tools/knowledge-graph/README.md` - KG tools guide with fork attribution
  - `schema/tools/system/README.md` - System tools guide
  - `schema/examples/README.md` - Examples documentation

- **Dual format support**
  - All schemas available in both JSON and YAML formats
  - Automatic conversion utility (`schema/convert-to-yaml.js`)

#### Changed
- Reorganized all tool schemas from flat structure to categorized directories
- Moved 24 tool schemas (48 files including YAML) to appropriate subdirectories
- Updated main README.md with Schema Documentation section
- Updated CLAUDE.md with Schema Documentation section

#### Fixed
- Schema organization now clearly shows what data and tools COAIA offers
- External applications can easily discover and implement COAIA schemas
- Clear attribution to Shane Holloman's mcp-knowledge-graph fork in KG tools README

#### For External Developers
- **Quick start**: Use `schema/data-model-complete.json` for all data schemas
- **Discovery**: Check `schema/index.json` for complete tool/schema registry
- **Navigation**: Start with `schema/README.md` for organized access
- **Format choice**: All schemas in both JSON and YAML

