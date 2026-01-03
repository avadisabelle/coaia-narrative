# COAIA Narrative - Quick Reference Card

## Installation

```bash
npm install -g coaia-narrative
```

---

## Two Tools, Two Purposes

| Tool | Purpose | Who Uses It |
|------|---------|-------------|
| `coaia-narrative` | MCP Server | AI Assistants (Claude, Gemini) |
| `cnarrative` | CLI Visualizer | Humans 🖥️ |

---

## CLI Commands (Humans)

### Essential 4 Commands

```bash
cnarrative list                    # See all charts
cnarrative view <chartId>          # Chart details
cnarrative stats                   # Summary stats
cnarrative progress <chartId>      # Progress report
```

### Utilities

```bash
cnarrative help                    # Full help
cnarrative version                 # Version info
```

---

## Options

```bash
--memory-path <path>               # Custom memory file
--json                             # JSON output (stats)
--no-color                         # Disable colors
```

---

## Example Workflows

### Morning Review
```bash
cnarrative list
cnarrative progress chart_123
```

### Check Overall Health
```bash
cnarrative stats
```

### Deep Dive
```bash
cnarrative view chart_123
```

### Multi-Project
```bash
cnarrative list --memory-path ~/projectA/memory.jsonl
cnarrative list --memory-path ~/projectB/memory.jsonl
```

### Scripting
```bash
cnarrative stats --json | jq '.overallProgress'
```

---

## Visual Elements

### Status
- ✅ Completed
- ⏳ Pending
- 🔄 In Progress
- ⚠️ Overdue

### Progress Bar
```
████████████░░░░░░░░░░░░░░░░ 40%
```

### Dates
- 📅 Due today
- 📅 Due in 5 days
- ⚠️ Overdue by 3 days

---

## File Structure

```
your-project/
├── memory.jsonl           ← Shared by both tools
├── package.json
└── ...
```

**Both tools use the same memory file!**

---

## MCP Server (AI Assistants)

### Claude Desktop Config
```json
{
  "mcpServers": {
    "coaia-narrative": {
      "command": "npx",
      "args": ["-y", "coaia-narrative", "--memory-path", "./memory.jsonl"],
      "env": {
        "COAIA_TOOLS": "STC_TOOLS,NARRATIVE_TOOLS"
      }
    }
  }
}
```

### Common MCP Tools
- `create_structural_tension_chart`
- `add_action_step`
- `mark_action_complete`
- `list_active_charts`
- `update_desired_outcome`

---

## Philosophy

### 🌟 Desired Outcome
What you want to CREATE (not fix)

### 🔍 Current Reality  
Honest assessment of where you are NOW

### ⚡ Structural Tension
Gap creates natural momentum

### 📋 Action Steps
Strategic intermediary results

---

## Getting Help

```bash
cnarrative help                    # CLI help
```

**Full Documentation:**
- CLI_GUIDE.md - Complete CLI reference
- README.md - Full project documentation
- CHANGELOG.md - Version history

---

## Aliases (Optional)

Add to `~/.bashrc` or `~/.zshrc`:

```bash
alias cn='cnarrative'
alias cnl='cnarrative list'
alias cnv='cnarrative view'
alias cns='cnarrative stats'
```

Then use:
```bash
cn list
cnv chart_123
cns
```

---

## Troubleshooting

### "No charts found"
```bash
# Create charts with MCP server first
# Then visualize with CLI
```

### "Chart not found"
```bash
# Get valid chart IDs
cnarrative list
```

### Wrong path
```bash
# Find memory file
find . -name "memory.jsonl"

# Use correct path
cnarrative list --memory-path /path/to/memory.jsonl
```

---

## Quick Start

```bash
# 1. Install
npm install -g coaia-narrative

# 2. AI creates charts (via MCP)
# (Claude/Gemini uses coaia-narrative server)

# 3. View charts (as human)
cnarrative list
cnarrative view chart_123

# 4. Track progress
cnarrative stats
```

---

**Version:** 0.6.0  
**License:** MIT  
**Credits:** Robert Fritz (methodology)

**River flows on** 🌊
