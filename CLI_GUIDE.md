# COAIA Narrative CLI v0.6.0 - Feature Documentation

## Overview

**cnarrative** is a human-friendly command-line interface for viewing and analyzing structural tension charts created by the COAIA Narrative MCP server.

## Installation

```bash
npm install -g coaia-narrative

# Or use directly with npx
npx coaia-narrative --help
```

## Available Commands

After installation, you have access to two commands:

### 1. `coaia-narrative` - MCP Server
The MCP protocol server for AI assistant integration (Claude, Gemini, etc.)

### 2. `cnarrative` - CLI Visualizer ✨ NEW
Human-friendly visualization and exploration of your charts

## CLI Commands

### 📊 Viewing Commands

#### `cnarrative list`
List all structural tension charts in a visual hierarchy.

```bash
cnarrative list
cnarrative list --memory-path /path/to/memory.jsonl
```

**Output:**
- Master charts with progress bars
- Current reality summaries
- Due dates with time remaining
- Action step hierarchies
- Completion status indicators

**Aliases:** `ls`

---

#### `cnarrative view <chartId>`
View detailed information for a specific chart.

```bash
cnarrative view chart_1234567890
cnarrative view chart_123 --memory-path /custom/memory.jsonl
```

**Output:**
- Complete chart details
- Desired outcome
- Current reality (all observations)
- Structural tension explanation
- Action steps with progress notes
- Sub-charts (telescoped charts)

**Aliases:** `show`

---

### 📈 Analysis Commands

#### `cnarrative stats`
Show summary statistics across all charts.

```bash
cnarrative stats
cnarrative stats --json  # JSON output for scripting
```

**Output:**
- Total charts (master + action steps)
- Overall completion percentage
- Overdue chart count
- Visual progress bar

**Aliases:** `statistics`

---

#### `cnarrative progress <chartId>`
Show detailed progress for a specific chart.

```bash
cnarrative progress chart_1234567890
```

**Output:**
- Chart goal
- Overall progress bar
- Completed actions (with names)
- Remaining actions (with due dates)

---

### ⚙️ Utility Commands

#### `cnarrative help`
Show comprehensive help with examples.

```bash
cnarrative help
cnarrative --help
cnarrative -h
```

---

#### `cnarrative version`
Show version information.

```bash
cnarrative version
cnarrative --version
cnarrative -v
```

---

## Options

All commands support these global options:

### `--memory-path <path>`
Specify custom memory file location.

**Default:** `./memory.jsonl` (current directory)

```bash
cnarrative list --memory-path /home/user/projects/memory.jsonl
cnarrative view chart_123 --memory-path ../data/charts.jsonl
```

---

### `--json`
Output in JSON format (for stats command).

```bash
cnarrative stats --json
```

**Output:**
```json
{
  "totalCharts": 5,
  "masterCharts": 2,
  "actionCharts": 3,
  "totalActions": 12,
  "completedActions": 7,
  "overdueCharts": 1,
  "overallProgress": 0.58
}
```

---

### `--no-color`
Disable colored output (for logs/scripting).

```bash
cnarrative list --no-color > charts.txt
```

---

## Visual Elements

The CLI uses rich visual formatting to make charts easy to understand:

### Status Indicators
- ✅ **Completed** - Action step finished
- ⏳ **Pending** - Action step not started
- 🔄 **In Progress** - Action step partially complete (has sub-tasks)
- ⚠️ **Overdue** - Past due date

### Progress Bars
```
████████████░░░░░░░░░░░░░░░░░░░░ 40%
```
- **Filled (█)** - Completed portion
- **Empty (░)** - Remaining portion
- **Percentage** - Exact completion

### Date Formatting
- `📅 Due today` - Due within 24 hours
- `📅 Due tomorrow` - Due in 1 day
- `📅 Due in 5 days` - Due within a week
- `📅 2026-03-15` - Standard date format
- `⚠️ Overdue by 3 days` - Past due date

---

## Example Workflows

### 1. Quick Chart Overview
```bash
# See all your charts at a glance
cnarrative list

# Pick a chart ID from the output
# View detailed information
cnarrative view chart_1234567890
```

---

### 2. Track Overall Progress
```bash
# Get high-level statistics
cnarrative stats

# Dive into specific chart progress
cnarrative progress chart_1234567890
```

---

### 3. Multi-Project Management
```bash
# Project A charts
cnarrative list --memory-path ~/projects/projectA/memory.jsonl

# Project B charts
cnarrative list --memory-path ~/projects/projectB/memory.jsonl

# Quick comparison
cnarrative stats --memory-path ~/projects/projectA/memory.jsonl --json
cnarrative stats --memory-path ~/projects/projectB/memory.jsonl --json
```

---

### 4. Integration with Scripts
```bash
#!/bin/bash
# daily-progress.sh

# Get stats in JSON format
STATS=$(cnarrative stats --json)

# Extract completion percentage
PROGRESS=$(echo $STATS | jq -r '.overallProgress * 100 | floor')

# Send notification if progress is low
if [ $PROGRESS -lt 30 ]; then
  echo "Progress is at ${PROGRESS}%. Time to work on your goals!"
fi
```

