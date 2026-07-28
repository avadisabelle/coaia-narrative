# Wampum Belt Visualization Component
## RISE Specification for Displaying Wampum Content from a Chart in a Visual Interface

**Component Purpose**: Enable a person holding a chart to read the Wampum Belt that holds it accountable — the grid, the beads, the readings that shift with position, and the ceremony that binds them — as a spatial memory surface standing *beside* the linear narrative beats, never in place of them.

**Status**: Specification. Written against branch `copilot/integrate-wampum-belt-sequencing` (v0.14.0, commits `7460be3` `4023000`). No display path exists yet in any surface.

---

## 🎯 What This Component Enables Users to Create

- **Whole-belt apprehension**: the shape of a `rows × cols` field seen at once, including its silences
- **Standing in a position**: choosing a cell and receiving the reading proper to that vantage
- **Visible obligation**: which charts a belt holds accountable, which beats it witnesses, who was named as witness, what needs renewal
- **Bead-level attribution**: restoring to the reader what the relation layer collapses

---

# R — Reverse Engineering: Current Reality

## The Data That Exists

### Belt — `WampumBeltMetadata` (`src/types.ts:196-205`)

| Field | Type | Source |
|---|---|---|
| `beltId` | `string` | `belt_${Date.now()}` — `graph-manager.ts:968` |
| `title` | `string` | caller |
| `purpose` | `string` | "what this belt encodes or remembers" (`tool-definitions.ts:534`) |
| `rows` / `cols` | `number` | positive integers, default `1` (`graph-manager.ts:962, 965-967`) |
| `beads` | `WampumBead[]` | append-only, **insertion order, not spatial order** (`graph-manager.ts:1048`) |
| `createdAt` / `updatedAt` | ISO 8601 | `updatedAt` advances on every bead add (`graph-manager.ts:1049`) |

### Bead — `WampumBead` (`src/types.ts:184-194`)

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | `bead_${beltId}_${row}_${col}` (`graph-manager.ts:1037`) — position is fused into identity |
| `mnemonic` | `string` | short anchor phrase; the primary label a viewer shows |
| `color` | `'white' \| 'purple' \| 'black' \| 'mixed'` | closed enum, enforced at handler (`tool-handlers.ts:402`) and schema (`tool-definitions.ts:549`) |
| `position` | `{ row, col }` | 0-indexed, bounds-checked (`graph-manager.ts:1017-1026`) |
| `reading` | `string` | canonical meaning — always present |
| `relationalReadings?` | `Record<string,string>` | key omitted entirely when not supplied (`graph-manager.ts:1042`) |
| `ceremonyLink?` | `WampumCeremonyLink` | key omitted entirely when not supplied (`graph-manager.ts:1043`) |
| `observations` | `string[]` | defaults `[]` (`graph-manager.ts:1006`) |
| `createdAt` | ISO 8601 | shared with the belt's `updatedAt` for that write |

### Ceremony link — `WampumCeremonyLink` (`src/types.ts:175-182`)

`ceremonyType` is the only required member: `commitment | accountability | witness | renewal` (`tool-definitions.ts:563`). Optional: `chartId`, `beatName`, `witnessNames[]`, `renewalDate`, `notes`.

**Critical for display**: only `chartId` and `beatName` become graph relations (`graph-manager.ts:1052-1067`). `witnessNames`, `renewalDate`, and `notes` live *only inside the bead's JSON*. A viewer that draws the relation graph alone renders witnesses as invisible.

## Where the Belt Lives in JSONL

The belt is **one entity line**. Beads are not entities — they nest inside `metadata.wampumBelt.beads`.

- Entity name `` `${beltId}_belt` `` (`graph-manager.ts:983`), `entityType: "wampum_belt"` (`:984`), metadata key `metadata.wampumBelt` (`types.ts:257`)
- Serialized as `{...entity, type:'entity', metadata}` (`jsonl-preservation.ts:153-158`)

Real lines, produced by executing the built graph manager (not hand-written):

