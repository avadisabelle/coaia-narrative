# COAIA Narrative JSONL Schema

## Overview

This directory contains the JSON Schema and TypeScript types for the **COAIA Narrative JSONL data format**. This schema documents the exact structure used by `coaia-narrative` for storing structural tension charts.

## Files

- **`coaia-narrative-jsonl.schema.json`** - JSON Schema (Draft 7) defining the JSONL format
- **`../src/types/coaia-jsonl.ts`** - TypeScript type definitions

## Purpose

The schema enables **direct file access** to chart data without requiring the MCP (Model Context Protocol) server. Any tool or application can:

1. Read chart data directly from `.jsonl` files
2. Create new charts by writing valid JSONL records
3. Update charts by appending new entities/relations
4. Validate data against the schema

## JSONL Format

Each line in the file is a JSON object representing either:
- An **Entity** (chart component)
- A **Relation** (connection between entities)

### Entity Line

```json
{
  "type": "entity",
  "name": "chart_1234567890123_desired_outcome",
  "entityType": "desired_outcome",
  "observations": ["Build chart system"],
  "metadata": {
    "chartId": "chart_1234567890123",
    "dueDate": "2026-02-01",
    "createdAt": "2026-01-26T04:29:57.348Z",
    "updatedAt": "2026-01-26T04:29:57.348Z"
  }
}
```

### Relation Line

```json
{
  "type": "relation",
  "from": "chart_1234567890123_current_reality",
  "to": "chart_1234567890123_desired_outcome",
  "relationType": "creates_tension_with",
  "metadata": {
    "createdAt": "2026-01-26T04:29:57.348Z"
  }
}
```

## Entity Types

| Type | Description | Example Name |
|------|-------------|--------------|
| `structural_tension_chart` | Master chart entity | `chart_1234567890123_chart` |
| `desired_outcome` | What you want to create | `chart_1234567890123_desired_outcome` |
| `current_reality` | Current state/observations | `chart_1234567890123_current_reality` |
| `action_step` | Action item (can telescope) | `chart_1234567890123_action_1` |
| `narrative_beat` | Story progression marker | `beat_1234567890123` |

## Relation Types

| Type | Description | Example |
|------|-------------|---------|
| `contains` | Chart contains component | chart → desired_outcome |
| `creates_tension_with` | Structural tension | current_reality → desired_outcome |
| `parent_of` | Hierarchy | master_chart → sub_chart |
| `telescoped_from` | Action expanded to chart | sub_chart ← action_step |
| `depends_on` | Dependency | action_2 → action_1 |
| `blocks` | Blocking relationship | action_1 → action_2 |

## Metadata Fields

### Entity Metadata

```typescript
{
  chartId?: string;              // "chart_1234567890123"
  dueDate?: string;              // "2026-02-01" (ISO date)
  level?: number;                // 0=master, 1+=telescoped
  phase?: string;                // "germination" | "assimilation" | "completion"
  completionStatus?: boolean;    // For action steps
  parentChart?: string;          // For telescoped charts
  parentActionStep?: string;     // For telescoped actions
  createdAt?: string;            // ISO timestamp
  updatedAt?: string;            // ISO timestamp
}
```

### Relation Metadata

```typescript
{
  createdAt?: string;            // ISO timestamp
  strength?: number;             // 0-1 (relation strength)
  context?: string;              // Contextual info
  description?: string;          // Human-readable description
}
```

## Chart Structure

A complete structural tension chart consists of:

### Minimum Chart (3 entities + 3 relations)

1. **Chart entity** - `structural_tension_chart`
2. **Desired outcome entity** - `desired_outcome`
3. **Current reality entity** - `current_reality`
4. **Contains relation** - chart → desired_outcome
5. **Contains relation** - chart → current_reality
6. **Tension relation** - current_reality → desired_outcome

### With Action Steps

For each action step, add:
- **Action step entity** - `action_step`
- **Contains relation** - chart → action_step

### Telescoped Charts

When an action step is expanded into a sub-chart:
- Create a new chart with all standard entities
- Add `parentChart` and `parentActionStep` metadata
- Create `telescoped_from` relation

## Usage Examples

### TypeScript (Direct File Access)

