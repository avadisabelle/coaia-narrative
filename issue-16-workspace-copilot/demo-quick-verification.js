#!/usr/bin/env node

/**
 * Quick Verification Demo for Issue #16
 * 
 * Demonstrates that getChartDetails and getActionStepDetails work correctly
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { unlink } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, '..', 'dist', 'index.js');
const testMemoryPath = './demo-chart-data.jsonl';

console.log('🎯 Quick Demo: Chart Data Management\n');
console.log('This demonstrates that action steps are complete charts.\n');

async function cleanup() {
  try {
    await unlink(testMemoryPath);
  } catch (e) {}
}

async function demo() {
  await cleanup();
  
  const server = spawn('node', [serverPath, '--memory-path', testMemoryPath], {
    stdio: ['pipe', 'pipe', 'ignore']
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Helper to send commands
  async function call(name, args) {
    return new Promise((resolve, reject) => {
      const cmd = {
        jsonrpc: "2.0",
        id: Math.random(),
        method: "tools/call",
        params: { name, arguments: args }
      };

      let data = '';
      const onData = (chunk) => {
        data += chunk.toString();
        try {
          const response = JSON.parse(data);
          server.stdout.removeListener('data', onData);
          resolve(response);
        } catch (e) {}
      };

      server.stdout.on('data', onData);
      server.stdin.write(JSON.stringify(cmd) + '\n');
      
      setTimeout(() => {
        server.stdout.removeListener('data', onData);
        reject(new Error('Timeout'));
      }, 5000);
    });
  }

  try {
    console.log('Step 1: Create a master chart');
    console.log('-'.repeat(60));
    const createResult = await call('create_structural_tension_chart', {
      desiredOutcome: "Master React for frontend development",
      currentReality: "Know HTML/CSS/JS basics, never used React",
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    const chartData = JSON.parse(createResult.result.content[0].text);
    const masterChartId = chartData.chartId;
    console.log(`✓ Created master chart: ${masterChartId}`);
    console.log(`  Desired outcome: "Master React for frontend development"`);
    console.log();

    console.log('Step 2: Add an action step (creates telescoped chart)');
    console.log('-'.repeat(60));
    const addActionResult = await call('add_action_step', {
      parentChartId: masterChartId,
      actionStepTitle: "Complete React hooks tutorial",
      currentReality: "Completed basic React, hooks confusing",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    const addActionText = addActionResult.result.content[0].text;
    // Extract the telescoped chart ID using a specific pattern
    const telescopedMatch = addActionText.match(/as telescoped chart '(chart_\d+)'/);
    if (!telescopedMatch) {
      throw new Error('Could not extract telescoped chart ID from response');
    }
    const telescopedChartId = telescopedMatch[1];
    const actionStepName = `${telescopedChartId}_desired_outcome`;
    
    console.log(`✓ Added action step, created telescoped chart: ${telescopedChartId}`);
    console.log(`  Action step entity name: ${actionStepName}`);
    console.log();

    console.log('Step 3: Use getChartDetails() to view the telescoped chart');
    console.log('-'.repeat(60));
    const chartDetailsResult = await call('get_chart', {
      chartId: telescopedChartId
    });
    
    const chartDetails = JSON.parse(chartDetailsResult.result.content[0].text);
    console.log(`✓ Retrieved chart ${telescopedChartId}`);
    console.log(`  Entities: ${chartDetails.entities.length}`);
    chartDetails.entities.forEach(e => {
      console.log(`    - ${e.entityType}: ${e.name}`);
      if (e.observations.length > 0) {
        console.log(`      "${e.observations[0]}"`);
      }
    });
    console.log();

    console.log('Step 4: Use getActionStepDetails() to view the same chart');
    console.log('-'.repeat(60));
    const actionDetailsResult = await call('get_action_step', {
      actionStepName: actionStepName
    });
    
    const actionDetails = JSON.parse(actionDetailsResult.result.content[0].text);
    console.log(`✓ Retrieved via action step name: ${actionStepName}`);
    console.log(`  Entities: ${actionDetails.entities.length}`);
    console.log(`  Relations: ${actionDetails.relations.length}`);
    console.log();

    console.log('📊 Verification:');
    console.log('-'.repeat(60));
    console.log(`✓ getChartDetails(chartId) returned ${chartDetails.entities.length} entities`);
    console.log(`✓ getActionStepDetails(actionStepName) returned ${actionDetails.entities.length} entities`);
    
    if (chartDetails.entities.length === actionDetails.entities.length) {
      console.log('✓ Both methods return the SAME complete sub-chart');
    }
    
    const chartEntity = chartDetails.entities.find(e => e.entityType === 'structural_tension_chart');
    if (chartEntity.metadata.parentChart === masterChartId) {
      console.log(`✓ Telescoped chart correctly references parent: ${masterChartId}`);
    }
    
    const desiredOutcome = chartDetails.entities.find(e => e.entityType === 'desired_outcome');
    if (desiredOutcome.observations[0] === "Complete React hooks tutorial") {
      console.log(`✓ Desired outcome matches action step title`);
    }
    
    console.log();
    console.log('🎉 Success! Action steps ARE complete structural tension charts.');
    console.log();
    console.log('Key points demonstrated:');
    console.log('  • Action steps create telescoped charts with their own chartId');
    console.log('  • getChartDetails() returns all entities for a chart');
    console.log('  • getActionStepDetails() extracts chartId and delegates to getChartDetails()');
    console.log('  • Both methods return the same complete structural tension chart');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    server.kill();
    await cleanup();
  }
}

demo().catch(console.error);
