# Input Validation & Integrity Component
## RISE Specification for Multi-LLM Compatibility

**Component Purpose**: Ensure all inputs to the system are strictly validated against pre-defined schemas, providing consistent behavior and helpful error messages across different LLM clients (Claude, Gemini, etc.).

---

## 🎯 What This Component Enables Users to Create

- **Reliable Integrations**: Developers can build on top of the MCP server with confidence that data structures are enforced.
- **Self-Correcting LLMs**: AI models receive precise feedback when they provide invalid parameters, allowing them to fix requests autonomously.
- **Data Consistency**: Prevents malformed data from ever reaching the storage layer, protecting the integrity of the knowledge graph.
- **Type-Safe Tool Handlers**: Internal handlers operate on guaranteed data types, reducing runtime exceptions.

---

## 📋 Natural Language Describing Functional Aspects

### Strict Validation Flow

**LLM Calls Tool with Missing Field**:
```json
{
  "name": "create_structural_tension_chart",
  "arguments": {
    "desiredOutcome": "Create a new app"
  }
}
```
**System Response**:
- Identifies missing `currentReality` and `dueDate`.
- Returns a structured error: `Missing required field: currentReality`.
- No chart is created; storage remains clean.

**LLM Calls Tool with Invalid Type**:
```json
{
  "name": "mark_action_complete",
  "arguments": {
    "actionStepName": 123
  }
}
```
**System Response**:
- Identifies that `actionStepName` must be a string.
- Returns error: `actionStepName must be a string, got number`.

---

## 🔧 Implementation Requirements

### Supported Validation Types
- `string`: length constraints, regex patterns, enum values.
- `number`: min/max value constraints.
- `boolean`: strict boolean check.
- `date`: strict ISO 8601 string validation.
- `array`: item type validation, min/max length.
- `object`: recursive property validation.
- `enum`: strict inclusion in allowed values.

### Core Validation Engine
```typescript
interface ValidationRule {
  type: ValidationType;
  required?: boolean;
  minLength?: number;
  pattern?: RegExp;
  enumValues?: any[];
  items?: ValidationRule;
  properties?: Record<string, ValidationRule>;
}

function validate(args: any, schema: ValidationSchema): { valid: boolean; error?: string };
```

### Pre-built Patterns
| Schema Name | Target structure |
|---|---|
| `stringArray` | Required non-empty array of strings |
| `entityArray` | Array of objects with name, entityType, observations |
| `relationArray` | Array of objects with from, to, relationType |
| `isoDate` | Required ISO date string |
| `nonEmptyString`| Required string with length > 0 |

---

## ✅ Quality Criteria

### Robustness
- ✅ Recursive validation for nested objects and arrays.
- ✅ Graceful handling of null or undefined non-required fields.
- ✅ Type checking precedes all other constraints.

### Error Clarity
- ✅ Error messages include the parameter path (e.g., `entities[0].name`).
- ✅ Error messages specify both the expected type and the received type.
- ✅ Validation fails early—no partial processing of invalid requests.

### Compatibility
- ✅ All MCP tool handlers MUST use the validation engine.
- ✅ Schemas are kept in sync with MCP tool definitions.

---

## 🔗 Related Components

- **MCP Tool Interface**: Uses these schemas to validate incoming tool calls.
- **Storage Knowledge Graph**: Protected by this layer from corrupted data.
- **Educational Guidance**: Validation errors act as "just-in-time" methodology teaching.

---

**This specification ensures the system remains a "Fortress of Integrity," where only valid, high-quality data is allowed to shape the creative journey.**
