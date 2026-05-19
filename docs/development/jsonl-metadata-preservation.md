# JSONL Metadata Preservation

COAIA writer operations preserve rich JSONL records by default. Chart, action-step, relation, and narrative-beat updates must mutate only the intended fields and keep unrelated metadata intact.

This contract exists for `avadisabelle/coaia-narrative#35` and downstream visualizers such as `jgwill/coaia-visualizer`.

## Expectations

- Unknown top-level fields survive read/write cycles.
- Unknown `metadata` fields survive chart and action updates.
- `metadata.github` is protected and must remain unchanged unless a future operation explicitly edits GitHub provenance.
- Legacy `type: "narrative_beat"` records remain narrative-beat records instead of being flattened into generic entities.
- Narrative beat fields such as `metadata.narrative`, `metadata.fourDirections`, `metadata.relationalAlignment`, and extension metadata survive unrelated chart/action writes.
- Writer serialization validates before/after shape and throws a clear error if protected metadata would be dropped.

## Fixture

Run the preservation fixture with:

```sh
npm run test:preservation
```

The fixture writes a mixed JSONL file containing a structural tension chart, action step, narrative beat, relation, nested `metadata.github`, runtime provenance, and unknown extension fields. It then performs chart/action writer updates and asserts the rich metadata is still present.
