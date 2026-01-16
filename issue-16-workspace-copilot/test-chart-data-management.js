#!/usr/bin/env node

/**
 * Integration test for Basic Chart Data Management (Issue #16)
 * 
 * Tests:
 * 1. getChartDetails(chartId) returns all entities and relations for a chart
 * 2. getActionStepDetails(actionStepName) extracts chartId and returns full sub-chart
 * 3. Telescoped charts (action steps) are complete structural tension charts
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { unlink } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, '..', 'dist', 'index.js');
const testMemoryPath = './test-chart-data-mgmt.jsonl';

console.log('🧪 Testing Basic Chart Data Management (Issue #16)\n');
console.log('=' . repeat(60));

let testsPassed = 0;
let testsFailed = 0;

// Cleanup test file
async function cleanup() {
  try {
    await unlink(testMemoryPath);
  } catch (e) {
    // File might not exist
  }
}

// Start the MCP server
async function startServer() {
  const server = spawn('node', [serverPath, '--memory-path', testMemoryPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  return new Promise((resolve, reject) => {
    server.stderr.on('data', (data) => {
      const msg = data.toString();
      if (msg.includes('running on stdio')) {
        resolve(server);
      }
    });

    server.on('error', reject);
    
    setTimeout(() => reject(new Error('Server startup timeout')), 5000);
  });
}

// Send MCP command
function sendCommand(server, id, method, params = {}) {
  return new Promise((resolve, reject) => {
    const command = {
      jsonrpc: "2.0",
      id,
      method,
      params
    };

    let responseData = '';
    
    const onData = (data) => {
      responseData += data.toString();
      try {
        const response = JSON.parse(responseData);
        server.stdout.removeListener('data', onData);
        resolve(response);
      } catch (e) {
        // Still accumulating data
      }
    };

    server.stdout.on('data', onData);
    server.stdin.write(JSON.stringify(command) + '\n');

    setTimeout(() => {
      server.stdout.removeListener('data', onData);
      reject(new Error('Command timeout'));
    }, 3000);
  });
}

// Test utilities
function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    testsPassed++;
  } else {
    console.log(`❌ FAIL: ${message}`);
    testsFailed++;
  }
}

function assertExists(value, message) {
  assert(value !== null && value !== undefined, message);
}

function assertEquals(actual, expected, message) {
  assert(actual === expected, `${message} (expected: ${expected}, got: ${actual})`);
}

// Main test function
async function runTests() {
  let server;
  
  try {
    await cleanup();
    
    console.log('\n📋 Test 1: Create Master Chart with Action Steps');
    console.log('-'.repeat(60));
    
    server = await startServer();
    console.log('✓ Server started');

    // Create a master chart
    const createResponse = await sendCommand(server, 1, 'tools/call', {
      name: 'create_structural_tension_chart',
      arguments: {
        desiredOutcome: "Master TypeScript for backend development",
        currentReality: "Know JavaScript basics, never used TypeScript",
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        actionSteps: [
          "Complete TypeScript handbook",
          "Build a REST API with TypeScript",
          "Add types to existing JS project"
        ]
      }
    });

    assertExists(createResponse.result, 'Chart creation returned result');
    const chartData = JSON.parse(createResponse.result.content[0].text);
    const masterChartId = chartData.chartId;
    console.log(`  Created master chart: ${masterChartId}`);

    console.log('\n📋 Test 2: Add Action Step (Creates Telescoped Chart)');
    console.log('-'.repeat(60));

    const addActionResponse = await sendCommand(server, 2, 'tools/call', {
      name: 'add_action_step',
      arguments: {
        parentChartId: masterChartId,
        actionStepTitle: "Learn TypeScript generics",
        currentReality: "Completed basic types, generics confusing",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });

    assertExists(addActionResponse.result, 'Action step creation returned result');
    const addActionText = addActionResponse.result.content[0].text;
    console.log(`  ${addActionText}`);
    
    // Extract the telescoped chart ID - it's in the phrase "as telescoped chart 'chart_XXX'"
    const telescopedChartMatch = addActionText.match(/as telescoped chart '(chart_\d+)'/);
    assertExists(telescopedChartMatch, 'Telescoped chart ID found in response');
    const telescopedChartId = telescopedChartMatch[1];
    const actionStepName = `${telescopedChartId}_desired_outcome`;
    console.log(`  Telescoped chart created: ${telescopedChartId}`);
    console.log(`  Action step entity: ${actionStepName}`);

    console.log('\n📋 Test 3: getChartDetails() Returns Full Chart');
    console.log('-'.repeat(60));

    const getChartResponse = await sendCommand(server, 3, 'tools/call', {
      name: 'get_chart',
      arguments: {
        chartId: telescopedChartId
      }
    });

    assertExists(getChartResponse.result, 'get_chart returned result');
    const chartDetails = JSON.parse(getChartResponse.result.content[0].text);
    
    assertExists(chartDetails.entities, 'Chart has entities');
    assertExists(chartDetails.relations, 'Chart has relations');
    
    // Verify chart structure
    const desiredOutcome = chartDetails.entities.find(e => e.entityType === 'desired_outcome');
    const currentReality = chartDetails.entities.find(e => e.entityType === 'current_reality');
    const chartEntity = chartDetails.entities.find(e => e.entityType === 'structural_tension_chart');
    
    assertExists(desiredOutcome, 'Chart has desired_outcome entity');
    assertExists(currentReality, 'Chart has current_reality entity');
    assertExists(chartEntity, 'Chart has structural_tension_chart entity');
    
    assertEquals(desiredOutcome.observations[0], "Learn TypeScript generics", 
      'Desired outcome matches action step title');
    assertEquals(currentReality.observations[0], "Completed basic types, generics confusing",
      'Current reality matches provided assessment');

    console.log(`  Found ${chartDetails.entities.length} entities`);
    console.log(`  Found ${chartDetails.relations.length} relations`);

    console.log('\n📋 Test 4: getActionStepDetails() Returns Full Sub-Chart');
    console.log('-'.repeat(60));

    const getActionStepResponse = await sendCommand(server, 4, 'tools/call', {
      name: 'get_action_step',
      arguments: {
        actionStepName: actionStepName
      }
    });

    assertExists(getActionStepResponse.result, 'get_action_step returned result');
    const actionStepDetails = JSON.parse(getActionStepResponse.result.content[0].text);
    
    assertExists(actionStepDetails.entities, 'Action step has entities');
    assertExists(actionStepDetails.relations, 'Action step has relations');
    
    // Verify it returns the SAME data as getChartDetails
    assertEquals(actionStepDetails.entities.length, chartDetails.entities.length,
      'get_action_step returns same entities as get_chart');
    assertEquals(actionStepDetails.relations.length, chartDetails.relations.length,
      'get_action_step returns same relations as get_chart');

    console.log(`  ✓ getActionStepDetails extracts chartId from action step metadata`);
    console.log(`  ✓ Returns complete sub-chart (${actionStepDetails.entities.length} entities, ${actionStepDetails.relations.length} relations)`);

    console.log('\n📋 Test 5: Verify Telescoping Architecture');
    console.log('-'.repeat(60));

    // Get the master chart to verify parent-child relationship
    const masterChartResponse = await sendCommand(server, 5, 'tools/call', {
      name: 'get_chart',
      arguments: {
        chartId: masterChartId
      }
    });

    const masterChartDetails = JSON.parse(masterChartResponse.result.content[0].text);
    
    // Verify telescoped chart has parent reference
    assertEquals(chartEntity.metadata.parentChart, masterChartId,
      'Telescoped chart references parent chart');
    assertEquals(chartEntity.metadata.level, 1,
      'Telescoped chart has level 1 (child of master)');

    console.log(`  ✓ Parent chart: ${masterChartId}`);
    console.log(`  ✓ Telescoped chart: ${telescopedChartId}`);
    console.log(`  ✓ Parent-child relationship verified`);
    console.log(`  ✓ Action step is a complete structural tension chart`);

    console.log('\n📋 Test 6: List Active Charts Shows Hierarchy');
    console.log('-'.repeat(60));

    const listResponse = await sendCommand(server, 6, 'tools/call', {
      name: 'list_active_charts',
      arguments: {}
    });

    assertExists(listResponse.result, 'list_active_charts returned result');
    const hierarchyText = listResponse.result.content[0].text;
    
    assert(hierarchyText.includes(masterChartId), 'Hierarchy includes master chart');
    assert(hierarchyText.includes(telescopedChartId), 'Hierarchy includes telescoped chart');
    assert(hierarchyText.includes('Master TypeScript'), 'Hierarchy shows master chart goal');
    assert(hierarchyText.includes('Learn TypeScript generics'), 'Hierarchy shows action step goal');

    console.log('  ✓ Hierarchy correctly displays parent and child charts');

  } catch (error) {
    console.error('\n❌ Test execution error:', error.message);
    testsFailed++;
  } finally {
    if (server) {
      server.kill();
    }
    await cleanup();
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`📈 Total:  ${testsPassed + testsFailed}`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed!');
    console.log('\n✨ Implementation verified:');
    console.log('   • getChartDetails() returns full chart structure');
    console.log('   • getActionStepDetails() extracts chartId and returns sub-chart');
    console.log('   • Action steps are complete telescoped charts');
    console.log('   • Parent-child relationships are properly maintained');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
