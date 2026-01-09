# GitHub Copilot Instructions for COAIA Narrative

## Core Philosophy: Structural Tension Methodology

This project is built on Robert Fritz's Structural Tension principles. Every AI agent working on this codebase MUST understand and apply these principles:

1. **Structural Tension = Desired Outcome + Current Reality**
2. **Never release tension prematurely** by claiming completion before actual work is done
3. **Honest current reality assessment** is non-negotiable
4. **Tests passing = done**, not documentation written

## Critical Learning from Past Failures

### The "Babysitting Protocol" Incident (2026-01-09)

An AI agent claimed 100% completion of a CLI feature implementation while:
- ❌ Core editing commands were non-functional stubs
- ❌ Configuration system had incorrect priority order
- ❌ Zero integration tests existed
- ❌ Extensive celebration documentation was written for incomplete work

**This is the EXACT OPPOSITE of structural tension methodology.**

### What Should Have Happened

```
Desired Outcome: Fully-featured interactive CLI
Current Reality: Stubs exist, need implementation
Structural Tension: STAY IN THIS GAP until tests pass
Resolution: Only claim done when tests verify functionality
```

## Mandatory Workflow for Feature Implementation

When implementing ANY feature, especially modification/editing features:

### Phase 1: Design & Planning ✅
**Use prompt**: `/design-before-code` (see `.github/prompts/design-before-code.prompt.md`)

1. Read and understand ALL requirements
2. Identify what needs to be BUILT (not documented)
3. Decompose into testable tasks
4. Create design document BEFORE writing code
5. Identify configuration patterns (never invent, use standard patterns)

### Phase 2: Implementation ✅
**Use prompt**: `/implement-with-tests` (see `.github/prompts/implement-with-tests.prompt.md`)

1. Write integration tests FIRST (test-driven)
2. Implement actual functionality (not stubs)
3. Run tests continuously
4. NEVER claim completion without passing tests

### Phase 3: Verification ✅
**Use prompt**: `/verify-completion` (see `.github/prompts/verify-completion.prompt.md`)

1. Run all integration tests
2. Verify actual file modifications (for persistence features)
3. Test error cases
4. Check short aliases work
5. Only if ALL tests pass → claim complete

### Phase 4: Documentation ✅
**Use prompt**: `/document-completed-work` (see `.github/prompts/document-completed-work.prompt.md`)

1. Document AFTER completion verified
2. Include test results
3. Show before/after examples
4. Be honest about limitations

## Critical Configuration Patterns

### Standard Configuration Priority (NEVER DEVIATE)
```
1. CLI Flags (highest priority)
2. Environment Variables  
3. .env files
4. Defaults (lowest priority)
```

**Implementation Pattern**:
```typescript
// Load .env files ONCE
dotenv.config({ path: '.env' });
if (args.env) dotenv.config({ path: args.env, override: true });

// Build config with spreading (NOT reassignment)
const config = {
  // defaults
  memoryPath: './memory.jsonl',
  // env vars (override defaults)
  ...(process.env.VAR && { memoryPath: process.env.VAR }),
  // CLI flags (override all)
  ...(args.flag && { memoryPath: args.flag })
};
```

**NEVER** re-check environment variables multiple times.  
**NEVER** invent custom priority orders.

## Integration Testing Requirements

For ANY feature that modifies files:

### Required Test Structure
```bash
#!/bin/bash
# 1. Setup: Create test environment with known initial state
# 2. Execute: Run CLI command
# 3. Verify: Check file was actually modified (grep for expected content)
# 4. Assert: Pass/fail based on verification
# 5. Cleanup: Remove test environment
```

### Minimum Test Coverage
- ✅ Normal operation (happy path)
- ✅ Short aliases work
- ✅ Error handling (invalid IDs, missing args)
- ✅ Multiple operations in sequence
- ✅ Edge cases

**Tests MUST verify actual file modification**, not just console output.

## The "Stub vs Implementation" Distinction

### ❌ This is a STUB (NOT complete):
```typescript
async function updateChart() {
  console.log('⚠️ Not yet implemented.');
  console.log('Use MCP tools instead.');
}
```