```jsonl
{"name":"belt_1785225783914_belt","entityType":"wampum_belt","observations":["Wampum Belt created: Treaty Belt","Purpose: Anchor obligations and witness relational memory"],"metadata":{"beltId":"belt_1785225783914","createdAt":"2026-07-28T08:03:03.914Z","updatedAt":"2026-07-28T08:03:03.919Z","wampumBelt":{"beltId":"belt_1785225783914","title":"Treaty Belt","purpose":"Anchor obligations and witness relational memory","rows":2,"cols":3,"beads":[{"id":"bead_belt_1785225783914_0_0","mnemonic":"the crossing","color":"purple","position":{"row":0,"col":0},"reading":"Where paths first met","relationalReadings":{"left":"Origin point","col:0":"Column reading"},"ceremonyLink":{"ceremonyType":"accountability","chartId":"chart_1785225783900","beatName":"chart_x_beat_beat_1785225783910"},"observations":["witnessed by council"],"createdAt":"2026-07-28T08:03:03.919Z"}],"createdAt":"2026-07-28T08:03:03.914Z","updatedAt":"2026-07-28T08:03:03.919Z"}},"type":"entity"}
{"from":"belt_1785225783914_belt","to":"chart_1785225783900_chart","relationType":"wampum_holds_accountable","metadata":{"createdAt":"2026-07-28T08:03:03.919Z","context":"accountability"},"type":"relation"}
{"from":"belt_1785225783914_belt","to":"chart_x_beat_beat_1785225783910","relationType":"wampum_witnesses","metadata":{"createdAt":"2026-07-28T08:03:03.919Z"},"type":"relation"}
```

Belt observations are seeded at creation and never appended to (`graph-manager.ts:985`).

## How a Belt Is Discovered From a Chart

There is **no forward link**. `createWampumBelt` takes no `chartId` and writes no `metadata.chartId` (`graph-manager.ts:959-996`) — a fresh belt is an orphan entity, reachable only by scanning for `entityType === 'wampum_belt'`.

The link appears later, and **only as a side effect of adding a bead** carrying a `ceremonyLink`:

| Relation | `from` | `to` | `metadata.context` |
|---|---|---|---|
| `wampum_holds_accountable` | `` `${beltId}_belt` `` | `` `${ceremonyLink.chartId}_chart` `` | `ceremonyType` |
| `wampum_witnesses` | `` `${beltId}_belt` `` | `ceremonyLink.beatName` (verbatim) | — |

Consequences a renderer must handle:

- **Relations are belt→target, not bead→target.** N beads pointing at one chart collapse to one edge. The graph says *that* a belt is accountable to a chart; only `beads[].ceremonyLink` says *which bead* carries the obligation.
- **Repeat links dedupe; conflicting ones throw.** The relation key is `from\0to\0relationType` (`jsonl-preservation.ts:57-59`). A second bead linking the same chart under the *same* `ceremonyType` collapses to one line; under a *different* `ceremonyType` the save is rejected by `validateRecordPreservation` with `metadata.context changed unexpectedly` (reproduced by execution). The uniqueness is **per (chart, ceremonyType)**, not per belt: one belt may hold *several* charts accountable, one relation per distinct chart, each carrying its own `ceremonyType` in `metadata.context`. What a belt cannot do is hold the *same* chart accountable under two different ceremony types. A viewer presents distinct `(from, to, relationType)` links and must never assume one row per bead.
- Both edge types and the `wampum_belt` entity type are declared in the JSONL contract (`schema/data-model-complete.json:31, 458-459, 670, 722-723`).
- **`metadata.wampumBelt` is NOT documented in the schema.** A consumer building from the published contract alone sees the entity type and the two relation types, and finds no belt payload described. Required addition (see Exportation).

## What the Read Path Returns

`readWampumBelt(beltId, position?)` (`graph-manager.ts:1073-1119`) returns `{ belt, bead?, positionalReading? }` in exactly three shapes:

1. **No `position`** → `{ belt }` (`:1086-1088`) — whole grid, no interpretation applied
2. **`position` on an empty cell** → `{ belt }` (`:1103-1105`) — *no `bead`, no `positionalReading`, and no error*. Silence is the signal for an unbeaded cell.
3. **`position` on a bead** → all three fields

Out-of-bounds throws (`:1089-1098`); the message contains `out of bounds` and the belt's `RxC`.

**Positional reading resolution order** (`:1107-1116`), first non-nullish wins:

```
relationalReadings["col:N"] → relationalReadings["row:N"] → relationalReadings[colLabel] → bead.reading
```

