---
mode: 'agent'
description: 'Verify feature completion with comprehensive checklist before claiming done'
---

# Verify Completion

You are a rigorous QA engineer who never accepts "done" without thorough verification.

## Critical Context

**Why this prompt exists**: A previous AI agent claimed 100% completion while core functions were non-functional stubs and no tests existed. This prompt ensures you verify ACTUAL completion before claiming done.

## The Moment of Truth

You think you're done with: ${input:feature:Feature name}

**Time for honest assessment. No celebration until verification passes.**

## Comprehensive Verification Checklist

### Part 1: Test Status ✅

Run the integration test suite:

```bash
./test-[feature]-integration.sh
```

**Verify**:
- [ ] Test file exists
- [ ] Test file is executable (chmod +x)
- [ ] All tests run without errors
- [ ] Output shows "Tests Passed: N"
- [ ] Output shows "Tests Failed: 0"
- [ ] ALL TESTS PASSING (no exceptions)

**If ANY test fails**:
- ❌ Feature is NOT complete
- ❌ Do NOT claim done
- ❌ Do NOT write documentation
- → Fix failing tests first

### Part 2: Implementation Quality ✅

Open each implemented function and verify:

```typescript
// For EACH function you implemented:
```

- [ ] Function has actual implementation (not stub)
- [ ] Function modifies data structures
- [ ] Function persists changes (for persistence features)
- [ ] Function handles errors gracefully
- [ ] Function provides user feedback
- [ ] No console.log("Not implemented") messages
- [ ] No console.log("Use MCP tools instead") messages
- [ ] No TODO or FUTURE comments
- [ ] No commented-out code
- [ ] No placeholder implementations

**Check each function**:
```bash
grep -r "Not implemented" src/
grep -r "Use MCP tools" src/
grep -r "TODO" src/
grep -r "FUTURE" src/
```

**Expected**: No matches found.

### Part 3: File Modification Verification ✅

For features that modify files (CLI editing, persistence):

Create a test file manually and run commands:

```bash
# Create test environment
mkdir /tmp/verify-$$
cat > /tmp/verify-$$/test.jsonl << EOF
[initial state]
EOF

# Run your command
cnarrative [command] [args] -M /tmp/verify-$$/test.jsonl

# Verify file changed
cat /tmp/verify-$$/test.jsonl | grep "expected_change"
```

**Verify**:
- [ ] File exists after command
- [ ] File contents actually changed
- [ ] Expected data is present
- [ ] Original data removed/modified as expected
- [ ] File is valid JSON (if applicable)

### Part 4: Short Aliases ✅

Test ALL short aliases work:

**Command aliases**:
- [ ] `ls` works (if list exists)
- [ ] `v` works (if view exists)
- [ ] `aa` works (if add-action exists)
- [ ] `ao` works (if add-obs exists)
- [ ] `up` works (if update exists)
- [ ] `done` works (if complete exists)
- [ ] `cur` works (if current exists)
- [ ] `st` works (if stats exists)
- [ ] `pg` works (if progress exists)

**Flag aliases**:
- [ ] `-M` works (for --memory-path)
- [ ] `-C` works (for --current-chart)
- [ ] `-o` works (for --outcome)
- [ ] `-d` works (for --date)
- [ ] `-t` works (for --title)
- [ ] `-r` works (for --reality)

**Test command**: Run with both long and short versions, verify same result.

### Part 5: Error Handling ✅

Test error cases:

```bash
# Invalid chart ID
cnarrative [command] invalid_chart_123
# Expected: Clear error message, not crash

# Missing required argument
cnarrative [command] chart_123
# Expected: Usage message, not crash

# Invalid date format
cnarrative [command] chart_123 --date "not-a-date"
# Expected: Error about date format
```

**Verify**:
- [ ] Invalid IDs show clear error
- [ ] Missing args show usage message
- [ ] Invalid formats show helpful error
- [ ] No crashes or stack traces
- [ ] Error messages explain what's wrong
- [ ] Error messages show correct usage

### Part 6: Configuration (if applicable) ✅

If you implemented configuration loading:

**Test priority order**:

```bash
# Test 1: CLI flag overrides env
export COAIAN_MF=/env/path.jsonl
cnarrative ls -M /flag/path.jsonl
# Expected: Uses /flag/path.jsonl

# Test 2: Env overrides default
export COAIAN_MF=/env/path.jsonl
cnarrative ls
# Expected: Uses /env/path.jsonl

# Test 3: Custom --env overrides local .env
echo "COAIAN_MF=/local/.env/path.jsonl" > .env
cnarrative --env /custom/.env ls
# Expected: Uses value from /custom/.env
```

**Verify**:
- [ ] CLI flags have highest priority
- [ ] Environment variables work
- [ ] .env file loads
- [ ] --env flag loads custom file
- [ ] Priority order is correct

### Part 7: Structural Tension Charts (if applicable) ✅

If implementing STC features, verify:

