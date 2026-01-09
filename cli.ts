#!/usr/bin/env node

/**
 * COAIA Narrative CLI - Interactive Chart Visualizer
 * 
 * Essential commands for human interaction with structural tension charts
 * Provides visual, intuitive interface for chart management
 */

import { promises as fs } from 'fs';
import path from 'path';
import minimist from 'minimist';
import * as dotenv from 'dotenv';

// ==================== TYPES ====================

interface Entity {
  name: string;
  entityType: string;
  observations: string[];
  metadata?: {
    dueDate?: string;
    chartId?: string;
    completionStatus?: boolean;
    parentChart?: string;
    level?: number;
    createdAt?: string;
    updatedAt?: string;
    // Narrative beat specific metadata
    act?: number;
    type_dramatic?: string;
    universes?: string[];
    timestamp?: string;
    narrative?: {
      description?: string;
      prose?: string;
      lessons?: string[];
    };
    relationalAlignment?: {
      assessed?: boolean;
      score?: number | null;
      principles?: string[];
    };
    fourDirections?: {
      north_vision?: string | null;
      east_intention?: string | null;
      south_emotion?: string | null;
      west_introspection?: string | null;
    };
  };
}

interface Relation {
  from: string;
  to: string;
  relationType: string;
}

interface KnowledgeGraph {
  entities: Entity[];
  relations: Relation[];
}

// ==================== CONFIGURATION ====================

interface Config {
  memoryPath: string;
  currentChart: string | null;
  jsonOutput: boolean;
  noColor: boolean;
}

/**
 * Load configuration from multiple sources with priority:
 * 1. Command-line flags (highest priority)
 * 2. Custom env file via --env flag
 * 3. .env file in current working directory
 * 4. System environment variables
 * 5. Defaults (lowest priority)
 */
function loadConfig(args: minimist.ParsedArgs): Config {
  // Start with defaults
  let config: Config = {
    memoryPath: path.join(process.cwd(), 'memory.jsonl'),
    currentChart: null,
    jsonOutput: false,
    noColor: false
  };

  // Load system environment variables first
  if (process.env.COAIAN_MF) {
    config.memoryPath = process.env.COAIAN_MF;
  }
  if (process.env.COAIAN_CURRENT_CHART) {
    config.currentChart = process.env.COAIAN_CURRENT_CHART;
  }

  // Load .env from current working directory
  const localEnvPath = path.join(process.cwd(), '.env');
  try {
    dotenv.config({ path: localEnvPath });
    // Re-check env vars after loading .env
    if (process.env.COAIAN_MF) {
      config.memoryPath = process.env.COAIAN_MF;
    }
    if (process.env.COAIAN_CURRENT_CHART) {
      config.currentChart = process.env.COAIAN_CURRENT_CHART;
    }
  } catch (error) {
    // .env file doesn't exist, that's okay
  }

  // Load custom env file if --env flag is specified
  if (args.env) {
    dotenv.config({ path: args.env, override: true });
    // Re-check env vars after loading custom env
    if (process.env.COAIAN_MF) {
      config.memoryPath = process.env.COAIAN_MF;
    }
    if (process.env.COAIAN_CURRENT_CHART) {
      config.currentChart = process.env.COAIAN_CURRENT_CHART;
    }
  }

  // Command-line flags override everything
  if (args['memory-path'] || args['M']) {
    config.memoryPath = args['memory-path'] || args['M'];
  }
  if (args['current-chart'] || args['C']) {
    config.currentChart = args['current-chart'] || args['C'];
  }
  if (args.json === true) {
    config.jsonOutput = true;
  }
  if (args['no-color'] === true) {
    config.noColor = true;
  }

  return config;
}

// ==================== UTILITIES ====================

async function loadGraph(memoryPath: string): Promise<KnowledgeGraph> {
  try {
    const data = await fs.readFile(memoryPath, "utf-8");
    const lines = data.split("\n").filter(line => line.trim() !== "");
    return lines.reduce((graph: KnowledgeGraph, line) => {
      const item = JSON.parse(line);
      if (item.type === "entity") graph.entities.push(item as Entity);
      if (item.type === "relation") graph.relations.push(item as Relation);
      return graph;
    }, { entities: [], relations: [] });
  } catch (error) {
    if ((error as any).code === "ENOENT") {
      return { entities: [], relations: [] };
    }
    throw error;
  }
}