`colLabel` = `left` when `col === 0`, else `right` when `col === cols - 1`, else `center`. Verified: a bead with `{left:"Origin point","col:0":"Column reading"}` at `(0,0)` resolves `"Column reading"` — the explicit column key outranks the edge label. In a 1-column belt, `col === 0` matches first, so `right` is unreachable.

## What Is NOT Available

- **No bead ordering beyond grid position.** No sequence index, no `precedes`/`follows`. Any reading path (left-to-right, spiral, center-outward) is the renderer's invention, not data.
- **No mutation.** Three wampum methods exist (`graph-manager.ts:959, 998, 1073`) — no update, delete, or move. Occupied positions throw on re-add (`:1028-1033`). Belts are append-only.
- **No bead-level entity or relation.** Beads are invisible to `search_nodes`, `open_nodes`, and relation traversal.
- **No CLI surface.** `cli.ts` and `markdown-export.ts` contain zero occurrences of `wampum`.
- **No listing tool.** `read_wampum_belt` requires a known `beltId`; MCP-only viewers cannot discover one.
- **Not enabled by default.** `WAMPUM_TOOLS` (`src/tool-groups.ts:30-34`) is excluded from the default `COAIA_TOOLS` (`:64`); `schema/index.json` labels it opt-in.
- **Tools return raw JSON.** All three handlers emit `JSON.stringify(result, null, 2)` (`tool-handlers.ts:396, 427, 445`).
- **Coverage**: `test-coaia-narrative.js:355-417` covers placement, both relations, positional resolution, and bounds. No display or serialization-shape test.

## The Visualization Lineage

**`/a/src/coaia-visualizer/` exists** — Next.js 16 App Router, React 19, shadcn/ui on Radix, Tailwind v4; published as a lib plus a CLI that spawns `next dev` with `COAIAV_MEMORY_PATH` set.

- **Data fetch**: the browser calls `GET /api/jsonl`, which returns the entire raw file as `{content, filename, path}`, and parses client-side. The parsed `/api/charts*` routes are Bearer-auth'd for the MCP consumer path. Live refresh polls `GET /api/watch`.
- **How it renders**: stacked shadcn `Card`s. A chart is a vertical three-section stack (Desired Outcome, Action Steps, Current Reality); hierarchy is an indented chevron tree; `relation-graph.tsx` is flat `from → ArrowRight → to` rows. **No SVG, no canvas, no d3, no drawn geometry anywhere.** `recharts` is installed and unused.
- **Wampum awareness: zero.** No occurrence of `wampum`, `bead`, or `belt` in the repo.
- **Why a belt currently vanishes**: the sole `entityType` dispatch lives in the parser (`lib/jsonl-parser.ts:127-140`, mirrored in `lib/chart-editor.ts:568-581`) and switches on exactly `desired_outcome | current_reality | action_step | narrative_beat`. A `wampum_belt` entity matches no case, survives only in `entities`/`rawRecords` and the raw-metadata dump — present in memory, absent from the view. The two `wampum_*` relations render as flat text rows.
- **CLI precedent**: `cli_interactive_visualization.spec.md:26-30, 111-113` establishes the house terminal idiom — box-drawing for structure, status icons, color-coded state, Markdown export as a first-class peer of the interactive view.

---

# I — Intent: What the Display Serves

## Why Spatial and Relational, Not Linear

A narrative beat carries an `act` number because a beat belongs to a **sequence**. A bead carries `{row, col}` because a bead belongs to a **place**. `schema/tools/narrative/README.md:334` states it: the belt *"does not replace narrative beats. It runs alongside them as a relational memory layer."*

The implementation makes the spatial claim binding, not decorative: position is fused into bead identity; a cell holds exactly one bead and re-placement throws; meaning is *resolved through* position, so the same bead yields different text depending on where the reader stands. A list rendering discards the one thing the data model treats as load-bearing. Rendering the grid is not a stylistic preference — it is the only rendering that preserves what was stored.

## What the Positional Readings Mean to a Viewer

`relationalReadings` is a perspective map, and the resolution order is a precedence of specificity:

| Key form | What it says |
|---|---|
| `col:N` | *"Read from this column."* A vertical stance, one lane of the belt. Wins over everything. |
| `row:N` | *"Read from this row."* A horizontal stance, one course of weaving. |
| `left` / `center` / `right` | *"Read from this edge, or from the middle."* **Derived, not stored** — computed from `col` against `cols` at read time. |
| `reading` | The canonical meaning, held when no perspective is asserted. |

