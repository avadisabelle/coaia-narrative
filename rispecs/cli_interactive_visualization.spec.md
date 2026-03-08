# CLI Interactive Visualization & Export Component
## RISE Specification for Human-Intuitive Interface

**Component Purpose**: Provide a visual, interactive command-line interface for human users to manage structural tension charts, coupled with robust Markdown export capabilities for documentation and sharing.

---

## 🎯 What This Component Enables Users to Create

- **Intuitive Chart Management**: View and modify charts through a formatted terminal interface.
- **Progress Visibility**: High-level and detailed progress visualization using progress bars and status icons.
- **Portable Documentation**: Export charts and statistics to standardized Markdown files.
- **Interactive Workflows**: Step-by-step interactive modes for adding actions and performing evaluations.
- **Context-Aware Navigation**: Get and set current chart contexts for faster command execution.

---

## 📋 Natural Language Describing Functional Aspects

### Interactive CLI Experience

**User Lists Charts**:
```bash
cnarrative list
```
**System Displays**:
- A hierarchical tree of all master and telescoped charts.
- Progress bars for each chart.
- Due dates and overdue warnings.
- Status indicators (✅, 🔄, ⏳).

**User Views Specific Chart**:
```bash
cnarrative view chart_123
```
**System Displays**:
- Detailed breakdown of Desired Outcome and Current Reality.
- Action steps with status and due dates.
- Narrative beats history.
- MMOT evaluation history.

**User Exports to Markdown**:
```bash
cnarrative export chart_123 --output report.md
```
**System Generates**:
- A clean, professional Markdown document with all chart details.
- Properly escaped characters and formatted tables.
- Progress bars and status icons preserved in text.

---

## 🔧 Implementation Requirements

### CLI Configuration & Priority
```typescript
interface Config {
  memoryPath: string;      // CLI flag > ENV (COAIAN_MF) > default
  currentChart: string;    // CLI flag > ENV (COAIAN_CC) > default
  jsonOutput: boolean;     // --json flag
  noColor: boolean;        // --no-color flag
  interactive: boolean;    // --interactive or -I flag
}
```

### Command Registry
| Command | Alias | Description |
|---|---|---|
| `list` | `ls` | List all charts in hierarchy |
| `view` | `v` | View detailed chart info |
| `current` | `cur` | Get/Set current chart context |
| `update` | `up` | Update chart properties |
| `add-action` | `aa` | Interactive action step addition |
| `add-obs` | `ao` | Add observation to current reality |
| `complete` | `done` | Mark action as complete |
| `export` | `exp` | Export single chart to MD |
| `export-all` | `exp-all` | Export all charts to MD |
| `stats` | `st` | Show summary statistics |

### Markdown Export Logic
```typescript
interface MarkdownOptions {
  includeMetadata: boolean;
  includeObservations: boolean;
  includeToc: boolean;
}

// Key functions to implement:
// exportChartToMarkdown(chartId, graph, options)
// exportAllChartsToMarkdown(graph, options)
// exportProgressToMarkdown(chartId, graph)
// exportStatsToMarkdown(graph)
```

---

## 🎯 Creative Advancement Scenarios

### Scenario: Monthly Progress Review
1. User runs `cnarrative stats` to see overall portfolio health.
2. User identifies a chart needing attention via `cnarrative list`.
3. User performs a deep dive with `cnarrative view`.
4. User runs `cnarrative mmot chart_id -I` to interactively evaluate progress.
5. User exports the updated state via `cnarrative export-progress chart_id` to share with a collaborator.

---

## ✅ Quality Criteria

### Visual Clarity
- ✅ Use of ANSI box-drawing characters for structure.
- ✅ Clear distinction between master and telescoped charts.
- ✅ Color-coded status and overdue indicators (if enabled).

### Export Integrity
- ✅ All Markdown characters properly escaped.
- ✅ Hierarchy preserved via heading levels.
- ✅ Metadata included or excluded based on user preference.

### UX Flow
- ✅ Commands support both ID and current context.
- ✅ Informative error messages with usage hints.
- ✅ Priority-based configuration loading.

---

## 🔗 Related Components

- **MCP Tool Interface**: CLI acts as a human-friendly wrapper around these tools.
- **Storage Knowledge Graph**: CLI reads from and writes to the JSONL memory file.
- **Advancing Pattern Tracking**: CLI visualizes the momentum tracked here.

---

**This specification enables rebuilding a human-centric interface that makes the structural tension methodology accessible and visually resonant.**
