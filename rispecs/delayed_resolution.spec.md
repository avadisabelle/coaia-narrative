# Delayed Resolution Component
## RISE Specification for a Chosen Delay on an Action Step

**Component Purpose**: Let a person or an agent record on an action step that they strategically chose to delay its resolution: until when, why, what the delay serves, and which agent session to rehydrate when the date or an event comes. Then list those delays by date and end them.

**Status**: Implemented and published. 0.24.0 (`5a39994`, 2026-10-19) brought the record, the three operations (library, MCP, CLI), the derived status and the GitHub status; 0.24.1 (`3bed9ee`, 2026-10-19) made completion end a delay as `resolved`; a consumer installing 0.24.1 from npm ran delay, list and end with exit 0 (Episode 297 `validation/coaia-narrative/output-261019.txt`). 0.25.0 (2026-10-20) adds the session's LLMOps addresses `trace` and `rehydrateWith`, and `mark_action_complete` now says when it ended a delay (finding F4 of the 2026-10-20 spec lane). Proof of the 0.25.0 release is `npm view coaia-narrative version`; the consumer run that feeds `@miadi/llmops` 0.1.0 output into a delay is Episode 297 `validation/coaia-narrative/consume-llmops.mjs`, output `output-261020.txt`.

**Origin**: Miadi Chronicle Episode 297 (`miadi-chronicle://297`), design `2026-07-24-episode-297-mino-bimaadizi-daa-stc-bot-ceremony/delayed-resolution-design-261019.md`, shared with `coaiajs` and the medicine wheel. Each lineage implements it on its own.

**Two meanings of the phrase in this package.** The older one is the "Delayed Resolution Principle" in `structural_tension_chart_creation.spec.md` and `educational_guidance.spec.md`: current reality may not claim readiness, so the tension is not resolved early by assumption. This spec is about the newer one: a recorded choice to wait on a step. Both come from Robert Fritz.

---

## 🎯 What This Component Enables Users to Create

- **A delay that says it was chosen**: a step carries who chose to wait, until when, why, and what the wait serves, instead of an unexplained late date.
- **Work that can be brought back**: the step names the agent session that holds the work and the command that resumes it.
- **A calendar of delays**: every standing delay, soonest first, with the days remaining and the ones now owed.
- **Three honest endings**: the session is rehydrated, the step is released, or the step is completed and the delay ends as resolved.

Fritz, course lesson `LAA-w04-22bc-Delay_Resolution`: "Part of the maturation process is to learn how to delay resolution in favor of longer-term goals." The delay "is a secondary choice to our primary choice". William, 2026-10-19: "It's not just there is a due date... there is a due date and we chose to delay resolution."

---

## 📋 Natural Language Describing Functional Aspects

### The record

Written camelCase in the step entity's `metadata`, with the same fields and meaning as the design's snake_case record.

```typescript
interface AgentSessionRef {
  sessionId: string;          // required
  agent?: string;             // 'claude' when not given
  host?: string; cwd?: string; tmux?: string;
  resumeCommand?: string;     // composed at delay time for a claude session with a cwd: cd <cwd> && claude --resume <id>
  inventoryRecord?: string;
  trace?: string;             // 0.25.0: the session's LLMOps record, e.g. miadi-tracing:ceremony/session/<id>
  rehydrateWith?: string;     // 0.25.0: the pinned prompt version, e.g. miadi-tracing:ceremony/prompt/miadiRun-<name>@<N>
}

type DelayedResolutionOutcome = 'rehydrated' | 'released' | 'resolved';

interface DelayedResolution {
  chosenAt: string;           // ISO, set by the tool
  chosenBy: string;
  resolveBy: string;          // ISO, in the future when chosen
  reason: string;
  primaryChoice?: string;     // defaults to the desired outcome of the chart the step advances, copied when chosen
  wakeOn?: string[];          // event cues, in words
  session?: AgentSessionRef;
  endedAt?: string; endedBy?: string;
  outcome?: DelayedResolutionOutcome;
  endNote?: string;
}

// on the step entity's metadata:
delayedResolution?: DelayedResolution;            // the current delay, open or ended
delayedResolutionHistory?: DelayedResolution[];   // earlier records, oldest first
```

The data model schema (`schema/data-model-complete.*`, `schema/data-model/entity.*`) carries both fields.

`trace` and `rehydrateWith` are the design's `trace` and `rehydrate_with`: what `llmops rehydrate --domain <d> --trace <T> --mission miadiRun-<name>.v<N>` prints (`@miadi/llmops` 0.1.0, jgwill/Miadi#829). Each is refused unless it begins with `miadi-` and is stored as given. Resolving an address is the LLMOps package's work, not the chart's.