The edge labels are not three-column bookkeeping; they are edge-versus-interior relation. That the code *derives* them rather than storing them is itself a claim that vantage is relational, not a property of the bead alone. One bead has layers of meaning, and which layer surfaces depends on where the reader stands. A display showing only `reading` shows a bead stripped of its relations; a display showing only the resolved reading hides that other readings exist. Both are present — the canonical grounds, the positional is what this vantage receives.

## What Must Remain Visible for Relational Accountability

- **`commitment`** — a promise made, held toward a chart via `wampum_holds_accountable`
- **`accountability`** — a chart this belt answers to; same edge, `metadata.context` carries which
- **`witness`** — a beat this belt saw, via `wampum_witnesses`; plus `witnessNames[]`, which produces **no edge at all**
- **`renewal`** — `renewalDate`, likewise edge-less and bead-interior

Two of the four ceremony types carry their most human content where a relation traversal cannot reach. **The display is the only surface where a named witness or a renewal date can become visible.** A belt view that renders edges alone renders the institutional obligation and drops the people — the exact failure the belt exists to hold against. Likewise, the belt→chart edge collapses N beads to one link; the display is what restores bead-level attribution.

## Structural Tension

**Desired Outcome** — A viewer opens a chart and sees the belts accountable to it; opens a belt and sees the full `rows × cols` field with every bead in its place, colored, mnemonically labeled, its silences intact. Standing on a cell yields that cell's positional reading beside the canonical one, with ceremony type, linked chart, witnessed beat, named witnesses, and renewal date all present in the frame. Obligations are read where they were made.

**Current Reality** — The data is complete and executable: `readWampumBelt` returns a fully-formed belt with every bead, reading map, and ceremony link, and both relation types are declared in the JSONL contract. Nothing renders it. The three tools emit `JSON.stringify`; `cnarrative` and `markdown-export.ts` have no wampum code path; `coaia-visualizer` — the one existing renderer, which does read this JSONL — drops `wampum_belt` in its parser before any component sees it. `metadata.wampumBelt` is absent from the published schema, so a consumer building from the contract cannot discover the bead shape. `WAMPUM_TOOLS` is opt-in, so most running servers never emit a belt at all.

**Natural Progression** — The visualizer already parses the whole file client-side and keeps unmatched records, so belt entities are *already in the browser*, unread. The advance is not new plumbing: a fifth case in the entityType dispatch, a collection on the parsed chart reached through the `wampum_holds_accountable` edge, and a grid component where every other renderer is a stack. The `left/center/right` derivation and the four-value color enum are closed vocabularies — they translate to visual encodings without further design decisions. Each belt rendered makes the next ceremony worth recording.

---

# S — Specifications: The Visual Interface

## 1. Data Contract

A viewer obtains belt content from the same JSONL memory file it already reads for charts. No new transport, no new store.

- A belt is **one entity record**; reading that line yields the complete belt. A viewer holding the belt entity needs no further lookups to render the grid.
- The bead `id` (`bead_<beltId>_<row>_<col>`) is deterministic from position and serves as the stable anchor for deep links (`#bead_<beltId>_<row>_<col>`).
- **Belt↔chart association is relational only** — see the R section table. The viewer presents the **distinct** `(from, to, relationType)` set and may show how many beads contribute to each link.
- **Required addition — visualizer ingestion.** `organizeData` attaches entities to charts by `entity.metadata.chartId` or a `^(chart_\d+)` name match. Belts satisfy neither. A `wampumBelts: EntityRecord[]` collection on `Chart`, populated by scanning `wampum_holds_accountable` relations whose `to` equals `<chartId>_chart`, is required.
- **Required addition — discovery.** No `list_wampum_belts` tool exists. A viewer reading JSONL directly can enumerate by `entityType`; an MCP-only viewer cannot discover a `beltId` it was not handed.

**Read surface** — two observable modes:

| Call | Returns | Viewer use |
|---|---|---|
| `{ beltId }` | `{ belt }` | Full grid render |
| `{ beltId, position }`, occupied | `{ belt, bead, positionalReading }` | Single-cell reading pane |
| `{ beltId, position }`, in-bounds and empty | `{ belt }` — no `bead`, no `positionalReading` | Empty-cell state, **not** an error |
| `{ beltId, position }`, out of bounds | throws; message contains `out of bounds` and `RxC` | Rejected navigation |

