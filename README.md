# COAIA Memory

> MCP server for structural tension charts based on Robert Fritz's creative methodology

Extends [@modelcontextprotocol/server-memory](https://github.com/modelcontextprotocol/servers/tree/main/src/memory) with **structural tension charts** - a different orientation from problem-solving, focused on bringing desired outcomes into being through structural dynamics.

## Quick Start

```bash
npx coaia-memory --memory-path ./charts.jsonl
```

## Configuration

### Minimal Setup (STC Tools Only - Default)

```json
{
  "mcpServers": {
    "coaia-memory": {
      "command": "npx",
      "args": ["-y", "coaia-memory", "--memory-path", "/path/to/charts.jsonl"]
    }
  }
}
```

**Exposes 12 tools:** `list_active_charts`, `create_structural_tension_chart`, `add_action_step`, `remove_action_step`, `telescope_action_step`, `mark_action_complete`, `get_chart_progress`, `update_action_progress`, `update_current_reality`, `update_desired_outcome`, `update_action_step_title`, `init_llm_guidance`

### Full Setup (STC + Knowledge Graph Tools)

```json
{
  "mcpServers": {
    "coaia-memory": {
      "command": "npx",
      "args": ["-y", "coaia-memory", "--memory-path", "/path/to/charts.jsonl"],
      "env": {
        "COAIA_TOOLS": "STC_TOOLS,KG_TOOLS,init_llm_guidance"
      }
    }
  }
}
```

**Adds 9 KG tools:** `create_entities`, `create_relations`, `add_observations`, `delete_entities`, `delete_observations`, `delete_relations`, `search_nodes`, `open_nodes`, `read_graph`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `COAIA_TOOLS` | Tool groups/names to enable (comma/space separated) | `STC_TOOLS,init_llm_guidance` |
| `COAIA_DISABLED_TOOLS` | Tools to exclude from enabled set | - |

**Tool Groups:**
- `STC_TOOLS` - Structural tension chart tools (11)
- `KG_TOOLS` - Knowledge graph tools (9)
- `CORE_TOOLS` - Essential tools only (4): `list_active_charts`, `create_structural_tension_chart`, `add_action_step`, `mark_action_complete`

## Core Concepts

### Structural Tension
```
┌─────────────────┐                    ┌─────────────────┐
│ Current Reality │ ══ TENSION ══════> │ Desired Outcome │
│ (where you are) │                    │ (what to create)│
└─────────────────┘                    └─────────────────┘
         │                                      ▲
         │       Strategic Secondary Choices    │
         └──────────────────────────────────────┘
        (action steps understood in context of tension)
```

- **Desired Outcome**: What you want to CREATE (not fix/solve). Specific, quantified where possible, avoiding comparative terms (more, better, less).
- **Current Reality**: Honest factual assessment - objective facts only, no readiness assumptions ("ready to begin" destroys tension).
- **Structural Tension**: The dynamic force between current reality and desired outcome that naturally seeks resolution. NOT a gap to fill, but a generative force.

### Action Steps: NOT a To-Do List

**Critical distinction**: Action steps are **strategic secondary choices** that support the primary goal, NOT tasks to check off.

**They are:**
- Understood in the context of structural tension
- Related to each other as part of an overview
- Strategic actions designed to enable creating the goal
- Answers to: "If we took these steps, would we achieve this result?"

**Three types of actions (use appropriately):**
1. **Overview actions** - Strategic steps early in process (what we put on charts)
2. **Experimental actions** - Learning, exploring, "sketches before the painting"
3. **Refinement actions** - Polishing near completion (too early = stifled energy)

**Test question**: "If we took these steps, would we achieve this result?" If No → add more steps. If Yes → done.

### Goal Refinement Principles (Robert Fritz)

| Principle | Wrong | Right |
|-----------|-------|-------|
| **Quantify** | "Increased business" | "5 new business clients" |
| **No comparatives** | "Better health" | "Very good health" |
| **Create, not solve** | "Overcome weight problem" | "I weigh 150 pounds" |
| **Result, not process** | "Run 4 miles daily" | "Well-toned, healthy body" |
| **Specific, not vague** | "Improve my skills" | "Mastery of Photoshop" |

### Creator Moment of Truth (Review Process)

When assessing progress, use this four-step process:

1. **Acknowledge**: What was expected vs. what was delivered? (facts only)
2. **Analyze**: How did it happen? (step-by-step, not blame)
3. **Plan**: How will I do it differently next time?
4. **Feedback**: How will I track the changes?

This transforms discrepancies into learning opportunities, not failures.

## Usage Examples

**Create a chart:**
```javascript
{
  "desiredOutcome": "Launch personal website",
  "currentReality": "Have domain, no design or content yet",
  "dueDate": "2025-03-01T00:00:00Z",
  "actionSteps": ["Design homepage", "Write about page", "Deploy to hosting"]
}
```

**Add action step to existing chart:**
```javascript
{
  "parentChartId": "chart_1234567890",
  "actionStepTitle": "Set up CI/CD pipeline",
  "currentReality": "Manual deployment only, no automation experience"
}
```

**Mark action complete:**
```javascript
{ "actionStepName": "chart_1234567890_desired_outcome" }
```

## Development

```bash
git clone https://github.com/jgwill/coaia-memory
cd coaia-memory
npm install
npm run build
```

## Credits

- **Author**: J.Guillaume D.-Isabelle ([@jgwill](https://github.com/jgwill))
- **Methodology**: Robert Fritz - [Structural Tension](https://robertfritz.com)
- **Foundation**: [@modelcontextprotocol/server-memory](https://github.com/modelcontextprotocol/servers)
- **License**: MIT
