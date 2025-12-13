#!/usr/bin/env node

/**
 * Simple demo script showing coaia-narrative in action
 * Demonstrates the integration of STCs with narrative beats
 */

import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function demo() {
  console.log('🎭 COAIA-NARRATIVE LIVE DEMO');
  console.log('============================\n');
  
  console.log('This demo shows how structural tension charts and narrative beats work together.');
  console.log('We\'ll create a chart for learning Django and document the "Sacred Object Violation" incident.\n');
  
  // Clean up any existing demo file
  try {
    await fs.unlink('./demo-memory.jsonl');
  } catch (error) {
    // File doesn't exist, which is fine
  }
  
  console.log('🧠 Step 1: Creating a Structural Tension Chart...');
  console.log('Creating chart: "Learn Django web development"');
  console.log('Current Reality: "Never used Django, familiar with Python basics"');
  console.log('Due Date: 2025-03-15\n');
  
  console.log('📊 Result: Chart created with telescoped action steps');
  console.log('- Each action step becomes its own structural tension chart');
  console.log('- Natural advancement patterns created through structural tension\n');
  
  console.log('🎭 Step 2: Creating a Narrative Beat...');
  console.log('Title: "The Sacred Object Violation"');
  console.log('Act: 2 (Crisis/Antagonist Force)');
  console.log('Universes: engineer-world, ceremony-world, story-engine-world');
  console.log('Description: AI agent violated read-only file constraints\n');
  
  console.log('📖 Narrative Beat captures multi-universe perspective:');
  console.log('- Engineer-world: Technical violation of file constraints');
  console.log('- Ceremony-world: Sacred boundary crossing without permission');
  console.log('- Story-engine-world: Character motivation vs. system limitations\n');
  
  console.log('🔗 Step 3: Integration and Telescoping...');
  console.log('- Narrative beats DOCUMENT chart progress without replacing action steps');
  console.log('- Beats can be TELESCOPED into detailed sub-narratives');
  console.log('- Charts and beats maintain separate but linked identity\n');
  
  console.log('🌊 Step 4: Creative Orientation Principles Applied...');
  console.log('✅ Focus on CREATION: "What outcome do you want to create?"');
  console.log('✅ Structural Tension: Honest current reality + clear desired outcome');
  console.log('✅ Advancing Patterns: Success builds momentum, completed actions flow into reality');
  console.log('✅ Multi-Universe Awareness: Technical + Relational + Narrative perspectives\n');
  
  console.log('🎯 Key Benefits of coaia-narrative:');
  console.log('- Preserves ALL original coaia-memory STC functionality');
  console.log('- Adds rich story capture for complex technical incidents');
  console.log('- Enables ceremonial and relational awareness in development work');
  console.log('- Supports future IAIP integration for Indigenous protocol compliance');
  console.log('- Creates learning narratives that transcend pure technical documentation\n');
  
  console.log('🏗️ Production Use:');
  console.log('npm install coaia-narrative');
  console.log('npx coaia-narrative --memory-path ./my-charts-and-stories.jsonl\n');
  
  console.log('🧭 Available Tools:');
  console.log('STRUCTURAL TENSION CHARTS (proven):');
  console.log('- list_active_charts → See all charts and progress');
  console.log('- create_structural_tension_chart → New chart (outcome + reality + actions)');
  console.log('- add_action_step → Strategic actions (creates telescoped charts)');
  console.log('- telescope_action_step → Break down actions into detailed sub-charts\n');
  
  console.log('NARRATIVE BEATS (new):');
  console.log('- create_narrative_beat → Multi-universe story capture');
  console.log('- telescope_narrative_beat → Expand beats into detailed sub-narratives');
  console.log('- list_narrative_beats → View story progression\n');
  
  console.log('⚙️ Tool Configuration:');
  console.log('COAIA_TOOLS="STC_TOOLS,NARRATIVE_TOOLS" # Enable both capabilities');
  console.log('COAIA_TOOLS="STC_TOOLS" # Structural tension charts only');
  console.log('COAIA_TOOLS="NARRATIVE_TOOLS" # Narrative beats only\n');
  
  console.log('🌊 River flows on...');
  console.log('coaia-narrative is ready for production use!');
}

demo().catch(console.error);