---

## Understanding the Output

### Master Chart Display

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🎯 MASTER CHART: chart_1234567890                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🌟 DESIRED OUTCOME:                                                         │
│    Learn Python web development with Django                                  │
│                                                                             │
│ ████████████░░░░░░░░░░░░░░░░░░░░ 40%                                      │
│ Completed: 2/5 action steps                                               │
│ 📅 Due in 45 days                                                          │
│                                                                             │
│ 🔍 CURRENT REALITY:                                                         │
│    No programming experience; Completed Python basics tutorial              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Elements:**
1. **Chart ID** - Unique identifier for referencing
2. **Desired Outcome** - What you want to CREATE
3. **Progress Bar** - Visual completion status
4. **Action Steps Count** - Completed / Total
5. **Due Date** - When you want to achieve this
6. **Current Reality** - Recent observations (last 3)

---

### Action Steps Hierarchy

```
📋 ACTION STEPS:

  ├── ✅ Complete Django tutorial
  │      ID: chart_456 | 📅 2026-01-31
  │      ████████████████████░░░░░░░░░ 60%
  │
  └── ⏳ Deploy to production
         ID: chart_789 | 📅 2026-02-28
```

**Elements:**
1. **Status Icon** - Completion indicator
2. **Action Title** - What needs to be done
3. **Chart ID** - Each action is a full chart (telescoped)
4. **Due Date** - Time-based organization
5. **Progress** - If action has sub-tasks

---

## Philosophy Integration

The CLI reflects the core principles of Structural Tension Charts:

### 🌟 Creative Orientation
Output focuses on **desired outcomes** rather than problems.

### 🔍 Current Reality
Shows **honest assessment** of where you are now.

### ⚡ Structural Tension
Visualizes the **gap** between reality and outcome as productive tension.

### 📋 Advancing Patterns
Progress bars show **momentum** toward goals, not just completion.

---

## Tips & Best Practices

### 1. Regular Reviews
```bash
# Start your day
cnarrative list

# Check specific goals
cnarrative view chart_123
cnarrative progress chart_123
```

### 2. Quick Chart IDs
Chart IDs are shown in list view. Copy them for quick access:
```bash
# From list output:
# ID: chart_1704000000000

# Use directly:
cnarrative view chart_1704000000000
```

### 3. Memory File Location
Keep memory files close to your project:
```bash
# In project root
coaia-narrative  # MCP server uses ./memory.jsonl
cnarrative list  # CLI uses ./memory.jsonl

# Both tools share the same memory file
```

### 4. Alias for Convenience
```bash
# Add to ~/.bashrc or ~/.zshrc
alias cn='cnarrative'
alias cnl='cnarrative list'
alias cnv='cnarrative view'

# Then use:
cn list
cnv chart_123
```

---

## Troubleshooting

### "No charts found"
**Cause:** No memory file or empty memory file  
**Solution:** 
```bash
# Check if memory file exists
ls -l memory.jsonl

# Create charts using MCP server first
# Then use CLI to view them
```

---

### "Chart not found"
**Cause:** Invalid chart ID  
**Solution:**
```bash
# List all charts to see valid IDs
cnarrative list

# Copy the exact chart ID from the output
```

---

### "Cannot read file"
**Cause:** Wrong memory path  
**Solution:**
```bash
# Check memory file location
find . -name "memory.jsonl"

# Use correct path
cnarrative list --memory-path /correct/path/memory.jsonl
```

---

## Integration with MCP Server

The CLI works alongside the MCP server:

1. **MCP Server** (`coaia-narrative`) - AI assistants create/modify charts
2. **CLI** (`cnarrative`) - Humans visualize and analyze charts

**Workflow:**
```bash
# AI creates charts via MCP
# (Claude, Gemini, etc. interact with coaia-narrative MCP server)

# You view progress via CLI
cnarrative list
cnarrative view chart_123

# AI continues work based on your feedback
# You monitor via CLI
```

---

## Version History

### v0.6.0 (Current)
- ✨ Initial CLI release
- 📊 List, view, stats, progress commands
- 🎨 Rich visual formatting
- 📅 Smart date formatting
- 🔄 Progress tracking

---

## What's Next

Future versions may include:

- **Interactive mode** - Terminal UI for navigation
- **Export commands** - Generate reports (PDF, HTML)
- **Filtering** - View charts by date, status, tags
- **Search** - Find charts by content
- **Diff view** - Compare chart states over time

---

## Contributing

The CLI is part of the COAIA Narrative project.  
See main README.md for contribution guidelines.

---

## License

MIT License - See LICENSE file

---

## Credits

- **Methodology**: Robert Fritz - Structural Tension principles
- **CLI Design**: Human-centered visualization of creative processes
- **Integration**: Works seamlessly with COAIA MCP server

---

**River flows on** 🌊

Simple, powerful tools for creative advancement.