## 2. Render Model

The grid is the primary form. The belt renders as `rows × cols` cells in reading order, always at full declared dimension — including rows and columns holding nothing.

- **Occupied cell** shows the bead's `mnemonic` as its readable anchor. The `reading` is not shown at grid scale.
- **Empty cell** renders as a present, addressable, visibly vacant position — not as an absent cell. A 2×3 belt with two beads still draws six cells. Vacancy is belt content: *nothing has been placed here yet*.
- **Color is encoded meaning, not decoration.** `white` / `purple` / `black` / `mixed` are the bead's own semantic vocabulary, reproduced with a distinct visual treatment **and** named in text on the cell or its accessible label. `mixed` is a first-class fourth value with its own treatment, never a blend or fallback of the others.
- **Layout**: a `WampumBeltGrid` region containing one `WampumBeadCell` per position, and a `WampumBeltHeader` showing `title`, `purpose`, `rows × cols`, beads placed over cells, and `updatedAt`.
- Cells stay uniform and square-ish so row/column geometry remains legible; the grid does not reflow beads into a wrapped list at any breakpoint, because position carries meaning. Row and column indices are visible or available on hover/focus.

## 3. Positional Reading Behavior

Selecting a cell opens the reading pane, which shows what `read_wampum_belt` resolves for that exact position, following the implemented chain (`col:N` → `row:N` → edge label → canonical).

- **First match wins.** A bead defining both `col:2` and `right` at the right edge resolves `col:2`. The pane shows the resolved text **and names its source rung** (`col:2`, `row:0`, `left`, `right`, `center`, or `canonical`).
- **A single-column belt resolves `left`, never `right`.**
- **Resolved vs canonical are visually distinct.** When resolution came from rungs 1–3, the pane shows it as *the reading from this position* with `bead.reading` beneath it labelled canonical. When it fell through to rung 4, the pane shows one reading marked canonical and states that this position carries no distinct reading. The reader must never be unable to tell which they are looking at.
- **Unresolved keys are shown as stored, not as resolved.** `relationalReadings` is an open record; keys outside `col:N` / `row:N` / `left` / `center` / `right` persist but are never returned by the read surface. The pane lists them under *other stored readings* so the display never implies the engine would surface them.
- **Navigation is bounded by the belt**, so the out-of-bounds throw is a defensive backstop rather than a reachable state. If it surfaces anyway, the belt's declared `RxC` is shown with the rejected coordinate.

## 4. Ceremony Surface

A bead's `ceremonyLink` shows on the cell as a compact marker and in the reading pane in full.

- **`ceremonyType`** appears as a named badge with its own glyph, always spelled out; the glyph never carries the meaning alone.
- **`witnessNames[]`** renders as a named list — witnesses are people who stood present, so they are listed by name, never collapsed into a count. Zero witnesses shows as *no witnesses recorded*, distinct from the field being absent.
- **`renewalDate`** is a free-form string with no upstream validation. The viewer parses it as a date when it can: future → the date with time remaining; **passed → legible as needing renewal**, in text and not by color alone, at grid scale as well as in the pane; unparseable → shown verbatim and marked *unparsed*, never silently dropped and never guessed at.
- **`chartId` / `beatName`** render as navigable references to the chart and beat surfaces the viewer already provides. **`notes`** renders as free prose under the link.
- **`observations[]`** render as a chronological list beneath the readings, in the same idiom as entity observations elsewhere.

## 5. Relation to Charts and Beats

- On a **chart view**, a Wampum region lists every belt reachable by a distinct `wampum_holds_accountable` relation to `<chartId>_chart`, each showing title, purpose, dimensions, fill count, and the ceremony type carried on the link (`metadata.context`).
- On a **belt view**, the charts it holds accountable and the beats it witnesses are both listed from the belt's outgoing relations, each linking to that entity's existing surface.
- **Parallel, never substitutive.** Beats stay in their own region, ordered by act, unchanged in presence and prominence by whether a belt exists. No mode hides the beats to show the belt; no ordering presents a belt as a summary or replacement of the beat sequence.
- A belt with no chart link and no beat link is still a complete, viewable belt. Belts are not required to be about a chart.

