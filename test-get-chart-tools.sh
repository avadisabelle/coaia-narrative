#!/bin/bash
# Integration test for get_chart and get_action_step tools

set -e

echo "🧪 Testing get_chart and get_action_step tools..."

# Setup test environment
TEST_DIR="$(mktemp -d)"
TEST_MEMORY="$TEST_DIR/test-memory.jsonl"

# Create a test chart with action steps
cat > "$TEST_MEMORY" << 'EOF'
{"type":"entity","name":"chart_test123_desired_outcome","entityType":"desired_outcome","observations":["Test Chart Desired Outcome"],"metadata":{"chartId":"chart_test123","dueDate":"2026-02-01T00:00:00.000Z"}}
{"type":"entity","name":"chart_test123_current_reality","entityType":"current_reality","observations":["Starting point"],"metadata":{"chartId":"chart_test123"}}
{"type":"entity","name":"chart_test123_action_step_1","entityType":"action_step","observations":["First Action"],"metadata":{"chartId":"chart_test123","completed":false}}
{"type":"entity","name":"chart_substep456_desired_outcome","entityType":"desired_outcome","observations":["First Action"],"metadata":{"chartId":"chart_substep456","dueDate":"2026-01-20T00:00:00.000Z"}}
{"type":"entity","name":"chart_substep456_current_reality","entityType":"current_reality","observations":["Sub-step starting point"],"metadata":{"chartId":"chart_substep456"}}
{"type":"relation","from":"chart_test123_action_step_1","to":"chart_substep456_desired_outcome","relationType":"telescopes_into"}
{"type":"relation","from":"chart_substep456_desired_outcome","to":"chart_test123_desired_outcome","relationType":"advances_toward"}
EOF

echo "✅ Created test memory file"

# Test 1: get_chart with existing chart
echo ""
echo "📊 Test 1: get_chart with valid chartId..."
RESULT=$(node dist/index.js --memory-path "$TEST_MEMORY" <<'MCP_EOF'
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_chart","arguments":{"chartId":"chart_test123"}}}
MCP_EOF
)

if echo "$RESULT" | grep -q "chart_test123_desired_outcome"; then
    echo "✅ Test 1 PASSED: get_chart returned chart details"
else
    echo "❌ Test 1 FAILED: get_chart did not return expected data"
    echo "$RESULT"
    exit 1
fi

# Test 2: get_chart with non-existent chart
echo ""
echo "📊 Test 2: get_chart with invalid chartId..."
RESULT=$(node dist/index.js --memory-path "$TEST_MEMORY" <<'MCP_EOF'
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_chart","arguments":{"chartId":"nonexistent"}}}
MCP_EOF
)

if echo "$RESULT" | grep -q "not found"; then
    echo "✅ Test 2 PASSED: get_chart returned error for missing chart"
else
    echo "❌ Test 2 FAILED: get_chart should return error for missing chart"
    echo "$RESULT"
    exit 1
fi

# Test 3: get_action_step with action step name
echo ""
echo "📊 Test 3: get_action_step with valid action step..."
RESULT=$(node dist/index.js --memory-path "$TEST_MEMORY" <<'MCP_EOF'
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_action_step","arguments":{"actionStepName":"chart_test123_action_step_1"}}}
MCP_EOF
)

if echo "$RESULT" | grep -q "chart_substep456"; then
    echo "✅ Test 3 PASSED: get_action_step returned telescoped chart"
else
    echo "❌ Test 3 FAILED: get_action_step did not return telescoped chart"
    echo "$RESULT"
    exit 1
fi

# Test 4: get_action_step with non-existent action step
echo ""
echo "📊 Test 4: get_action_step with invalid action step..."
RESULT=$(node dist/index.js --memory-path "$TEST_MEMORY" <<'MCP_EOF'
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_action_step","arguments":{"actionStepName":"nonexistent_step"}}}
MCP_EOF
)

if echo "$RESULT" | grep -q "not found"; then
    echo "✅ Test 4 PASSED: get_action_step returned error for missing action step"
else
    echo "❌ Test 4 FAILED: get_action_step should return error for missing action step"
    echo "$RESULT"
    exit 1
fi

# Test 5: Verify tools are in STC_TOOLS by default
echo ""
echo "📊 Test 5: Verify tools are available by default (STC_TOOLS)..."
RESULT=$(node dist/index.js --memory-path "$TEST_MEMORY" <<'MCP_EOF'
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/list"}
MCP_EOF
)

if echo "$RESULT" | grep -q "get_chart" && echo "$RESULT" | grep -q "get_action_step"; then
    echo "✅ Test 5 PASSED: Both tools are available by default"
else
    echo "❌ Test 5 FAILED: Tools not available by default"
    echo "$RESULT"
    exit 1
fi

# Cleanup
rm -rf "$TEST_DIR"

echo ""
echo "🎉 All tests passed! get_chart and get_action_step are working correctly."
echo ""
echo "📝 Summary:"
echo "  ✅ get_chart returns complete chart details"
echo "  ✅ get_chart handles missing charts gracefully"
echo "  ✅ get_action_step returns telescoped chart details"
echo "  ✅ get_action_step handles missing action steps gracefully"
echo "  ✅ Both tools are available by default in STC_TOOLS"