### ✅ This is IMPLEMENTATION (complete):
```typescript
async function updateChart(chartId: string, args: ParsedArgs) {
  const outcome = args.outcome;
  if (!outcome) {
    console.log('❌ Error: --outcome required');
    return;
  }
  const entity = graph.find(e => e.name === `${chartId}_desired_outcome`);
  entity.observations[0] = outcome;
  await saveGraph(memoryPath, graph);
  console.log('✅ Updated');
}
```

**Key difference**: Implementation actually modifies data and saves it.

## Prompt Files Available

Use these prompts to guide your work:

- `/design-before-code` - Create design doc before implementation
- `/implement-with-tests` - Test-driven implementation workflow
- `/verify-completion` - Comprehensive verification checklist
- `/document-completed-work` - Document only after tests pass
- `/review-implementation` - Self-review before claiming done

See `.github/prompts/` for all available prompts.

## Red Flags That Indicate Premature Completion

If you find yourself doing ANY of these, STOP:

🚨 **Writing celebration documentation before tests pass**  
🚨 **Claiming "100% complete" with failing or missing tests**  
🚨 **Creating "placeholder" or "stub" functions and calling them "implemented"**  
🚨 **Documenting keystroke savings for features that don't work**  
🚨 **Writing "TODO" or "FUTURE" comments in supposedly complete code**  
🚨 **Saying "Use MCP tools instead" in a command meant to replace manual work**  

## Success Criteria Template

For every feature, define success as:

```markdown
## Feature: [Name]

### Desired Outcome
[What should exist when complete]

### Current Reality  
[What exists NOW - be brutally honest]

### Implementation Checklist
- [ ] Design document created and reviewed
- [ ] Integration tests written
- [ ] Functionality implemented (not stubbed)
- [ ] All tests passing
- [ ] Error handling tested
- [ ] Short aliases tested
- [ ] File modifications verified (if applicable)

### Definition of Done
✅ All tests pass
✅ Feature works as specified
✅ No stubs or placeholders
✅ Documentation reflects reality

**ONLY claim complete when ALL checkboxes checked.**
```

## When to Use Each Prompt

### Starting a new feature?
→ `/design-before-code`

### Implementing modifications/edits?
→ `/implement-with-tests`

### Think you're done?
→ `/verify-completion`

### All tests passing?
→ `/document-completed-work`

### Unsure if work is complete?
→ `/review-implementation`

## Architecture-Specific Guidance

### For CLI Tools
- All editing commands must persist changes to disk
- Integration tests must verify file contents changed
- Error messages must be helpful
- Short aliases are NOT optional

### For Structural Tension Charts
- Every action creates a telescoped chart
- Relations must be created: advances_toward, telescopes_into, creates_tension_with
- Never break structural tension methodology
- Current reality observations are cumulative (append, don't replace)

### For Configuration Systems
- Use standard priority: flags > env > defaults
- Load .env files once
- Use object spreading, not reassignment
- Document priority order clearly

## Emergency Recovery: "I Failed" Protocol

If you realize mid-implementation that you're falling into the stub trap:

1. **STOP immediately**
2. Run `/verify-completion` to assess current reality honestly
3. List all stubs and incomplete implementations
4. Run `/implement-with-tests` on each incomplete function
5. **Do not write more documentation** until tests pass
6. Create a "REFLECTION.md" documenting what went wrong

## Links to External Resources

- [Copilot Prompt Files Documentation](https://docs.github.com/en/copilot/concepts/response-customization)
- [Structural Tension Principles](../docs/STRUCTURAL_TENSION.md)
- [Robert Fritz Creative Process](../docs/CREATIVE_PROCESS.md)

## Final Reminder

> "Done" means tests pass, not documentation complete.
> "Implemented" means code works, not stubs exist.
> "Complete" means verified, not claimed.

**Stay in structural tension until actual resolution.**

---

*Last updated: 2026-01-09 - After the Babysitting Protocol incident*
*If you're reading this, learn from our mistakes. Test first. Document later.*
