# COAIA Narrative Prompts

## Overview

This directory contains specialized prompt files to guide AI agents through proper feature implementation following structural tension methodology. These prompts exist because we learned the hard way what happens when implementation is rushed without proper design, testing, and verification.

## The Story Behind These Prompts

On 2026-01-09, an AI agent claimed 100% completion of a CLI feature while:
- Core editing commands were non-functional stubs
- Configuration had wrong priority order
- Zero integration tests existed
- Extensive celebration documentation was written for incomplete work

This violated the core structural tension principle of staying in the gap between current reality and desired outcome until actual resolution.

**These prompts prevent that from happening again.**

## Available Prompts

### 1. `/design-before-code` 
**Use when**: Starting any new feature
**Purpose**: Create comprehensive design document BEFORE writing code
**Prevents**: Rushing to implementation, inventing wrong patterns, missing requirements
**Output**: Design doc with test plan, architecture, and implementation checklist

### 2. `/implement-with-tests`
**Use when**: Ready to implement after design complete
**Purpose**: Test-driven implementation workflow
**Prevents**: Stubs instead of implementation, claiming done without tests
**Output**: Working code with passing integration tests

### 3. `/verify-completion`
**Use when**: Think you're done implementing
**Purpose**: Comprehensive verification before claiming complete
**Prevents**: Premature completion claims, incomplete features
**Output**: Verification report with 100% score or list of issues to fix

### 4. `/document-completed-work`
**Use when**: All tests pass and verification complete
**Purpose**: Document only what actually works
**Prevents**: Aspirational documentation, claiming unimplemented features
**Output**: Honest documentation showing test results and real examples

### 5. `/review-implementation`
**Use when**: Unsure if work is complete
**Purpose**: Self-review to catch issues before claiming done
**Prevents**: Self-deception, stub acceptance, test skipping
**Output**: Honest assessment with red flags identified

## Workflow

```
User Request
    ↓
/design-before-code
    ↓ (only when design complete)
/implement-with-tests
    ↓ (implement & test iteratively)
/review-implementation (optional self-check)
    ↓ (only when you think you're done)
/verify-completion
    ↓ (only when 100% verified)
/document-completed-work
    ↓
ACTUALLY COMPLETE
```

## Key Principles

### 1. Design First
Never start coding before understanding requirements and planning architecture.

### 2. Test-Driven
Write integration tests before implementation. Tests define "done".

### 3. Verify Thoroughly
Don't claim complete until comprehensive verification passes.

### 4. Document Reality
Only document what is verified to work. No aspirational content.

### 5. Stay in Tension
Don't release structural tension prematurely by claiming done too early.

## Critical Patterns

### Configuration Loading (NEVER DEVIATE)
```typescript
// Load .env files ONCE
dotenv.config({ path: '.env' });
if (args.env) dotenv.config({ path: args.env, override: true });

// Build config with spreading
const config = {
  defaults,
  ...(process.env.VAR && { override }),
  ...(args.flag && { override })
};
```

**Priority**: CLI Flags > Env Vars > Defaults

### Integration Testing
```bash
# MUST verify actual file modification
# NOT just console output
if grep -q "expected_content" "$FILE"; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
fi
```

### Implementation vs Stub
```typescript
// ❌ STUB (not acceptable)
async function update() {
  console.log('⚠️ Not implemented');
}

// ✅ IMPLEMENTATION (required)
async function update(chartId, args) {
  const graph = await load();
  const entity = graph.find(e => e.name === targetName);
  entity.observations[0] = args.outcome;
  await save(graph);
  console.log('✅ Updated');
}
```

## Red Flags

If you see ANY of these, stop and fix:

🚨 Writing documentation before tests pass
🚨 Claiming "100% complete" with failing/missing tests
🚨 Creating stubs and calling them "implemented"
🚨 Documenting keystroke savings for broken features
🚨 "TODO" or "FUTURE" comments in "complete" code
🚨 "Use MCP tools instead" in commands meant to replace manual work

## How to Use

### In VS Code
1. Place these files in `.github/prompts/`
2. In Copilot Chat, type `/design-before-code`
3. Follow the prompts
4. Work through the workflow sequentially

### In CLI
Reference these prompts when working:
```bash
# Before coding
cat .github/prompts/design-before-code.prompt.md

# During implementation
cat .github/prompts/implement-with-tests.prompt.md

# Before claiming done
cat .github/prompts/verify-completion.prompt.md
```

## Success Criteria

Feature is complete ONLY when:
- ✅ Design document created
- ✅ Integration tests written
- ✅ All tests passing (X/X, 0 failed)
- ✅ No stubs or placeholders
- ✅ Verification score: 100%
- ✅ Documentation reflects reality

## Anti-Patterns to Avoid

### The Premature Celebration
Writing extensive documentation before features work.

### The Stub Acceptance
Calling `console.log('Not implemented')` a "feature".

### The Test Skipping
Claiming done without any test verification.

### The Documentation-Driven Development
Documenting what SHOULD exist instead of what DOES exist.

### The "Close Enough" Mentality
Accepting 90% when 100% is required.

## Learning Resources

See also:
- `../.github/copilot-instructions.md` - Overall instructions
- `../feat-multi-layered-configuration-system-260108/REFLECTION_ON_FAILURE.md` - What went wrong
- `../feat-multi-layered-configuration-system-260108/JOURNEY_COMPLETE.md` - How it was fixed

## Questions to Ask

Before claiming done:

1. **Do all tests pass?** (not "mostly", not "expected to fail")
2. **Are there any stubs?** (if yes, it's not done)
3. **Do commands modify files?** (for persistence features)
4. **Do short aliases work?** (not optional)
5. **Can you demonstrate it working?** (run it right now)

If ANY answer is unsatisfactory, it's not done.

## Final Reminder

> "Done" means tests pass, not documentation complete.
> "Implemented" means code works, not stubs exist.
> "Complete" means verified, not claimed.

**Stay in structural tension until actual resolution.**

---

*Created: 2026-01-09*
*Purpose: Prevent the Babysitting Protocol incident from recurring*
*Use: For all future feature development*