`delayedResolution.session` is the session to bring back. It is distinct from `metadata.source.sessionId` (and `session_id`), the session that wrote the entity, which the GitHub projection keeps reading. The two can name different sessions.

### Which step a name points to

- A **written step** is an `action_step` entity: `chart_123_action_1`.
- A **telescoped step** is a sub-chart, named by its chart id (`chart_123`), its chart entity (`chart_123_chart`) or its desired outcome (`chart_123_desired_outcome`). Its record lives on the desired outcome, the entity `mark_action_complete` writes to.
- A chart with no parent is a primary choice, not a step, and is refused: "Delay one of its steps instead."

### Rules

1. Choosing a delay sets the step's `dueDate` to `resolveBy`. For a telescoped step, its chart's `dueDate` moves with it.
2. A completed step is refused (for a telescoped step, completion of its desired outcome or its chart counts). `resolveBy` must parse as a date and lie in the future. `reason` and `chosenBy` are required. A `session` must be an object carrying `sessionId`. A `session.trace` or `session.rehydrateWith` that does not begin with `miadi-` is refused.
3. Delaying a step that already carries a record, open or ended, moves that record to `delayedResolutionHistory` and writes the new one. Nothing is overwritten.
4. Ending keeps the record with `endedAt`, `endedBy`, `outcome`, and an optional `endNote`. `completionStatus` is never changed by a delay.
4b. Completing a delayed step ends its open delay with `outcome: "resolved"`, `endedBy` = the completer or `"mark_action_complete"`, `endNote: "completed"`. This runs through `markActionStepComplete` (`mark_action_complete` with `completedBy`), `setActionStepCompletion(step, true, { completedBy })`, `cnarrative complete <step> --by <who>`, and the GitHub writer, which passes the person who checked the task-list item (`@login`). Pure helper: `closeDelayOnCompletion(metadata, completedBy)`. Since 0.25.0 (finding F4), `markActionStepComplete` returns the delay record it ended (or `null`), and `mark_action_complete`'s text adds a line naming the delay's `resolveBy`, who chose it and who ended it as resolved. `cnarrative complete` already printed "Its delayed resolution ended as resolved."
5. Derived status, never stored: `completed` when the step is complete, else `delayed` while a delay is open, else `pending`.
6. Owed: a step whose status is `delayed` and whose `resolveBy` has passed.
7. Free-text arguments (`reason`, `primaryChoice`, `wakeOn`, `endNote`, session fields) are refused when they carry unparsed call syntax.

### Operations

| library (`KnowledgeGraphManager`) | MCP tool (`STC_TOOLS`) | CLI | result |
|---|---|---|---|
| `delayResolution(actionStepName, { resolveBy, reason, chosenBy, primaryChoice?, wakeOn?, session? })` | `delay_resolution` | `cnarrative delay <step> <resolveBy> --reason "<why>" --by "<who>" [--primary] [--wake-on]... [--session-id --agent --host --cwd --tmux --resume-command --inventory-record --trace --rehydrate-with]` | the step view: `actionStepName`, `kind` (`written` or `telescoped`), `chartId`, `telescopedChartId`, `title`, `dueDate`, `status`, `delayedResolution`, `delayedResolutionHistory` |
| `listDelayedResolutions({ dueWithinDays?, includeEnded?, now? })` | `list_delayed_resolutions` | `cnarrative delayed [--within <days>] [--all]` | entries sorted by `resolveBy`, then by name |
| `endDelayedResolution(actionStepName, { endedBy, outcome, endNote? })` | `end_delayed_resolution` | `cnarrative end-delay <step> --outcome rehydrated\|released --by "<who>" [--note]` | the step view, and `resumeCommand`, `trace`, `rehydrateWith` (each or `null`) when rehydrated |
| `describeActionStep(name)` | `get_action_step` | | the step view, or `null` for a primary chart |

- A listing entry: `actionStepName`, `kind`, `chartId`, `telescopedChartId`, `title`, `status`, `resolveBy`, `daysRemaining`, `owed`, `primaryChoice`, `reason`, `chosenBy`, `chosenAt`, `wakeOn`, `session`, and when ended `endedAt`, `endedBy`, `outcome`, `endNote`.
- `daysRemaining`: whole days to `resolveBy`, rounded up, never `-0`.
- Without `includeEnded`, ended delays and delays on steps completed since are left out. `dueWithinDays: N` keeps entries whose `resolveBy` is at or before now + N days, owed ones included.
- `end_delayed_resolution` accepts only `rehydrated` and `released`; `resolved` comes from completion alone. A `rehydrated` end on a delay with no session answers `resumeCommand: null` (coaiajs refuses that case).
- `delay`, `delayed` and `end-delay` print JSON with `--json`. Without it, `delay`, `delayed` and `end-delay` print the session's trace and prompt address when it names them. `--trace` or `--rehydrate-with` without `--session-id` is refused.
- Pure readers in `src/delayed-resolution.ts`, re-exported from `coaia-narrative/writer`: `deriveStepStatus`, `openDelayOf`, `delayRecordOf`, `isOwed`, `daysRemaining`, `closeDelayOnCompletion`, `DELAYED_RESOLUTION_OUTCOMES`, `UNKNOWN_COMPLETER`.