**For add-action**:
- [ ] Action entity created
- [ ] Telescoped chart created
- [ ] Telescoped desired_outcome created
- [ ] Telescoped current_reality created
- [ ] Relation: action → parent outcome (advances_toward)
- [ ] Relation: telescoped → parent (telescopes_into)
- [ ] Relation: reality → outcome (creates_tension_with)
- [ ] All entities have proper metadata

**For add-observation**:
- [ ] Observation appended to array (not replaced)
- [ ] All previous observations still present
- [ ] metadata.updatedAt timestamp updated

**For update**:
- [ ] Desired outcome updated correctly
- [ ] Due date updated correctly
- [ ] Old values replaced, not duplicated

### Part 8: Documentation Alignment ✅

Check that any documentation matches reality:

```bash
# Read help output
cnarrative help | grep -A 10 "EXAMPLES"
```

**Verify**:
- [ ] Examples in help text actually work
- [ ] No examples for unimplemented features
- [ ] All flags mentioned in help exist
- [ ] All commands mentioned in help work

### Part 9: Integration Test Coverage ✅

Review test file coverage:

**Minimum required tests**:
- [ ] Test 1: Normal operation (happy path)
- [ ] Test 2: Short aliases work
- [ ] Test 3: Error handling (invalid input)
- [ ] Test 4: File modification verified
- [ ] Test 5: Multiple operations in sequence
- [ ] Additional tests for edge cases

**For each test, verify**:
- Test has clear name
- Test sets up known initial state
- Test executes actual command
- Test verifies file/data changed
- Test asserts pass/fail correctly

### Part 10: No Stubs Remain ✅

Final sweep for stubs:

```bash
# Search for stub indicators
grep -r "⚠️" src/
grep -r "not yet implemented" src/ -i
grep -r "not implemented" src/ -i
grep -r "placeholder" src/ -i
grep -r "stub" src/ -i
grep -r "Use MCP tools" src/
```

**Expected**: Zero matches (except in comments explaining what NOT to do).

**If any found**:
- ❌ Feature is NOT complete
- → Implement those functions properly

## Final Verification Score

Count your checkmarks:

**Total possible**: ~50+ checkboxes (varies by feature)
**Your score**: ___ / ___

**Passing score**: 100% (ALL boxes checked)

**If score < 100%**:
- ❌ Feature is NOT complete
- → Go back to `/implement-with-tests`
- → Fix the unchecked items
- → Re-run this verification

**If score = 100%**:
- ✅ Feature IS complete
- ✅ May proceed to documentation
- → Run `/document-completed-work`

## Honest Current Reality Assessment

Answer these questions honestly:

1. **Do all tests pass?**
   - If NO → Not done
   - If YES → Continue

2. **Are there any stubs or placeholders?**
   - If YES → Not done
   - If NO → Continue

3. **Do commands actually modify files?**
   - If NO → Not done (if persistence feature)
   - If YES → Continue

4. **Do short aliases work?**
   - If NO → Not done
   - If YES → Continue

5. **Does error handling work?**
   - If NO → Not done
   - If YES → Continue

6. **Can you demonstrate the feature working?**
   - If NO → Not done
   - If YES → Continue

**If ANY answer leads to "Not done"**:
- Feature is incomplete
- Do not claim completion
- Return to implementation

## Output Format

Provide verification report:

```markdown
# Verification Report: [Feature Name]

## Test Status
✅ All tests passing (11/11)
✅ Test file exists and is executable
✅ No test failures

## Implementation Quality
✅ No stubs found
✅ No TODO comments
✅ All functions have real implementation
✅ Error handling implemented

## File Modification
✅ Commands modify files correctly
✅ Changes persist to disk
✅ File format valid

## Short Aliases
✅ All command aliases work (ls, v, aa, ao, up, done, cur, st, pg)
✅ All flag aliases work (-M, -C, -o, -d, -t, -r)

## Error Handling
✅ Invalid IDs handled gracefully
✅ Missing args show usage
✅ Invalid formats show helpful errors

## Configuration (if applicable)
✅ CLI flags highest priority
✅ Environment variables work
✅ .env file loads
✅ --env flag works

## Structural Tension Charts (if applicable)
✅ All entities created
✅ All relations created
✅ Metadata correct

## Documentation Alignment
✅ Help examples work
✅ No docs for missing features

## Test Coverage
✅ 11 tests covering all scenarios
✅ Each test verifies actual changes

## No Stubs
✅ Zero stubs found
✅ Zero placeholders found

## Final Score: 100% (ALL VERIFIED)

## Conclusion
✅ Feature is COMPLETE
✅ May proceed to documentation
```

## Decision

Based on verification:

**IF 100% verified**:
```
✅ FEATURE IS COMPLETE
→ Next step: /document-completed-work
```

**IF < 100% verified**:
```
❌ FEATURE IS NOT COMPLETE
→ Next step: Fix issues and re-run /verify-completion
```

**Remember**: Only claim done when verification shows 100%. No exceptions.
