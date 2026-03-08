# Miadi-18 Submodule Integration
## RISE Specification for coaia-narrative Schema Authority

**Component Purpose**: Define how coaia-narrative provides authoritative schema access to Miadi-18 through a git submodule relationship, enabling dual-path architecture where the submodule serves as reference authority and local mirrors provide runtime efficiency.

---

## 🎯 Desired Outcome

coaia-narrative is consumed by Miadi-18 as a git submodule at `lib/coaia-narrative/`, providing:

- **Schema Authority**: Miadi-18 always has access to the canonical Entity, Relation, and JSONL storage definitions
- **Versioned Reference**: Submodule pinning ensures Miadi-18 can advance at its own pace while tracking upstream evolution
- **Dual-Path Architecture**: Local type mirrors at `lib/coaia/` maintain runtime independence; submodule provides ground truth for validation and synchronization
- **Zero-Drift Guarantee**: A clear workflow exists to detect and resolve schema divergence between authority and mirrors

---

## 📋 Natural Language Describing Functional Aspects

### Current Reality

Miadi-18 has established a dual-path integration with coaia-narrative:

1. **Submodule** at `Miadi-18/lib/coaia-narrative/` — full coaia-narrative repository pinned to a specific commit
2. **Local mirrors** at `Miadi-18/lib/coaia/` — three TypeScript files (`types.ts`, `jsonl-parser.ts`, `chart-editor.ts`) that intentionally align with coaia-narrative's schema

Schema compatibility is A+ — the alignment is intentional, not coincidental. The local mirrors were authored with direct reference to coaia-narrative's canonical types.

### Structural Tension

The submodule exists but lacks a documented workflow for:
- When and how to update the submodule pointer
- How to detect schema drift between `lib/coaia-narrative/` (authority) and `lib/coaia/` (mirrors)
- Who is accountable for synchronization

This specification resolves that tension by defining the update workflow and drift detection strategy.

---

## 🌊 Structural Tension Dynamics

| Element | State |
|---------|-------|
| **Desired Outcome** | coaia-narrative schema changes propagate reliably to Miadi-18 with zero silent drift |
| **Current Reality** | Submodule is in place; mirrors are aligned; no automated drift detection exists |
| **Tension** | Schema evolution in coaia-narrative could silently diverge from Miadi-18's local mirrors |
| **Resolution Path** | Documented update workflow + recommended drift detection |

---

## 🔧 Implementation Requirements

### Submodule Update Workflow

```bash
# From Miadi-18 root:
cd lib/coaia-narrative
git fetch origin
git checkout <target-commit-or-tag>
cd ../..
git add lib/coaia-narrative
git commit -m "chore: update coaia-narrative submodule to <version>"
```

### Schema Drift Detection (Recommended)

Compare canonical types against local mirrors:

```bash
# Quick diff of type definitions
diff <(grep -E "^(export |interface |type )" lib/coaia-narrative/src/types.ts 2>/dev/null || echo "N/A") \
     <(grep -E "^(export |interface |type )" lib/coaia/types.ts 2>/dev/null || echo "N/A")
```

A CI check or pre-commit hook could automate this comparison to flag divergence early.

### Responsibilities

| Path | Role | Owner |
|------|------|-------|
| `lib/coaia-narrative/` | Schema authority (read-only reference) | coaia-narrative upstream |
| `lib/coaia/types.ts` | Runtime type definitions | Miadi-18 maintainers |
| `lib/coaia/jsonl-parser.ts` | JSONL parsing for STC bots | Miadi-18 maintainers |
| `lib/coaia/chart-editor.ts` | Chart editing operations | Miadi-18 maintainers |

### Update Triggers

Update the submodule when:
- coaia-narrative releases a new schema version (Entity/Relation type changes)
- New MCP tools are added that Miadi-18's STC bots should consume
- Narrative beat or chart creation workflows gain new fields

---

## ✅ Quality Criteria

### Schema Authority Maintained
- ✅ Submodule points to a tagged or known-good commit of coaia-narrative
- ✅ Local mirrors in `lib/coaia/` align with submodule's type definitions
- ✅ No runtime code imports directly from `lib/coaia-narrative/` (submodule is reference, not runtime dependency)

### Update Workflow Clear
- ✅ Submodule update requires explicit commit in Miadi-18
- ✅ Schema drift is detectable through type signature comparison
- ✅ Responsibility boundaries between upstream authority and local mirrors are documented

### Integration Non-Disruptive
- ✅ Miadi-18 can function with stale submodule (local mirrors are self-sufficient)
- ✅ Submodule update does not require code changes unless schema has breaking changes
- ✅ Dual-path architecture preserves both authority and independence

---

## 🔗 Related Components

- **Miadi-18 integration spec**: `/src/Miadi-18/rispecs/coaia-narrative-integration.spec.md`
- **Miadi-18 kinship companion**: `/src/Miadi-18/rispecs/coaia-narrative-integration.kin.md`
- **coaia-narrative KINSHIP**: `/src/coaia-narrative/KINSHIP.md`
- **Miadi-18 KINSHIP**: `/src/Miadi-18/KINSHIP.md`
- **STC creation spec**: `/src/coaia-narrative/rispecs/structural_tension_chart_creation.spec.md`
- **coaia-narrative MCP tools**: `/src/coaia-narrative/rispecs/mcp_tool_interface.spec.md`

---

*Authored: 2026-03-08. PDE: 2603071908--b0e24122-f0f4-450d-bd71-31ced261ea0e (NORTH direction).*
