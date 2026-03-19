# coaia-github — Structural Tension Charts on GitHub Projects

> Bridge local JSONL charts to GitHub Projects custom fields as a native STC surface.

## Creative Intent

**Desired Outcome**: Agents working through the PDE → STC workflow have their charts automatically reflected in GitHub Projects — desired outcome as `goal`, current reality as `current_reality`, action steps as sub-issues, structural thinking question as `question`, lifecycle as `Status`.

**Current Reality**: This mapping exists only as manual GraphQL mutations performed by agents who know the Amun project field IDs. No tooling automates the bridge. COAIA charts live in local JSONL; GitHub Projects live in the API. The two don't talk.

**Structural Tension**: Local charts and GitHub Projects are parallel representations of the same creative structure with no sync mechanism.

## The Workflow coaia-github Would Automate

```
mcp-pde (decompose)
    ↓
 discussion with user (clarify, refine)
    ↓
coaia-pde (create_stc_from_pde → local JSONL chart)
    ↓
coaia-github (sync chart → GitHub issue + project fields)
    ↓
 ongoing: action step completion → sub-issue closed → chart updated
```

## Field Mapping

| STC (JSONL) | GitHub Projects (Amun) | Type |
|-------------|----------------------|------|
| `desired_outcome` | `goal` | TEXT |
| `current_reality` | `current_reality` | TEXT |
| structural thinking question | `question` | TEXT |
| chart lifecycle | `Status` | SINGLE_SELECT |
| `action_steps[]` | sub-issues | ISSUE[] |
| session reference | `session_id` | TEXT |
| due date | `due_date` | DATE |

## Data Model Considerations

Extends the existing coaia-narrative entity/relation schema with:

- **`sync_target`** on `structural_tension_chart` entity — points to `{owner, repo, issue_number, project_id, item_id}`
- **`github_ref`** on `action_step` entity — points to sub-issue `{owner, repo, issue_number}`
- **Relation type**: `synced_to_github` linking chart entity to its GitHub representation

Should reuse `schema/data-model/entity.yaml` patterns rather than inventing new ones.

## Potential Tooling

### MCP Tools (or CLI)

| Tool | Purpose |
|------|---------|
| `sync_chart_to_project` | Push local chart fields to GitHub project item |
| `sync_project_to_chart` | Pull GitHub project state back to local JSONL |
| `create_issue_from_chart` | Create GitHub issue + sub-issues from STC |
| `link_chart_to_issue` | Attach sync_target to existing chart |

### Which base: coaia-pde or coaia-planning?

Either could serve. `coaia-planning` already has `sync_chart_to_plan` / `sync_plan_to_chart` — the GitHub sync follows the same pattern. The recommendation: extend coaia-planning's sync model with a GitHub target, or create coaia-github as a standalone that imports from both.

## Origin

This spec emerged from ceremony `jgwill/src#403` session `98c18eda`, where the agent:
1. Created issues using structural tension framing (llms-txt#13–16)
2. Manually populated GitHub project fields via GraphQL (mino#28, #29)
3. Ran PDE → STC pipeline (coaia-pde `create_stc_from_pde`)
4. Observed: the manual step (3→project fields) is exactly what coaia-github would automate

## Related

- `rispecs/structural_tension_chart_creation.spec.md` — how charts are created
- `schema/data-model/entity.yaml` — entity schema to extend
- `schema/data-model/relation.yaml` — relation types to extend
- `jgwill/llms-txt` `.github/skills/structural-issue-authoring/` — portable issue authoring skill
- `jgwill/llms-txt` `.github/skills/forge-issue/` — internal issue workflow
- `jgwill/mino-bimaadizi-daa` `rispecs/session-completion-hook.rispec.md` — session capture that feeds metadata
