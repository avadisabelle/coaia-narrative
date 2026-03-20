# RISPEC: Action Step Accountability Assignment

## Current Reality

The `action_step` entity metadata supports `dueDate`, `completionStatus`, `phase`, `chartId`, and telescoping fields — the *when*, *status*, and *structure* of action steps. But there is no field for **who is accountable** for the action step. The STC functions as a personal planning tool but cannot serve as a Strategic Action Plan for a team of humans and AI companions working together.

When a PDE decomposition produces an actionStack with items mapped to Four Directions, and these become STC action steps, there is no way to assign them to specific agents (human or AI) for execution and accountability tracking.

## Desired Result

Each `action_step` entity can optionally carry accountability assignment — identifying the human or AI companion (or sub-agent) accountable for its completion. This transforms the STC from a solo planning instrument into a collaborative Strategic Action Plan where work is distributed and tracked across a team.

## Schema Extension

### Entity.metadata — New Fields

```yaml
# Addition to data-model-complete.yaml Entity.metadata.properties
assignedTo:
  type: string
  description: >-
    Identifier of the human or AI entity accountable for this action step.
    Can be a human name, agent role, or agent identifier
    (e.g., 'mia', 'miette', 'tushell', 'jgi', 'sub-agent:south-research-3').
assignedToType:
  type: string
  enum:
    - human
    - ai_companion
    - sub_agent
    - team
  description: >-
    Classification of the assigned entity. Enables filtering
    action steps by accountability type (e.g., show all human-assigned vs
    AI-assigned steps).
assignedAt:
  type: string
  format: date-time
  description: ISO 8601 timestamp of when accountability was assigned.
assignmentContext:
  type: string
  description: >-
    Optional context for why this entity was assigned — e.g.,
    'SOUTH direction research specialist', 'domain expert in Scrivener sync',
    'PDE review companion during sleep window'.
```

### Tool Schema Extensions

**`create_structural_tension_chart`** — extend `actionSteps` from `string[]` to support objects:

```yaml
actionSteps:
  type: array
  items:
    oneOf:
      - type: string
      - type: object
        properties:
          description:
            type: string
          assignedTo:
            type: string
          assignedToType:
            type: string
            enum: [human, ai_companion, sub_agent, team]
        required: [description]
  description: >-
    Action steps as strings (backward compatible) or objects with
    optional accountability assignment.
```

**`manage_action_step`** — add optional `assignedTo`:

```yaml
assignedTo:
  type: string
  description: Who is accountable for this action step.
assignedToType:
  type: string
  enum: [human, ai_companion, sub_agent, team]
```

**`mark_action_complete`** — add optional `completedBy`:

```yaml
completedBy:
  type: string
  description: Who completed this action step (may differ from assignedTo).
```

## Backward Compatibility

All new fields are optional. Existing charts and tools continue to work unchanged. Assignment is additive — STCs without assignments function exactly as before.

## Relation to PDE → STC Pipeline

When `coaia-pde` transforms a `DecompositionResult` into an STC:
- `actionStack[].direction` informs the default `assignedToType` (e.g., SOUTH items → `sub_agent` research specialists)
- The lead agent or human can override assignments after chart creation
- `manage_action_step` allows re-assignment during the creative process

## Consumers

- **Miadi-18 STC bots** (`.github-hooks/stc/`) — dispatch work based on `assignedTo`
- **stc-monitor** (`app/stc-monitor/`) — filter/group action steps by assignee
- **rise-pde-session-multi-agents** — assign SOUTH/WEST/NORTH agents to their direction's action steps
- **mcp-medicine-wheel** — ceremony-aware accountability (who holds which direction)

## Priority

High — without this, the PDE→STC pipeline produces charts that nobody is specifically accountable for executing.