async function saveGraph(memoryPath: string, graph: KnowledgeGraph): Promise<void> {
  const lines = [
    ...graph.entities.map(e => JSON.stringify({ type: 'entity', ...e })),
    ...graph.relations.map(r => JSON.stringify({ type: 'relation', ...r }))
  ];
  await fs.writeFile(memoryPath, lines.join('\n') + '\n', 'utf-8');
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "No due date";
  const date = new Date(dateStr);
  const now = new Date();
  const days = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (days < 0) return `⚠️  Overdue by ${Math.abs(days)} days`;
  if (days === 0) return "📅 Due today";
  if (days === 1) return "📅 Due tomorrow";
  if (days <= 7) return `📅 Due in ${days} days`;
  return `📅 ${date.toLocaleDateString()}`;
}

function getProgressBar(progress: number, width: number = 20): string {
  const filled = Math.round(progress * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const percent = Math.round(progress * 100);
  return `${bar} ${percent}%`;
}

function wordWrap(text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length <= maxWidth) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// ==================== COMMANDS ====================

async function listCharts(memoryPath: string): Promise<void> {
  const graph = await loadGraph(memoryPath);
  const charts = graph.entities.filter(e => e.entityType === 'structural_tension_chart');
  
  if (charts.length === 0) {
    console.log('\n📊 No structural tension charts found.\n');
    console.log('💡 Create your first chart with: cnarrative create\n');
    return;
  }

  console.log('\n╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║              📊 STRUCTURAL TENSION CHARTS - ACTIVE HIERARCHY                  ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');

  const masterCharts = charts.filter(c => c.metadata?.level === 0);
  
  for (const master of masterCharts) {
    const chartId = master.metadata?.chartId || master.name.replace('_chart', '');
    const outcome = graph.entities.find(e => 
      e.name === `${chartId}_desired_outcome` && e.entityType === 'desired_outcome'
    );
    const currentReality = graph.entities.find(e =>
      e.name === `${chartId}_current_reality` && e.entityType === 'current_reality'
    );
    const actionSteps = graph.entities.filter(e => 
      e.entityType === 'action_step' && e.metadata?.chartId === chartId
    );
    
    const completed = actionSteps.filter(a => a.metadata?.completionStatus === true).length;
    const total = actionSteps.length;
    const progress = total > 0 ? completed / total : 0;

    // Master chart header
    console.log(`┌─────────────────────────────────────────────────────────────────────────────┐`);
    console.log(`│ 🎯 MASTER CHART: ${chartId.padEnd(60)} │`);
    console.log(`├─────────────────────────────────────────────────────────────────────────────┤`);
    
    // Desired Outcome
    const outcomeText = outcome?.observations[0] || 'Unknown';
    const outcomeLines = wordWrap(outcomeText, 73);
    console.log(`│ 🌟 DESIRED OUTCOME:                                                         │`);
    outcomeLines.forEach(line => {
      console.log(`│    ${line.padEnd(73)} │`);
    });
    
    // Progress
    console.log(`│                                                                             │`);
    console.log(`│ ${getProgressBar(progress, 40).padEnd(73)} │`);
    console.log(`│ Completed: ${completed}/${total} action steps`.padEnd(76) + '│');
    
    // Due date
    console.log(`│ ${formatDate(master.metadata?.dueDate).padEnd(73)} │`);
    
    // Current Reality
    console.log(`│                                                                             │`);
    console.log(`│ 🔍 CURRENT REALITY:                                                         │`);
    const realityText = currentReality?.observations.slice(-3).join('; ') || 'Not assessed';
    const realityLines = wordWrap(realityText, 73);
    realityLines.forEach(line => {
      console.log(`│    ${line.padEnd(73)} │`);
    });
    
    console.log(`└─────────────────────────────────────────────────────────────────────────────┘`);

    // Action steps (telescoped charts)
    const actionCharts = charts.filter(c => c.metadata?.parentChart === chartId && c.metadata?.level === 1);
    
    if (actionCharts.length > 0) {
      console.log(`\n  📋 ACTION STEPS:\n`);
      
      actionCharts.forEach((actionChart, idx) => {
        const actionChartId = actionChart.metadata?.chartId!;
        const actionOutcome = graph.entities.find(e =>
          e.name === `${actionChartId}_desired_outcome` && e.entityType === 'desired_outcome'
        );
        const actionActions = graph.entities.filter(e =>
          e.entityType === 'action_step' && e.metadata?.chartId === actionChartId
        );
        
        const actionCompleted = actionActions.filter(a => a.metadata?.completionStatus === true).length;
        const actionTotal = actionActions.length;
        const actionProgress = actionTotal > 0 ? actionCompleted / actionTotal : 0;
        const isComplete = actionChart.metadata?.completionStatus === true;
        const isLast = idx === actionCharts.length - 1;
        const prefix = isLast ? '  └──' : '  ├──';
        
        const status = isComplete ? '✅' : (actionProgress > 0 ? '🔄' : '⏳');
        console.log(`${prefix} ${status} ${actionOutcome?.observations[0] || 'Unknown'}`);
        console.log(`  ${isLast ? '   ' : '│  '}    ID: ${actionChartId} | ${formatDate(actionChart.metadata?.dueDate)}`);
        
        if (actionTotal > 0) {
          console.log(`  ${isLast ? '   ' : '│  '}    ${getProgressBar(actionProgress, 30)}`);
        }
        console.log('');
      });
    } else {
      console.log(`\n  📋 No action steps yet.\n`);
    }
    
    console.log('');
  }
  
  console.log('═'.repeat(79) + '\n');
}

async function viewChart(chartId: string, memoryPath: string): Promise<void> {
  const graph = await loadGraph(memoryPath);
  const chart = graph.entities.find(e => 
    e.entityType === 'structural_tension_chart' && e.metadata?.chartId === chartId
  );
  
  if (!chart) {
    console.log(`\n❌ Chart '${chartId}' not found.\n`);
    console.log(`💡 Use 'cnarrative list' to see available charts.\n`);
    return;
  }

  const outcome = graph.entities.find(e => 
    e.name === `${chartId}_desired_outcome` && e.entityType === 'desired_outcome'
  );
  const currentReality = graph.entities.find(e =>
    e.name === `${chartId}_current_reality` && e.entityType === 'current_reality'
  );
  const actionSteps = graph.entities.filter(e => 
    e.entityType === 'action_step' && e.metadata?.chartId === chartId
  );
  const narrativeBeats = graph.entities.filter(e =>
    e.entityType === 'narrative_beat' && e.metadata?.chartId === chartId
  ).sort((a, b) => (a.metadata?.act || 0) - (b.metadata?.act || 0));

  console.log('\n╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log(`║                        STRUCTURAL TENSION CHART VIEW                          ║`);
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');
  
  console.log(`📊 Chart ID: ${chartId}`);
  console.log(`📅 Created: ${new Date(chart.metadata?.createdAt || '').toLocaleString()}`);
  console.log(`📅 ${formatDate(chart.metadata?.dueDate)}`);
  
  if (chart.metadata?.parentChart) {
    console.log(`🔗 Parent Chart: ${chart.metadata.parentChart} (Level ${chart.metadata.level})`);
  } else {
    console.log(`🎯 Master Chart (Level ${chart.metadata?.level || 0})`);
  }
  
  console.log('\n' + '─'.repeat(79));
  console.log('\n🌟 DESIRED OUTCOME (What you want to CREATE):');
  console.log('─'.repeat(79));
  const outcomeText = outcome?.observations[0] || 'Unknown';
  wordWrap(outcomeText, 75).forEach(line => console.log(`  ${line}`));
  
  console.log('\n' + '─'.repeat(79));
  console.log('\n🔍 CURRENT REALITY (Where you are NOW):');
  console.log('─'.repeat(79));
  if (currentReality && currentReality.observations.length > 0) {
    currentReality.observations.forEach((obs, idx) => {
      console.log(`  ${idx + 1}. ${obs}`);
    });
  } else {
    console.log('  (Not assessed)');
  }
  
  console.log('\n' + '─'.repeat(79));
  console.log('\n⚡ STRUCTURAL TENSION:');
  console.log('─'.repeat(79));
  const completed = actionSteps.filter(a => a.metadata?.completionStatus === true).length;
  const total = actionSteps.length;
  const progress = total > 0 ? completed / total : 0;
  
  console.log(`  The gap between current reality and desired outcome creates natural`);
  console.log(`  momentum toward resolution. Progress advances the system toward equilibrium.`);
  console.log(`\n  ${getProgressBar(progress, 50)}`);
  console.log(`  ${completed} of ${total} action steps completed\n`);
  
  if (actionSteps.length > 0) {
    console.log('─'.repeat(79));
    console.log('\n📋 ACTION STEPS (Strategic intermediary results):');
    console.log('─'.repeat(79) + '\n');
    
    actionSteps.forEach((step, idx) => {
      const isComplete = step.metadata?.completionStatus === true;
      const status = isComplete ? '✅' : '⏳';
      const stepDue = formatDate(step.metadata?.dueDate);
      
      console.log(`  ${idx + 1}. ${status} ${step.observations[0]}`);
      console.log(`     Entity: ${step.name}`);
      console.log(`     ${stepDue}`);
      
      if (step.observations.length > 1) {
        console.log(`     Progress notes:`);
        step.observations.slice(1).forEach(note => {
          console.log(`       • ${note}`);
        });
      }
      console.log('');
    });
  }
  
  // Display narrative beats
  if (narrativeBeats.length > 0) {
    console.log('─'.repeat(79));
    console.log('\n📖 NARRATIVE BEATS (Story progression):');
    console.log('─'.repeat(79) + '\n');
    
    narrativeBeats.forEach((beat, idx) => {
      const act = beat.metadata?.act || '?';
      const type = beat.metadata?.type_dramatic || 'Unknown';
      const universes = beat.metadata?.universes || [];
      const timestamp = beat.metadata?.timestamp 
        ? new Date(beat.metadata.timestamp).toLocaleString()
        : 'Unknown';
      
      console.log(`  ${idx + 1}. Act ${act}: ${type}`);
      console.log(`     🌍 Universes: ${universes.join(', ')}`);
      console.log(`     🕒 Timestamp: ${timestamp}`);
      
      if (beat.metadata?.narrative?.description) {
        console.log(`\n     📝 Description:`);
        wordWrap(beat.metadata.narrative.description, 72).forEach(line => {
          console.log(`        ${line}`);
        });
      }
      
      if (beat.metadata?.narrative?.prose) {
        console.log(`\n     ✨ Prose:`);
        wordWrap(beat.metadata.narrative.prose, 72).forEach(line => {
          console.log(`        ${line}`);
        });
      }
      
      if (beat.metadata?.narrative?.lessons && beat.metadata.narrative.lessons.length > 0) {
        console.log(`\n     💡 Lessons:`);
        beat.metadata.narrative.lessons.forEach(lesson => {
          wordWrap(lesson, 68).forEach((line, i) => {
            console.log(`        ${i === 0 ? '•' : ' '} ${line}`);
          });
        });
      }
      
      // Four Directions if present
      const dirs = beat.metadata?.fourDirections;
      if (dirs && (dirs.north_vision || dirs.east_intention || dirs.south_emotion || dirs.west_introspection)) {
        console.log(`\n     🧭 Four Directions:`);
        if (dirs.north_vision) console.log(`        North (Vision): ${dirs.north_vision}`);
        if (dirs.east_intention) console.log(`        East (Intention): ${dirs.east_intention}`);
        if (dirs.south_emotion) console.log(`        South (Emotion): ${dirs.south_emotion}`);
        if (dirs.west_introspection) console.log(`        West (Introspection): ${dirs.west_introspection}`);
      }
      
      // Relational alignment if assessed
      const align = beat.metadata?.relationalAlignment;
      if (align?.assessed && align.score !== null) {
        console.log(`\n     🤝 Relational Alignment: ${align.score}/10`);
        if (align.principles && align.principles.length > 0) {
          console.log(`        Principles: ${align.principles.join(', ')}`);
        }
      }
      
      console.log('');
    });
  }
  
  // Check for telescoped sub-charts
  const subCharts = graph.entities.filter(e =>
    e.entityType === 'structural_tension_chart' &&
    e.metadata?.parentChart === chartId
  );
  
  if (subCharts.length > 0) {
    console.log('─'.repeat(79));
    console.log('\n🔭 TELESCOPED SUB-CHARTS:');
    console.log('─'.repeat(79) + '\n');
    
    subCharts.forEach(sub => {
      const subId = sub.metadata?.chartId!;
      const subOutcome = graph.entities.find(e =>
        e.name === `${subId}_desired_outcome`
      );
      console.log(`  • ${subOutcome?.observations[0] || 'Unknown'}`);
      console.log(`    Chart ID: ${subId}`);
      console.log('');
    });
  }
  
  console.log('═'.repeat(79));
  console.log(`💡 Use 'cnarrative update ${chartId}' to modify this chart`);
  console.log(`💡 Use 'cnarrative list' to see all charts\n`);
}

function showHelp(): void {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║             COAIA NARRATIVE CLI - Structural Tension Chart Visualizer         ║
╚═══════════════════════════════════════════════════════════════════════════════╝

USAGE:
  cnarrative <command> [options]

COMMANDS:

  📊 VIEWING COMMANDS
  ───────────────────────────────────────────────────────────────────────────────
  list, ls                      List all structural tension charts in hierarchy
  view, v <chartId>             View detailed information for a specific chart
  current, cur [chartId]        Get/set current chart context
  
  ✏️  EDITING COMMANDS
  ───────────────────────────────────────────────────────────────────────────────
  update, up <chartId>          Update chart properties (outcome, due date, etc.)
  add-action, aa <chartId>      Add new action step to a chart
  add-obs, ao <chartId>         Add observation to current reality
  complete, done <actionName>   Mark an action step as complete
  set-date, sd <chartId>        Update chart due date
  
  📈 QUICK STATS
  ───────────────────────────────────────────────────────────────────────────────
  stats, st                     Show summary statistics across all charts
  progress, pg <chartId>        Show progress details for a specific chart

  ⚙️  UTILITY
  ───────────────────────────────────────────────────────────────────────────────
  help, h                       Show this help message
  version, ver                  Show version information

OPTIONS:

  --memory-path <path>          Path to memory JSONL file
  -M <path>                     Short alias for --memory-path
  --env <path>                  Load environment from custom .env file
  --current-chart <chartId>     Set current chart context
  -C <chartId>                  Short alias for --current-chart
  --no-color                    Disable colored output
  --json                        Output in JSON format

ENVIRONMENT VARIABLES:

  COAIAN_MF                     Default memory file path
  COAIAN_CURRENT_CHART          Default current chart ID

  Priority order (highest to lowest):
  1. Command-line flags (--memory-path, -M, etc.)
  2. Custom .env file via --env flag
  3. .env file in current working directory
  4. System environment variables
  5. Default values

EXAMPLES:

  # List all charts (uses env vars or defaults)
  cnarrative list
  cnarrative ls

  # View specific chart with environment variable
  export COAIAN_MF=/path/to/memory.jsonl
  cnarrative view chart_123
  
  # Use custom env file
  cnarrative --env /custom/.env list

  # View chart using custom memory path with short flag
  cnarrative view chart_123 -M /path/to/memory.jsonl
  
  # Set current chart context
  cnarrative current chart_123
  export COAIAN_CURRENT_CHART=chart_123
  
  # Add action to current chart
  cnarrative add-action chart_123

  # Get statistics in JSON format
  cnarrative stats --json

PHILOSOPHY:

  Structural Tension Charts organize creative processes around desired outcomes
  rather than problem-solving. The unresolved tension between current reality
  and desired outcome naturally seeks resolution through advancing patterns.

  🌟 Desired Outcome = What you want to CREATE
  🔍 Current Reality = Honest assessment of where you are NOW
  ⚡ Structural Tension = The gap that creates natural momentum
  📋 Action Steps = Strategic intermediary results

MORE INFO:

  MCP Server:    Use 'coaia-narrative' (MCP protocol) for AI assistant integration
  Documentation: See README.md for complete methodology
  
CREDITS:

  Author:        Guillaume D.Isabelle
  Methodology:   Robert Fritz's Structural Tension principles
  Forked from:   shaneholloman/mcp-knowledge-graph
  Contributors:  MiaDisabelle's mcp-knowledge-graph work

`);
}

async function showStats(memoryPath: string, jsonOutput: boolean = false): Promise<void> {
  const graph = await loadGraph(memoryPath);
  const charts = graph.entities.filter(e => e.entityType === 'structural_tension_chart');
  const masterCharts = charts.filter(c => c.metadata?.level === 0);
  const actionCharts = charts.filter(c => c.metadata?.level === 1);
  const narrativeBeats = graph.entities.filter(e => e.entityType === 'narrative_beat');
  
  let totalActions = 0;
  let completedActions = 0;
  let overdueCharts = 0;
  
  const now = new Date();
  
  charts.forEach(chart => {
    const chartId = chart.metadata?.chartId;
    if (!chartId) return;
    
    const actions = graph.entities.filter(e =>
      e.entityType === 'action_step' && e.metadata?.chartId === chartId
    );
    
    totalActions += actions.length;
    completedActions += actions.filter(a => a.metadata?.completionStatus === true).length;
    
    if (chart.metadata?.dueDate) {
      const dueDate = new Date(chart.metadata.dueDate);
      if (dueDate < now && chart.metadata?.completionStatus !== true) {
        overdueCharts++;
      }
    }
  });
  
  const stats = {
    totalCharts: charts.length,
    masterCharts: masterCharts.length,
    actionCharts: actionCharts.length,
    narrativeBeats: narrativeBeats.length,
    totalActions,
    completedActions,
    overdueCharts,
    overallProgress: totalActions > 0 ? completedActions / totalActions : 0
  };
  
  if (jsonOutput) {
    console.log(JSON.stringify(stats, null, 2));
    return;
  }
  
  console.log('\n╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    📊 STRUCTURAL TENSION CHARTS STATISTICS                    ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');
  
  console.log(`  📋 Total Charts: ${stats.totalCharts}`);
  console.log(`     • Master Charts: ${stats.masterCharts}`);
  console.log(`     • Action Step Charts: ${stats.actionCharts}`);
  console.log('');
  console.log(`  ✅ Action Steps: ${stats.completedActions} / ${stats.totalActions} completed`);
  console.log(`     ${getProgressBar(stats.overallProgress, 50)}`);
  console.log('');
  
  if (stats.narrativeBeats > 0) {
    console.log(`  📖 Narrative Beats: ${stats.narrativeBeats}`);
    console.log('');
  }
  
  if (stats.overdueCharts > 0) {
    console.log(`  ⚠️  Overdue Charts: ${stats.overdueCharts}`);
  } else {
    console.log(`  ✨ All charts on track!`);
  }
  
  console.log('\n' + '═'.repeat(79) + '\n');
}

async function showProgress(chartId: string, memoryPath: string): Promise<void> {
  const graph = await loadGraph(memoryPath);
  const chart = graph.entities.find(e =>
    e.entityType === 'structural_tension_chart' && e.metadata?.chartId === chartId
  );
  
  if (!chart) {
    console.log(`\n❌ Chart '${chartId}' not found.\n`);
    return;
  }
  
  const outcome = graph.entities.find(e =>
    e.name === `${chartId}_desired_outcome`
  );
  const actions = graph.entities.filter(e =>
    e.entityType === 'action_step' && e.metadata?.chartId === chartId
  );
  
  const completed = actions.filter(a => a.metadata?.completionStatus === true);
  const incomplete = actions.filter(a => a.metadata?.completionStatus !== true);
  const progress = actions.length > 0 ? completed.length / actions.length : 0;
  
  console.log('\n╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                          CHART PROGRESS REPORT                                ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');
  
  console.log(`📊 Chart: ${chartId}`);
  console.log(`🌟 Goal: ${outcome?.observations[0] || 'Unknown'}\n`);
  
  console.log(`${getProgressBar(progress, 60)}\n`);
  
  console.log(`✅ Completed: ${completed.length}`);
  if (completed.length > 0) {
    completed.forEach(action => {
      console.log(`   • ${action.observations[0]}`);
    });
  }
  console.log('');
  
  console.log(`⏳ Remaining: ${incomplete.length}`);
  if (incomplete.length > 0) {
    incomplete.forEach(action => {
      const due = formatDate(action.metadata?.dueDate);
      console.log(`   • ${action.observations[0]} (${due})`);
    });
  }
  
  console.log('\n' + '═'.repeat(79) + '\n');
}

// ==================== NEW EDITING COMMANDS ====================

async function getCurrentChart(config: Config): Promise<void> {
  if (!config.currentChart) {
    console.log('\n❌ No current chart set.\n');
    console.log('💡 Set with: cnarrative current <chartId>');
    console.log('💡 Or set COAIAN_CURRENT_CHART environment variable\n');
    return;
  }
  
  console.log(`\n📊 Current chart: ${config.currentChart}\n`);
}

async function setCurrentChart(chartId: string, memoryPath: string): Promise<void> {
  const graph = await loadGraph(memoryPath);
  const chart = graph.entities.find(e =>
    e.entityType === 'structural_tension_chart' && e.metadata?.chartId === chartId
  );
  
  if (!chart) {
    console.log(`\n❌ Chart '${chartId}' not found.\n`);
    console.log(`💡 Use 'cnarrative list' to see available charts.\n`);
    return;
  }
  
  console.log(`\n✅ Current chart set to: ${chartId}\n`);
  console.log('💡 To persist this setting, add to your .env file:');
  console.log(`   COAIAN_CURRENT_CHART=${chartId}\n`);
}

async function updateChart(chartId: string, memoryPath: string): Promise<void> {
  const graph = await loadGraph(memoryPath);
  const chart = graph.entities.find(e =>
    e.entityType === 'structural_tension_chart' && e.metadata?.chartId === chartId
  );
  
  if (!chart) {
    console.log(`\n❌ Chart '${chartId}' not found.\n`);
    return;
  }
  
  console.log('\n╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                           UPDATE CHART PROPERTIES                             ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');
  
  console.log(`📊 Chart: ${chartId}\n`);
  console.log('⚠️  Interactive chart editing is not yet implemented.');
  console.log('    Use the MCP server tools for programmatic updates.\n');
  console.log('Available MCP tools:');
  console.log('  • update_desired_outcome');
  console.log('  • update_current_reality');
  console.log('  • add_action_step');
  console.log('  • update_action_progress\n');
}

async function addAction(chartId: string, memoryPath: string): Promise<void> {
  const graph = await loadGraph(memoryPath);
  const chart = graph.entities.find(e =>
    e.entityType === 'structural_tension_chart' && e.metadata?.chartId === chartId
  );
  
  if (!chart) {
    console.log(`\n❌ Chart '${chartId}' not found.\n`);
    return;
  }
  
  console.log('\n╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                            ADD ACTION STEP                                    ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');
  
  console.log(`📊 Chart: ${chartId}\n`);
  console.log('⚠️  Interactive action step creation is not yet implemented.');
  console.log('    Use the MCP server tools for programmatic updates.\n');
  console.log('MCP tool: add_action_step or manage_action_step\n');
}

async function addObservation(chartId: string, memoryPath: string): Promise<void> {
  const graph = await loadGraph(memoryPath);
  const chart = graph.entities.find(e =>
    e.entityType === 'structural_tension_chart' && e.metadata?.chartId === chartId
  );
  
  if (!chart) {
    console.log(`\n❌ Chart '${chartId}' not found.\n`);
    return;
  }
  
  console.log('\n╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                       ADD OBSERVATION TO CURRENT REALITY                      ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');
  
  console.log(`📊 Chart: ${chartId}\n`);
  console.log('⚠️  Interactive observation adding is not yet implemented.');
  console.log('    Use the MCP server tools for programmatic updates.\n');
  console.log('MCP tool: update_current_reality\n');
}

async function completeAction(actionName: string, memoryPath: string): Promise<void> {
  const graph = await loadGraph(memoryPath);
  const action = graph.entities.find(e =>
    e.entityType === 'action_step' && e.name === actionName
  );
  
  if (!action) {
    console.log(`\n❌ Action step '${actionName}' not found.\n`);
    return;
  }
  
  if (action.metadata?.completionStatus === true) {
    console.log(`\n✅ Action '${action.observations[0]}' is already marked complete.\n`);
    return;
  }
  
  // Mark as complete
  action.metadata = action.metadata || {};
  action.metadata.completionStatus = true;
  action.metadata.updatedAt = new Date().toISOString();
  
  await saveGraph(memoryPath, graph);
  
  console.log(`\n✅ Action step marked complete: ${action.observations[0]}\n`);
}

async function setDueDate(chartId: string, dateStr: string, memoryPath: string): Promise<void> {
  const graph = await loadGraph(memoryPath);
  const chart = graph.entities.find(e =>
    e.entityType === 'structural_tension_chart' && e.metadata?.chartId === chartId
  );
  
  if (!chart) {
    console.log(`\n❌ Chart '${chartId}' not found.\n`);
    return;
  }
  
  // Parse and validate date
  const newDate = new Date(dateStr);
  if (isNaN(newDate.getTime())) {
    console.log(`\n❌ Invalid date format: ${dateStr}\n`);
    console.log('💡 Use ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss\n');
    return;
  }
  
  chart.metadata = chart.metadata || {};
  chart.metadata.dueDate = newDate.toISOString();
  chart.metadata.updatedAt = new Date().toISOString();
  
  await saveGraph(memoryPath, graph);
  
  console.log(`\n✅ Due date updated for chart ${chartId}`);
  console.log(`   New date: ${formatDate(chart.metadata.dueDate)}\n`);
}

// ==================== MAIN ====================

async function main() {
  const args = minimist(process.argv.slice(2));
  const command = args._[0];
  const config = loadConfig(args);
  
  try {
    switch (command) {
      case 'list':
      case 'ls':
        await listCharts(config.memoryPath);
        break;
        
      case 'view':
      case 'v':
      case 'show':
        if (!args._[1]) {
          console.log('\n❌ Error: Chart ID required\n');
          console.log('Usage: cnarrative view <chartId>\n');
          process.exit(1);
        }
        await viewChart(args._[1], config.memoryPath);
        break;
      
      case 'current':
      case 'cur':
        if (args._[1]) {
          await setCurrentChart(args._[1], config.memoryPath);
        } else {
          await getCurrentChart(config);
        }
        break;
        
      case 'update':
      case 'up':
        const updateChartId = args._[1] || config.currentChart;
        if (!updateChartId) {
          console.log('\n❌ Error: Chart ID required or set current chart\n');
          console.log('Usage: cnarrative update <chartId>\n');
          console.log('   or: cnarrative current <chartId> && cnarrative update\n');
          process.exit(1);
        }
        await updateChart(updateChartId, config.memoryPath);
        break;
      
      case 'add-action':
      case 'aa':
        const aaChartId = args._[1] || config.currentChart;
        if (!aaChartId) {
          console.log('\n❌ Error: Chart ID required or set current chart\n');
          console.log('Usage: cnarrative add-action <chartId>\n');
          process.exit(1);
        }
        await addAction(aaChartId, config.memoryPath);
        break;
      
      case 'add-observation':
      case 'add-obs':
      case 'ao':
        const aoChartId = args._[1] || config.currentChart;
        if (!aoChartId) {
          console.log('\n❌ Error: Chart ID required or set current chart\n');
          console.log('Usage: cnarrative add-obs <chartId>\n');
          process.exit(1);
        }
        await addObservation(aoChartId, config.memoryPath);
        break;
      
      case 'complete':
      case 'done':
        if (!args._[1]) {
          console.log('\n❌ Error: Action step name required\n');
          console.log('Usage: cnarrative complete <actionStepName>\n');
          console.log('Example: cnarrative complete chart_123_action_1\n');
          process.exit(1);
        }
        await completeAction(args._[1], config.memoryPath);
        break;
      
      case 'set-date':
      case 'sd':
        const sdChartId = args._[1];
        const dateStr = args._[2];
        if (!sdChartId || !dateStr) {
          console.log('\n❌ Error: Chart ID and date required\n');
          console.log('Usage: cnarrative set-date <chartId> <date>\n');
          console.log('Example: cnarrative set-date chart_123 2026-12-31\n');
          process.exit(1);
        }
        await setDueDate(sdChartId, dateStr, config.memoryPath);
        break;
        
      case 'stats':
      case 'st':
      case 'statistics':
        await showStats(config.memoryPath, config.jsonOutput);
        break;
        
      case 'progress':
      case 'pg':
        if (!args._[1]) {
          console.log('\n❌ Error: Chart ID required\n');
          console.log('Usage: cnarrative progress <chartId>\n');
          process.exit(1);
        }
        await showProgress(args._[1], config.memoryPath);
        break;
        
      case 'help':
      case 'h':
      case '--help':
      case '-h':
        showHelp();
        break;
        
      case 'version':
      case 'ver':
      case '--version':
      case '-v':
        console.log('\nCOAIA Narrative CLI v0.6.0');
        console.log('Structural Tension Chart Visualizer');
        console.log('Author: Guillaume D.Isabelle\n');
        break;
        
default:
        if (!command) {
          showHelp();
        } else {
          console.log(`\n❌ Unknown command: ${command}\n`);
          console.log(`💡 Use 'cnarrative help' to see available commands\n`);
          process.exit(1);
        }
    }
  } catch (error) {
    console.error('\n❌ Error:', (error as Error).message, '\n');
    process.exit(1);
  }
}

main();