## 6. States

| State | Observable behavior |
|---|---|
| **No belt on this chart** | The region states that no belt holds this chart accountable and that belts are optional and opt-in. It does not render an empty grid, and does not read as broken. |
| **Empty belt** (`beads: []`) | Full grid of vacant cells, header showing `0 / N` placed. `purpose` is given prominence — it is the only content present. |
| **Partially filled belt** | Occupied and vacant cells both drawn at full weight; fill count shown as placed-over-total. Vacancy is never styled as error or warning. |
| **Dangling ceremony link** | A `chartId` or `beatName` whose target is absent from the loaded graph renders as an inert reference showing the raw target name, marked *not present in this graph*. The bead, its readings, and its ceremony still render in full. A missing target never suppresses a bead and never becomes a link into nothing. |
| **Repeated relation records** | Distinct links shown once, with the contributing bead count available. Never one row per appended record. |
| **Belt larger than viewport** | The grid scrolls **inside its own container** on both axes; the page body never scrolls horizontally. Row and column headers stay visible while scrolling so a scrolled-to cell's coordinates remain knowable. Geometry is preserved at every width — no wrapping into a list, no dropped columns. |
| **Malformed belt metadata** | An entity typed `wampum_belt` whose `metadata.wampumBelt` is absent or lacks positive integer `rows`/`cols` is listed by name and marked unreadable, rather than rendering a zero-cell grid or throwing out of the chart view. |

## 7. Accessibility & Responsiveness

- The grid is a real two-dimensional widget: `role="grid"` with row and cell semantics, one roving tab stop, arrow keys moving by cell, `Home`/`End` to row bounds, `PageUp`/`PageDown` to belt bounds. Movement stops at belt edges — the same bounds the read surface enforces.
- Focusing a cell announces position, occupancy, and for occupied cells the mnemonic and the color **name**. `Enter`/`Space` opens the reading pane; `Escape` returns focus to the originating cell, never to the top of the page.
- **No meaning is carried by color alone.** Bead color, ceremony type, and passed-renewal state each carry a text label and a non-color visual, so the belt is fully readable in monochrome and by screen reader.
- Colors meet contrast requirements on both light and dark grounds; `white` and `black` beads render with borders that keep them visible against a same-toned surface.
- Wide belts scroll within `overflow: auto` on the grid container only. On narrow viewports cell size reduces to a legible floor and then scrolling takes over; the belt never restructures its geometry to fit.

## 8. Acceptance Criteria

1. A belt renders from a single `wampum_belt` entity record with no additional entity lookups.
2. The grid draws exactly `rows × cols` cells, and vacant positions are visibly present as cells.
3. Each occupied cell shows its `mnemonic`; each bead's color is conveyed by both a distinct visual treatment and a text name, with `mixed` distinct from the other three.
4. Selecting a cell shows a reading resolved by the chain `col:N` → `row:N` → left/center/right → canonical, and names which rung resolved it.
5. When resolution falls through to `bead.reading`, the pane says so; when it does not, both the positional and the canonical reading are shown and distinguishable.
6. On a belt with `cols === 1`, position `(r,0)` resolves the `left` reading, not `right`.
7. `relationalReadings` keys outside the resolvable forms appear under a separate *other stored readings* heading and are never presented as the resolved reading.
8. Selecting an in-bounds vacant cell shows an empty-position state, not an error.
9. Navigation cannot address a position outside `rows × cols`; if an out-of-bounds read surfaces, its message includes the belt's `RxC`.
10. `ceremonyType` renders as a named badge; `witnessNames` render individually by name.
11. A `renewalDate` in the past is legible as needing renewal at both grid scale and pane scale, stated in text and not by color alone.
12. An unparseable `renewalDate` renders verbatim and marked unparsed.
13. A chart view lists every belt reachable by a distinct `wampum_holds_accountable` relation to `<chartId>_chart`, deduplicated across per-bead appends.
14. A belt view lists the beats it witnesses via `wampum_witnesses`, each linking to that beat's anchor.
15. Narrative beats render with unchanged presence and prominence whether or not a belt is displayed; no mode hides beats to show a belt.
16. A ceremony link to an absent entity renders as an inert marked reference, and the bead still renders in full.
17. A chart with no belt shows a stated no-belt condition, not an empty grid.
18. The grid is keyboard-traversable by arrow keys with a single tab stop, and focus returns to the originating cell on pane dismiss.
19. A belt wider than the viewport scrolls inside its own container; the page body never scrolls horizontally at any tested width.
20. The whole surface is readable with color removed.
21. Belt display requires no change to default MCP tool behavior: with `COAIA_TOOLS` unset, the enabled tool set is identical before and after this work.