```typescript
import { readFileSync } from 'fs';
import type { CoaiaJsonlLine, StructuralTensionChart } from './types/coaia-jsonl.js';

// Read JSONL file
const lines = readFileSync('chart.jsonl', 'utf8')
  .split('\n')
  .filter(line => line.trim())
  .map(line => JSON.parse(line) as CoaiaJsonlLine);

// Filter entities
const entities = lines.filter(line => line.type === 'entity');

// Find charts
const charts = entities.filter(e =>
  e.entityType === 'structural_tension_chart'
);
```

### Python (Direct File Access)

```python
import json
from typing import List, Dict

def read_charts(filepath: str) -> List[Dict]:
    charts = []
    entities = []

    with open(filepath, 'r') as f:
        for line in f:
            data = json.loads(line.strip())
            if data['type'] == 'entity':
                entities.append(data)

    for entity in entities:
        if entity['entityType'] == 'structural_tension_chart':
            chart_id = entity['metadata']['chartId']
            # Find related entities...
            charts.append({
                'chartId': chart_id,
                # ... build chart structure
            })

    return charts
```

### Bash (Direct File Access)

```bash
# Count charts
grep '"entityType":"structural_tension_chart"' chart.jsonl | wc -l

# Extract all desired outcomes
jq -r 'select(.entityType == "desired_outcome") | .observations[0]' chart.jsonl

# List chart IDs
jq -r 'select(.entityType == "structural_tension_chart") | .metadata.chartId' chart.jsonl
```

## Benefits of Direct File Access

1. **No MCP Server Required** - Read/write without spawning processes
2. **Language Agnostic** - Works with any language that can read JSON
3. **Debuggable** - Human-readable format in any text editor
4. **Append-Only** - Simple append for updates (no file rewriting)
5. **Version Control Friendly** - Line-based format works well with git
6. **Schema Validated** - Can validate against JSON Schema

## Integration with MCP

While direct file access is possible, `coaia-narrative` MCP server provides:
- Helper functions (telescoping, progress tracking)
- Validation and error handling
- IAIP integration (four directions, relational alignment)
- Narrative beat management
- Complex queries

Use direct file access for:
- Simple chart listing
- Read-only operations
- Custom visualizations
- Integration with non-MCP tools

Use MCP server for:
- Chart creation with validation
- Telescoping action steps
- Narrative beat creation
- Four directions inquiry

## Schema Validation

Using JSON Schema validators:

### Node.js (AJV)

```typescript
import Ajv from 'ajv';
import schema from './schema/coaia-narrative-jsonl.schema.json';

const ajv = new Ajv();
const validate = ajv.compile(schema);

const line = JSON.parse('...');
if (validate(line)) {
  console.log('Valid JSONL line');
} else {
  console.error('Invalid:', validate.errors);
}
```

### Python (jsonschema)

```python
import json
from jsonschema import validate, ValidationError

with open('schema.json') as f:
    schema = json.load(f)

with open('chart.jsonl') as f:
    for line in f:
        try:
            data = json.loads(line)
            validate(instance=data, schema=schema)
        except ValidationError as e:
            print(f"Invalid line: {e.message}")
```

## File Naming Conventions

Common naming patterns:
- `chart.jsonl` - Default project chart
- `{chartId}.jsonl` - Chart-specific file
- `{project}-chart.jsonl` - Project-scoped charts
- `.miadi/chart.jsonl` - Miadi-code default
- `.miadi/sessions/{sessionId}/chart.jsonl` - Session-specific

## Version History

- **v0.10.1** (2026-01-26) - Initial schema extraction from coaia-narrative
- **v1.0.0** (Future) - Formal schema versioning

## Contributing

To update this schema:
1. Check source of truth: `/src/coaia-narrative/index.ts`
2. Update `coaia-narrative-jsonl.schema.json`
3. Update TypeScript types in `src/types/coaia-jsonl.ts`
4. Update this README with examples
5. Test with file-chart-client

## References

- [JSON Schema Draft 7](https://json-schema.org/draft-07/schema)
- [JSONL Format](https://jsonlines.org/)
- [coaia-narrative source](https://github.com/avadisabelle/coaia-narrative)
- [Structural Tension Charts](https://github.com/avadisabelle/coaia-narrative/blob/main/DESIGN.md)
