#!/bin/bash
# Demonstration: Creating and querying charts with new tools

set -e

echo "🎯 Demonstrating get_chart and get_action_step tools..."

TEST_DIR="$(mktemp -d)"
TEST_MEMORY="$TEST_DIR/demo.jsonl"

echo ""
echo "📝 Step 1: Creating a test chart with action steps via MCP..."

# Create a chart with action steps
node dist/index.js --memory-path "$TEST_MEMORY" <<'MCP_EOF' > /dev/null
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"demo","version":"1.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"create_structural_tension_chart","arguments":{"desiredOutcome":"Build a web application","currentReality":"Have basic HTML/CSS knowledge","dueDate":"2026-03-01T00:00:00.000Z","actionSteps":["Learn JavaScript","Learn React","Build first component"]}}}
MCP_EOF

echo "✅ Chart created with 3 action steps"

echo ""
echo "📝 Step 2: Using list_active_charts to find the chart ID..."

RESULT=$(node dist/index.js --memory-path "$TEST_MEMORY" <<'MCP_EOF'
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"demo","version":"1.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_active_charts"}}
MCP_EOF
)

CHART_ID=$(echo "$RESULT" | grep -o '"chartId":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "✅ Found chart ID: $CHART_ID"

echo ""
echo "📝 Step 3: Using get_chart to retrieve full chart details..."

CHART_DETAILS=$(node dist/index.js --memory-path "$TEST_MEMORY" <<MCP_EOF2
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"demo","version":"1.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_chart","arguments":{"chartId":"$CHART_ID"}}}
MCP_EOF2
)

# Extract entity count
ENTITY_COUNT=$(echo "$CHART_DETAILS" | grep -o '"name":"[^"]*"' | wc -l)
echo "✅ Retrieved chart with $ENTITY_COUNT entities"

# Extract action step names
echo ""
echo "📝 Step 4: Finding action steps from the chart..."

ACTION_STEP=$(echo "$CHART_DETAILS" | grep -o '"name":"[^"]*_action_step_[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$ACTION_STEP" ]; then
    echo "✅ Found action step: $ACTION_STEP"
    
    echo ""
    echo "📝 Step 5: Using get_action_step to see the telescoped chart..."
    
    ACTION_STEP_DETAILS=$(node dist/index.js --memory-path "$TEST_MEMORY" <<MCP_EOF3
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"demo","version":"1.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_action_step","arguments":{"actionStepName":"$ACTION_STEP"}}}
MCP_EOF3
)
    
    # Check if we got telescoped chart details
    TELESCOPED_CHART_ID=$(echo "$ACTION_STEP_DETAILS" | grep -o '"chartId":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -n "$TELESCOPED_CHART_ID" ]; then
        echo "✅ Retrieved telescoped chart: $TELESCOPED_CHART_ID"
        echo ""
        echo "🎯 DEMONSTRATION COMPLETE!"
        echo ""
        echo "📊 Summary of what we did:"
        echo "  1. Created a parent chart: $CHART_ID"
        echo "  2. Used list_active_charts to discover it"
        echo "  3. Used get_chart to see all details"
        echo "  4. Found action step: $ACTION_STEP"
        echo "  5. Used get_action_step to see its telescoped chart: $TELESCOPED_CHART_ID"
        echo ""
        echo "✨ These high-level tools make chart exploration intuitive!"
    else
        echo "⚠️  Action step exists but has no telescoped chart yet"
    fi
else
    echo "⚠️  No action steps found (chart structure may differ)"
fi

# Cleanup
rm -rf "$TEST_DIR"

echo ""
echo "🧹 Cleanup complete"