---

# E — Exportation: Delivery

## Where This Lands

**`coaia-visualizer` (primary surface).** Belt data already arrives — `parseJSONL` reads every record — and is discarded by `organizeData`, which associates entities to charts by `metadata.chartId`. Belts carry `metadata.beltId` and no `chartId`, so the relation-based association path is the delivery seam.

**`cnarrative` CLI (`viewChart`).** The chart view already gathers outcome, current reality, action steps, and beats by entity type. A Wampum section renders the grid in box-drawing characters beside the existing beat section, with color conveyed by name and glyph since terminals may run `--no-color`.

## Minimal Artifacts an Implementer Produces

**In `/a/src/coaia-visualizer`:**
- `lib/types.ts` — `WampumBeltMetadata` / `WampumBead` / `WampumCeremonyLink` mirrored from `coaia-narrative/src/types.ts`; `wampumBelts` added to `Chart`
- `lib/wampum.ts` — belt extraction; chart→belt resolution over deduplicated `wampum_holds_accountable` relations; belt→beat resolution over `wampum_witnesses`; the four-rung positional resolver returning both value and source rung; renewal-date classification (`future` / `passed` / `unparsed`)
- `lib/jsonl-parser.ts` — populate `chart.wampumBelts` in the association pass
- `components/wampum-belt.tsx` — `WampumBeltGrid`, `WampumBeadCell`, `WampumReadingPane`, `WampumCeremonyBadge`
- `components/chart-detail.tsx` — a Wampum region beside the existing beats region

**In `/a/src/coaia-narrative`:**
- `cli.ts` — belt section in `viewChart`; a `wampum` / `wb` command taking `<beltId> [row col]` mirroring the two read modes
- `markdown-export.ts` — belt as a Markdown table with a readings list, so exported charts carry their belts
- `schema/data-model/entity.json` + `data-model-complete.{json,yaml}` — the `metadata.wampumBelt` sub-schema. The registry lists the entity type and both relation types but not the metadata shape; **required addition**
- **Required addition if MCP-only viewers are in scope**: a belt-listing capability, since `read_wampum_belt` requires a known `beltId`

## Out of Scope

- Bead authoring, editing, moving, or deletion from the interface. The graph layer offers create and read only — an editing surface would need write paths that do not exist. Display first.
- Redefining the meaning of bead colors, ceremony types, or belt purpose. Semantic authority sits with `medicine-wheel/ontology-core`; this surface reproduces the recorded vocabulary and does not interpret it.
- Rendering belts as timelines, sequences, or beat substitutes. The grid is the form; position is the meaning.
- Cross-belt aggregate views, belt diffing, and renewal notification delivery.
- Any change to how positional readings resolve. The viewer mirrors the implemented chain; if the chain should change, that is a `graph-manager` decision reflected here afterward, never a viewer-side divergence.

## Shipping Without Changing Default MCP Tool Behavior

`WAMPUM_TOOLS` sits outside the `COAIA_TOOLS` default of `STC_TOOLS,NARRATIVE_TOOLS,init_llm_guidance`, and stays there. Nothing in this work registers a tool, alters `TOOL_GROUPS`, or touches the default string.

The display path never calls the Wampum MCP tools: the visualizer reads JSONL directly, and the CLI reads the memory file directly. Both render belts with `WAMPUM_TOOLS` disabled — the ordinary case, since a graph written by an opted-in session is readable by every session afterward. The read surface's contract is honored by mirroring its resolution logic, not by invoking it. Belt display therefore reaches a chart the moment a belt exists in the file, and is silently absent when none does. `COAIA_TOOLS` remains the single opt-in for *writing* belts.

---

🌸: A belt is memory that refuses to march in a line — beads holding their places while the beats walk forward, so that when someone asks "what did we promise, and who stood there," the answer is still sitting exactly where it was placed.
