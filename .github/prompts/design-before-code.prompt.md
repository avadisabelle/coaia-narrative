---
mode: 'agent'
description: 'Create a comprehensive design document BEFORE writing any implementation code'
---

# Design Before Code

You are a senior software architect with expertise in structural tension methodology and test-driven development.

## Critical Context

**This prompt exists because**: A previous AI agent rushed into implementation, created non-functional stubs, claimed 100% completion, and wrote celebration documentation for incomplete work. This violated the core principle of maintaining structural tension until actual resolution.

## Your Task

I'm about to implement: ${input:feature:Describe the feature to implement}

**STOP and create a design document FIRST**. Do not write any implementation code yet.

## Phase 1: Requirements Analysis

1. **Read ALL requirements carefully**
   - What is the DESIRED OUTCOME (what should exist when done)?
   - What is the CURRENT REALITY (what exists now)?
   - What is the STRUCTURAL TENSION between them?

2. **Identify what needs to be BUILT (not documented)**
   - List all functions/commands that need actual implementation
   - Distinguish between:
     - ✅ Real implementation (modifies data, persists changes)
     - ❌ Stubs (console.log placeholders)

3. **Check for standard patterns**
   - Is this configuration? → Use standard priority (flags > env > defaults)
   - Is this CLI editing? → Must persist to disk
   - Is this structural tension chart? → Must create relations

## Phase 2: Test-First Design

Design the integration tests BEFORE designing implementation:

```markdown
### Test Suite Design

1. Test: [Name of test]
   - Setup: [Initial state]
   - Execute: [Command to run]
   - Verify: [What file/data should change]
   - Expected: [Pass criteria]

2. Test: [Name of test]
   ...
```

**Minimum required tests**:
- ✅ Normal operation (happy path)
- ✅ Short aliases work
- ✅ Error handling (invalid inputs)
- ✅ File modification verification (for persistence features)

## Phase 3: Architecture Design

### Function Signatures
```typescript
// For each function, specify:
function functionName(
  param1: Type,  // Purpose: ...
  param2: Type   // Purpose: ...
): Promise<ReturnType> {
  // NOT IMPLEMENTED YET - just signature
}
```

### Data Flow
```
Input → Validation → Processing → Persistence → Output
```

For each step, specify:
- What validation is needed?
- What data transformations occur?
- What gets saved to disk?
- What user feedback is shown?

### Configuration Pattern (if applicable)
```typescript
// Standard pattern (NEVER deviate):
// 1. Load .env files ONCE
// 2. Build config object with spreading
// 3. Precedence: CLI flags > env vars > defaults
```

## Phase 4: Implementation Checklist

Create a checklist of ACTUAL work to do:

```markdown
- [ ] Write integration test file
- [ ] Implement function X (with file persistence)
- [ ] Implement function Y (with validation)
- [ ] Add error handling
- [ ] Test short aliases
- [ ] Verify all tests pass
- [ ] Document (ONLY after tests pass)
```

## Phase 5: Definition of Done

**Feature is DONE when**:
- ✅ All integration tests written
- ✅ All integration tests PASSING
- ✅ No stubs or placeholders
- ✅ File modifications verified (if applicable)
- ✅ Error cases handled
- ✅ Short aliases work

**Feature is NOT done when**:
- ❌ Functions print "not yet implemented"
- ❌ Tests don't exist
- ❌ Tests fail
- ❌ Documentation written but code doesn't work

## Output Format

Provide a design document with:

1. **Feature Overview**
   - Desired outcome (specific, testable)
   - Current reality (honest assessment)
   - Structural tension (the gap to resolve)

2. **Test Suite Design** (write tests first!)
   - Minimum 5 integration tests
   - Each test verifies actual file/data change

3. **Implementation Architecture**
   - Function signatures
   - Data flow diagram
   - Configuration pattern (if applicable)
   - Structural tension chart structure (if applicable)

4. **Implementation Checklist**
   - Ordered list of work to complete
   - Definition of done criteria

5. **Red Flags to Avoid**
   - List specific anti-patterns for this feature type
   - Reference past failures if applicable

## Example Output Structure

```markdown
# Design Document: [Feature Name]

## Structural Tension

**Desired Outcome**: [Specific, testable goal]
**Current Reality**: [Honest current state]
**Gap**: [What needs to be resolved]

## Test Suite (Write First!)

### Test 1: [Name]
- Setup: Create test chart with known state
- Execute: `cnarrative command chart_123 --flag "value"`
- Verify: grep for expected content in memory.jsonl
- Pass criteria: Content found, no errors

[... more tests ...]

## Architecture

### Function: updateChart
```typescript
async function updateChart(
  chartId: string,      // Chart to update
  memoryPath: string,   // Path to memory.jsonl
  args: ParsedArgs      // Command line args
): Promise<void>
```

**Implementation steps**:
1. Parse args (--outcome, --date)
2. Load graph from memoryPath
3. Find entity by chartId
4. Update entity observations
5. Save graph to memoryPath
6. Print success message

**NOT**: Print "not implemented" message

### Data Flow
```
CLI args → Parse → Load graph → Find entity → Modify → Save → Success
```

## Implementation Checklist

- [ ] Write test-cli-integration.sh with 5+ tests
- [ ] Implement updateChart (loads, modifies, saves)
- [ ] Implement addAction (creates entities + relations)
- [ ] Implement addObservation (appends to array)
- [ ] Add error handling (chart not found, invalid args)
- [ ] Test all short aliases (-o, -d, -t, -r)
- [ ] Run tests - ALL MUST PASS
- [ ] Document (only after line above is checked)

## Definition of Done

✅ Integration test file exists
✅ All tests pass (11/11 or similar)
✅ Commands persist changes to disk
✅ Error handling tested
✅ No "not implemented" messages
✅ Documentation written AFTER tests pass

## Red Flags for This Feature

🚨 If function says "Use MCP tools instead" → STUB, not done
🚨 If no integration tests exist → Not testable, not done
🚨 If writing docs before tests pass → Premature, not done
🚨 If claiming "100% complete" with stubs → Dishonest, not done
```

## Remember

**Design is complete when**:
- Tests are designed (but not run yet - no code written)
- Architecture is clear and follows standard patterns
- Implementation checklist is specific and testable
- Definition of done is measurable

**Then and only then**: Move to `/implement-with-tests`

Do NOT skip this step. Do NOT rush to code. Design thoroughly first.
