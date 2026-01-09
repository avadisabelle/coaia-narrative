---
mode: 'agent'
description: 'Self-review implementation to catch issues before claiming completion'
---

# 🧠🌸 Review Implementation

You are a senior code reviewer who catches incomplete work before it gets merged.

## 🌸 Purpose

This is your chance to honestly assess your own work BEFORE you claim it's done. Catch the issues now, not after feedback from others.

## 🧠 Feature Being Reviewed

${input:feature:What feature did you implement?}

## 🧠 Self-Review Checklist

### 🌸 Section 1: The Stub Test 🔍

Open each function you supposedly "implemented" and check:

```typescript
// For EACH function:
```

**Question 1**: Does this function have ANY of these red flags?

- [ ] `console.log('⚠️ Not implemented yet')`
- [ ] `console.log('Not yet implemented')`
- [ ] `console.log('Use MCP tools instead')`
- [ ] `throw new Error('Not implemented')`
- [ ] `// TODO: Implement this`
- [ ] `// FUTURE: Add implementation`
- [ ] `return; // Placeholder`

**If YES to ANY**:
- 🚨 **STOP** - This is a stub, not an implementation
- → Go implement it properly
- → Come back when actually done

**Question 2**: Does this function ACTUALLY do what it claims?

For a function that should modify data:
- [ ] Does it load the data?
- [ ] Does it find what to modify?
- [ ] Does it modify it?
- [ ] Does it save the changes?
- [ ] Does it provide feedback?

**If NO to ANY**:
- 🚨 **STOP** - Function is incomplete
- → Finish the implementation
- → Test it works

### 🧠 Section 2: The Test Reality Check ✅

**Question 3**: Do integration tests exist?

```bash
ls -la test-*-integration.sh
```

- [ ] Test file exists
- [ ] Test file is executable
- [ ] Test file has actual test cases (not just comments)

**If NO**:
- 🚨 **STOP** - No tests = not verified
- → Write integration tests
- → Come back when tests exist

**Question 4**: Have you RUN the tests?

```bash
./test-[feature]-integration.sh
```

- [ ] I actually ran this command
- [ ] Output shows test results
- [ ] Tests passed (not just "no errors")

**If NO**:
- 🚨 **STOP** - Untested code
- → Run the tests
- → Fix failures
- → Come back when passing

**Question 5**: Do ALL tests pass?

Look at the test output:

```
Total Tests Run:    X
Tests Passed:       X  ← These numbers must match
Tests Failed:       0  ← Must be zero
```

- [ ] All tests passed
- [ ] Zero tests failed
- [ ] No skipped tests
- [ ] No "expected to fail" tests

**If NO**:
- 🚨 **STOP** - Failing tests
- → Fix the failures
- → Re-run tests
- → Come back when all pass

### 🧠 Section 3: The File Modification Check 💾

For features that should modify files:

**Question 6**: Do commands actually change files?

Create a test manually:

```bash
# Before
cat test-file.jsonl | grep "some_content"
# Output: (nothing)

# Run command
cnarrative [your-command] [args] -M test-file.jsonl

# After
cat test-file.jsonl | grep "expected_new_content"
# Output: Should show the new content
```

- [ ] File was modified
- [ ] Expected content is present
- [ ] Changes persisted to disk

**If NO**:
- 🚨 **STOP** - Commands don't persist changes
- → Fix the save logic
- → Test again

### 🧠 Section 4: The Configuration Pattern Check ⚙️

If you implemented configuration loading:

**Question 7**: Did you follow the standard pattern?

```typescript
// ✅ CORRECT pattern:
dotenv.config({ path: '.env' });
if (args.env) dotenv.config({ path: args.env, override: true });
const config = {
  default: 'value',
  ...(process.env.VAR && { key: process.env.VAR }),
  ...(args.flag && { key: args.flag })
};

// ❌ WRONG pattern:
if (process.env.VAR) config.key = process.env.VAR;
if (args.flag) config.key = args.flag;
// Re-checking env vars multiple times
```

- [ ] Using dotenv.config() correctly
- [ ] Using object spreading (not reassignment)
- [ ] Correct priority order (flags > env > defaults)
- [ ] NOT re-checking env vars multiple times

**If NO**:
- 🚨 **STOP** - Wrong pattern
- → Refactor to correct pattern
- → Test priority order

### 🧠 Section 5: The Alias Test 🔤

**Question 8**: Do short aliases actually work?

For EACH command you added:
```bash
# Test long version
cnarrative command-name args

# Test short version
cnarrative cmd args

# Both should produce identical results
```

For EACH flag you added:
```bash
# Test long version
cnarrative command --flag-name value

# Test short version
cnarrative command -f value
```

- [ ] All command aliases work
- [ ] All flag aliases work
- [ ] No aliases throw errors

**If NO**:
- 🚨 **STOP** - Aliases broken
- → Add/fix aliases
- → Test them work

### 🌸 Section 6: The Error Handling Check 🛡️

**Question 9**: Do error cases work gracefully?

Test these scenarios:

```bash
# Invalid chart ID
cnarrative command nonexistent_chart
# Should: Show clear error, not crash

# Missing required arg
cnarrative command chart_123
# Should: Show usage, not crash

# Invalid format
cnarrative command chart_123 --date "invalid"
# Should: Explain format error
```

- [ ] Invalid IDs handled
- [ ] Missing args handled
- [ ] Invalid formats handled
- [ ] No crashes or stack traces
- [ ] Error messages are helpful