### Where the status shows

- `get_action_step` (which also answers for a written step since 0.24.0), `get_chart`, `get_chart_progress` (`steps` with `status`, `dueDate`, and for an open delay `resolveBy` and `owed`; and `delayedActions`), `list_active_charts` (⏸️ with the date, and "owed").
- The CLI's `list`, `view` and `progress` views.
- `nextAction` in `get_chart_progress` is the incomplete step due earliest, delayed ones included.
- **GitHub projection**: `deriveGithubProjectStatus` returns `Delaying Resolution` while the chart itself or one of its telescoped steps carries an open delay, and stops once the delay ends. `Completed` still wins over it.

---

## 🎯 Creative Advancement Scenarios

**Creative Advancement Scenario**: Setting a session aside until a date

**User Intent**: William sets aside a session he will not need for two weeks and wants it back on that date with its reason intact.
**Current Reality**: The step sits on a chart with a due date, and the session that was working on it is idle.
**Natural Progression Steps**:
  1. `cnarrative delay chart_123_action_2 2026-11-03 --reason "waits on the review" --by william --session-id <id> --cwd <dir>` records the choice; the step's due date becomes 2026-11-03 and the resume command is composed.
  2. `cnarrative delayed` lists it among the other delays, soonest first, and marks it owed once the date passes. The chart's GitHub project item reads `Delaying Resolution`.
  3. On the date, `cnarrative end-delay chart_123_action_2 --outcome rehydrated --by william` closes the record and prints the resume command.
**Achieved Outcome**: The session comes back with the reason it stopped, and the closed record stays on the step.
**Supporting Features**: `delayResolution`, `listDelayedResolutions`, `endDelayedResolution`, `deriveGithubProjectStatus`.

**Creative Advancement Scenario**: A task-list item is checked while its step is delayed

**User Intent**: Work that was set aside gets done another way, and someone checks it on the GitHub issue.
**Current Reality**: The step holds an open delay.
**Natural Progression Steps**:
  1. The GitHub writer completes the step and passes the person who checked the item.
  2. The open delay ends with `outcome: "resolved"`, `endedBy: "@login"`, `endNote: "completed"`.
**Achieved Outcome**: Nobody rehydrates a session whose work is done, and the project item leaves `Delaying Resolution`.
**Supporting Features**: rule 4b, `closeDelayOnCompletion`.

---

## ✅ Quality Criteria

- ✅ A completed step and a past `resolveBy` are refused, and so is a chart with no parent
- ✅ A re-delay keeps the earlier record in history
- ✅ Ending keeps the record and leaves `completionStatus` untouched
- ✅ Completing a delayed step, by any path, ends its delay as `resolved`, and `mark_action_complete` says so
- ✅ `trace` and `rehydrateWith` outside `miadi-` are refused; a `rehydrated` end returns them as stored
- ✅ MCP, CLI, library and the GitHub projection report the same derived status
- ✅ `test-delayed-resolution.js` runs in `npm test`

## Out of scope

- The clock that steers a session before `resolveBy`. Who runs it is undecided (Episode 297, resolve-by 2026-10-27).
- Resolving or fetching a `trace` or `rehydrateWith` address. That belongs to `@miadi/llmops`.
- Writing these fields from the session inventory, which owns its own records.

---

## 🔗 Related Components

- **MCP API Specification**: the three tools' schemas, and `mark_action_complete`'s `completedBy`.
- **MCP Tool Interface**: the tools sit in `STC_TOOLS`, so they are on by default.
- **Advancing Pattern Tracking**: completion now also ends a delay.
- **CLI Interactive Visualization**: `delay`, `delayed`, `end-delay`, `complete --by`.
- **coaia-github bridge**: the `Delaying Resolution` project status.

## Implementation Links

| behaviour | file |
|---|---|
| record types | `src/types.ts` |
| pure readers and `closeDelayOnCompletion` | `src/delayed-resolution.ts` |
| writes, step reference, listing | `src/graph-manager.ts` |
| MCP schemas and handlers | `src/tool-definitions.ts`, `src/tool-handlers.ts`, `src/tool-groups.ts` |
| CLI | `cli.ts` (`delay`, `delayed`, `end-delay`, `complete`) |
| GitHub status | `src/github-bridge.ts` `deriveGithubProjectStatus` |
| GitHub writer completion | `src/writer.ts` |
| tests | `test-delayed-resolution.js` |
