# RISPEC: Accountability vs. Responsibility — Schema Distinction

> Canonical schema extension across the coaia pipeline: coaia-pde → coaia-planning → coaia-narrative → coaia-visualizer

## Current Reality

The existing `action-step-accountability.rispec.md` introduced `assignedTo` / `assignedToType` fields for action steps. This covers **responsibility** (who does the work) but conflates it with **accountability** (who owns the result). These are structurally different:

- **Responsibility** = duty to perform tasks (can be shared/delegated, occurs *during* the process)
- **Accountability** = answerable for the outcome (singular, cannot be delegated, evaluated *after* completion)

In STC terms:
- Responsibility lives at the **action step** level — multiple agents share the work
- Accountability lives at the **chart** level — one entity owns the desired outcome

The `structural_tension_chart` entity has no `accountableFor` field. When a PDE decomposition produces an STC, nobody is formally accountable for the desired outcome being achieved.

## Desired Result

The coaia-narrative schema distinguishes responsibility (action-step-level, delegatable) from accountability (chart-level, singular). All consumers — coaia-pde, coaia-planning, coaia-visualizer — understand and propagate this distinction.

## Schema Extension

### Entity.metadata — Chart-Level Accountability

For `structural_tension_chart` entities:

```yaml
accountability:
  type: object
  description: >-
    Who is accountable for the desired outcome of this chart.
    Accountability is singular and cannot be delegated.
    The accountable entity answers for the result, not the process.
  properties:
    accountableEntity:
      type: string
      description: >-
        Identifier of the single entity accountable for this chart's
        desired outcome (e.g., 'jgi', 'mia', 'team-lead:guillaume').
    accountableEntityType:
      type: string
      enum: [human, ai_companion, sub_agent, team_lead]
      description: >-
        Type of accountable entity. Note: 'team' is NOT valid here —
        accountability is singular. Use 'team_lead' if accountability
        rests with a team's lead.
    accountabilityAcceptedAt:
      type: string
      format: date-time
      description: When accountability was formally accepted.
    accountabilityContext:
      type: string
      description: >-
        Why this entity is accountable — e.g., 'project owner',
        'PDE session initiator', 'ceremony keeper for this direction'.
```

### Entity.metadata — Action-Step-Level Responsibility

For `action_step` entities (extending existing `assignedTo`):

```yaml
responsibility:
  type: object
  description: >-
    Who is responsible for performing this action step.
    Responsibility can be shared and delegated.
    Responsible entities do the work; the accountable entity owns the result.
  properties:
    responsibleEntities:
      type: array
      items:
        type: string
      description: >-
        One or more entities responsible for this step.
        Unlike accountability, responsibility can be shared.
    responsibilityType:
      type: string
      enum: [human, ai_companion, sub_agent, team, pair]
      description: >-
        Type of responsible entity/entities. 'pair' indicates
        human+AI collaborative responsibility.
    delegatedFrom:
      type: string
      description: >-
        If responsibility was delegated, who delegated it.
        Creates a chain: accountable → delegator → responsible.
    delegatedAt:
      type: string
      format: date-time
```

### Relation Types — New

```yaml
# Addition to Relation.relationType enum
- accountable_for    # accountable entity → chart (singular, non-delegatable)
- responsible_for    # responsible entity → action_step (can be multiple)
- delegated_to       # delegator → responsible entity
- reports_to         # responsible entity → accountable entity
```

## Backward Compatibility

All new fields are optional. Existing `assignedTo` field remains valid as a shorthand for `responsibility.responsibleEntities[0]`. When both exist, `responsibility` takes precedence.

## Structural Alignment

| Concept | STC Level | Multiplicity | Timing | Fritz Mapping |
|---------|-----------|-------------|--------|---------------|
| Accountability | Chart (desired outcome) | Singular | After completion | "The creator is accountable for the creation" |
| Responsibility | Action step (process) | Shared | During process | "Strategic secondary choices are distributed work" |

## Propagation Across Pipeline

| Project | Role |
|---------|------|
| `coaia-pde` | Sets initial `accountability.accountableEntity` from PDE session initiator; maps `responsibility` from direction assignments |
| `coaia-planning` | Inherits accountability from plan owner; distributes responsibility across plan phases |
| `coaia-narrative` | Stores both in Entity.metadata; new relation types `accountable_for` / `responsible_for` |
| `coaia-visualizer` | Renders accountability badge on chart header; groups action steps by responsible entity |

## Priority

High — this distinction is foundational for multi-agent STC collaboration.

## References

- Merriam-Webster: accountability as obligation to accept responsibility for outcomes
- Forbes: accountability in workplace — ownership, transparency, answerability, consequences
- Robert Fritz: the creator (accountable) makes strategic secondary choices (responsibilities) to resolve structural tension