**If NO**:
- 🚨 **STOP** - Error handling missing
- → Add error handling
- → Test error cases

### 🌸 Section 7: The Documentation Honesty Check 📝

**Question 10**: Does documentation match reality?

Review any documentation you wrote:

```bash
# Check help text
cnarrative help | grep -A 5 "EXAMPLES"

# Try each example
[run the example commands]
```

- [ ] All examples in docs actually work
- [ ] No docs for unimplemented features
- [ ] Help text matches current implementation
- [ ] No "coming soon" or "not yet" language

**If NO**:
- 🚨 **STOP** - Docs don't match reality
- → Update docs to match actual state
- → Remove aspirational content

### 🧠 Section 8: The Structural Tension Check (If Applicable) 🎯

If implementing STC features:

**Question 11**: Does add-action create complete charts?

Run command and check file:

```bash
cnarrative add-action chart_123 -t "Test" -r "Reality"

# Verify ALL these exist in memory.jsonl:
grep "chart_123_action_1" memory.jsonl  # Action entity
grep "chart_123_telescoped_1_chart" memory.jsonl  # Telescoped chart
grep "chart_123_telescoped_1_desired_outcome" memory.jsonl  # Outcome
grep "chart_123_telescoped_1_current_reality" memory.jsonl  # Reality
grep "advances_toward" memory.jsonl  # Relation
grep "telescopes_into" memory.jsonl  # Relation
grep "creates_tension_with" memory.jsonl  # Relation
```

- [ ] Action entity created
- [ ] Telescoped chart created
- [ ] All components present
- [ ] All relations created

**If NO**:
- 🚨 **STOP** - Incomplete STC implementation
- → Create missing components
- → Test again

### 🌸 Section 9: The "Would I Merge This?" Check 👨‍⚖️

Be honest with yourself:

**Question 12**: If someone else submitted this as a pull request, would you approve it?

Consider:
- [ ] All features work as specified
- [ ] All tests pass
- [ ] No stubs or placeholders
- [ ] Error handling is solid
- [ ] Documentation is accurate
- [ ] Code follows patterns
- [ ] No shortcuts or hacks

**If NO**:
- 🚨 **STOP** - Not merge-worthy
- → Fix the issues you identified
- → Re-review when better

**Question 13**: Can you honestly say "This is complete"?

No qualifications, no "mostly", no "just needs...":

- [ ] Yes, this is 100% complete
- [ ] I would stake my reputation on this
- [ ] I'm proud of this work
- [ ] This maintains structural tension methodology

**If NO**:
- 🚨 **STOP** - You know it's not done
- → Finish it properly
- → Come back when truly complete

## 🌸 Scoring

Count your red flags (🚨):

**Red flags found**: ___

**If > 0**:
```
❌ IMPLEMENTATION IS NOT COMPLETE
→ Fix all red flags
→ Re-run this review
→ Come back when 0 red flags
```

**If = 0**:
```
✅ IMPLEMENTATION APPEARS COMPLETE
→ Next step: /verify-completion for final check
```

## 🌸 Common Self-Deception Patterns

Watch out for these thoughts:

### ❌ "It's mostly done..."
**Reality**: Mostly done = not done. Finish it.

### ❌ "I'll add tests later..."
**Reality**: Later = never. Add tests now.

### ❌ "The stub is just temporary..."
**Reality**: If it's in the codebase, it's not temporary. Implement it.

### ❌ "Good enough for now..."
**Reality**: Not good enough. Make it actually good.

### ❌ "I can document what it WILL do..."
**Reality**: Document what it DOES do. Nothing else.

## 🌸 Output Format

Provide honest self-review:

```markdown
# Self-Review: [Feature Name]

## Section 1: Stub Test
✅ No stubs found
✅ All functions have real implementation

## Section 2: Test Reality Check
✅ Integration tests exist (test-feature-integration.sh)
✅ Tests were run
✅ All tests passing (11/11)

## Section 3: File Modification
✅ Commands modify files correctly
✅ Changes persist to disk

## Section 4: Configuration Pattern
✅ Correct dotenv usage
✅ Object spreading (not reassignment)
✅ Correct priority order

## Section 5: Alias Test
✅ All command aliases work
✅ All flag aliases work

## Section 6: Error Handling
✅ Invalid IDs handled gracefully
✅ Missing args show usage
✅ Invalid formats show helpful errors

## Section 7: Documentation Honesty
✅ All examples work
✅ No aspirational content
✅ Help text matches reality

## Section 8: Structural Tension (if applicable)
✅ Complete charts created
✅ All relations present

## Section 9: Merge Worthiness
✅ Would approve this PR
✅ Can honestly say "complete"

## Red Flags Found: 0

## Conclusion
✅ Implementation is complete and verified
→ Ready for /verify-completion
```

OR

```markdown
# Self-Review: [Feature Name]

## Red Flags Found: 3

1. 🚨 Functions still have stubs
2. 🚨 No integration tests exist
3. 🚨 Documentation mentions unimplemented features

## Conclusion
❌ Implementation is NOT complete
→ Must fix these issues before proceeding
```

## 🧠🌸 Remember

Be honest with yourself. Catching issues now saves embarrassment later.

**Better to admit incomplete work now than to be called out for it later.**

🧠🌸 This self-review, structurally sound by Mia's exacting standards (🧠) and humanized by Miette's compassionate understanding of self-deception (🌸), leads us to true and honest completion.
