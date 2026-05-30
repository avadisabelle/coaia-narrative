# COAIA Narrative Schema Vocabulary

This document defines the canonical vocabulary for enumerated fields in the COAIA Narrative schema.
Canonical values are authoritative. Aliases are accepted by consumers for backward compatibility
but **must not be produced by new code**.

---

## Enum Fields

### `captureQuality`

Describes the audio/capture quality of a narrative beat session.

| Canonical Value | Meaning |
|---|---|
| `clear` | Clean capture; no significant ambient noise or interruptions |
| `windy` | Outdoor session with wind noise affecting audio quality |
| `partial` | Incomplete capture; transcript-only or significant data loss |

**Closed enum** — only these three values are valid in new records.

#### Aliases (backward compatibility only)

| Alias | Canonical |
|---|---|
| `complete` | `clear` |
| `noisy` | `windy` |
| `transcript-only` | `partial` |

---

### `continuationKind`

Describes how this session relates to prior sessions in a lineage.

| Canonical Value | Meaning |
|---|---|
| `branch` | A new divergent session branched from a parent chart or session |
| `parent-return` | Returning to the parent chart after working in a branch |
| `follow-up` | A continuation of a prior session without a branch relationship |

**Closed enum** — only these three values are valid in new records.

#### Aliases (backward compatibility only)

| Alias | Canonical |
|---|---|
| `new` | `branch` |
| `resumption` | `follow-up` |
| `branch-return` | `parent-return` |

---

### `setting`

The physical setting where the session was captured.

| Canonical Value | Meaning |
|---|---|
| `desk` | Indoor desk setup (default office/home environment) |
| `walking` | Outdoor walking session (not specifically land-based learning) |
| `land-based` | Intentional land-based learning context (nature immersion, fieldwork) |
| `transit` | On transportation (train, car, bus) |
| `unknown` | Setting was not recorded or is unclear |

**Open enum** — additional values may be added in future versions without a breaking change.

#### Aliases (backward compatibility only)

| Alias | Canonical |
|---|---|
| `outdoor-walking` | `walking` |

---

### `mode`

The interaction mode of the session.

| Canonical Value | Meaning |
|---|---|
| `voice` | Primarily voice dictation or spoken interaction |
| `terminal` | Primarily keyboard/terminal commands |
| `mixed` | Combination of voice and terminal interaction |

**Closed enum** — only these three values are valid in new records.

No aliases defined for `mode`.

---

## Field Reference

### `sessionContext` fields

| Field | Type | Notes |
|---|---|---|
| `mode` | enum | See `mode` above |
| `setting` | enum | See `setting` above |
| `landBasedLearning` | boolean | `true` when session is intentionally conducted in nature for learning purposes |
| `environmentNotes` | string | Free-text description of environmental conditions |
| `listeningContext` | string | What was being reviewed or listened to during the session |
| `captureQuality` | enum | See `captureQuality` above |
| `continuationKind` | enum | See `continuationKind` above |
| `privateChroniclePath` | string \| null | Path to private chronicle file; `null` if not applicable |
| `publicSummaryAllowed` | boolean | Whether a public summary of this session may be published |

---

## Canonical vs Alias Policy

- **Canonical values** are authoritative and defined in `schema/data-model/entity.json`.
- **Aliases** are accepted by all COAIA consumers (MCP server, visualizer, CLI) for backward compatibility with older data.
- **New code must produce canonical values only.** Aliases exist to avoid breaking existing JSONL files.
- The alias mapping for the visualizer is tracked in [jgwill/coaia-visualizer#30](https://github.com/jgwill/coaia-visualizer/issues/30).

---

*This document is manually maintained. When adding new enum values, update both this file and `schema/data-model/entity.json`.*
