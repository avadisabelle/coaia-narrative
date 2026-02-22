#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from 'fs';
import path from 'path';
import { LLM_GUIDANCE } from "./generated-llm-guidance.js";
import { fileURLToPath } from 'url';
import minimist from 'minimist';
import { isAbsolute } from 'path';
import { validate, ValidationSchemas } from './validation.js';

// Parse args and handle paths safely
const argv = minimist(process.argv.slice(2));

// Handle help command
if (argv.help || argv.h) {
  console.log(`
🧠 COAIA Memory - Creative-Oriented AI Assistant Memory System v2.1.0
   Based on Robert Fritz's Structural Tension methodology

DESCRIPTION:
   MCP server that extends knowledge graphs with structural tension charts for 
   creative-oriented memory management. Supports advancing patterns, telescoping
   charts, and natural language interaction for AI assistants.

USAGE:
   coaia-memory [OPTIONS]
   npx coaia-memory [OPTIONS]

OPTIONS:
   --memory-path PATH    Custom path for memory storage (default: ./memory.jsonl)
   --help, -h           Show this help message

ENVIRONMENT VARIABLES:
   COAIA_TOOLS          Comma or space separated list of tool groups and/or individual tools to enable
                        (default: "STC_TOOLS,init_llm_guidance")

   COAIA_DISABLED_TOOLS Comma or space separated list of tools to disable
                        (useful for selectively removing tools from a group)

TOOL GROUPS:
   STC_TOOLS            All structural tension chart tools (11 tools) - recommended for creative work
   KG_TOOLS             All knowledge graph tools (9 tools) - for traditional entity/relation work
   CORE_TOOLS           Essential tools only (4 tools) - minimal viable set

EXAMPLES:
   # Use only STC tools (default)
   coaia-memory --memory-path ./memory.jsonl

   # Enable both STC and KG tools
   COAIA_TOOLS="STC_TOOLS KG_TOOLS" coaia-memory --memory-path ./memory.jsonl

   # Use only core tools
   COAIA_TOOLS="CORE_TOOLS" coaia-memory --memory-path ./memory.jsonl

   # Enable STC tools but disable specific tools
   COAIA_TOOLS="STC_TOOLS" COAIA_DISABLED_TOOLS="delete_entities,delete_relations" coaia-memory

   # Enable specific individual tools
   COAIA_TOOLS="create_structural_tension_chart add_action_step list_active_charts" coaia-memory

CORE FEATURES:
   
   📊 Structural Tension Charts
   • Create charts with desired outcomes, current reality, and action steps
   • Automatic due date distribution for strategic timing
   • Progress tracking and completion monitoring
   
   🔭 Telescoping Support  
   • Break down action steps into detailed sub-charts
   • Proper due date inheritance from parent steps
   • Navigate between overview and details seamlessly
   
   📈 Advancing Patterns
   • Completed actions flow into current reality automatically  
   • Success builds momentum for continued advancement
   • Prevents oscillating patterns through structural awareness

MCP TOOLS AVAILABLE:
   
   Chart Management (Common Workflow):
   • list_active_charts            - START HERE: See all charts and their progress
   • add_action_step               - Add strategic actions to existing charts  
   • telescope_action_step         - Break down action steps into detailed sub-charts
   • update_action_progress        - Track progress without completing actions
   • mark_action_complete          - Complete actions & update reality
   • update_current_reality        - Add observations directly to current reality
   • create_structural_tension_chart - Create new chart with outcome & reality
   
   Chart Analysis (Advanced):
   • get_chart_progress            - Detailed progress (redundant after list_active_charts)
   • open_nodes                    - Inspect specific chart components by exact name
   • read_graph                    - Dump all data (rarely needed)
   
   Knowledge Graph (Traditional):
   • create_entities               - Add entities (people, concepts, events)
   • create_relations              - Connect entities with relationships  
   • add_observations              - Record information about entities
   • search_nodes                  - Search across all stored information
   • read_graph                    - Export complete graph structure

EXAMPLE USAGE:

   # Start with custom memory path
   coaia-memory --memory-path /path/to/my-charts.jsonl
   
   # Use in Claude Desktop (add to claude_desktop_config.json):
   {
     "mcpServers": {
       "coaia-memory": {
         "command": "npx", 
         "args": ["-y", "coaia-memory", "--memory-path", "./charts.jsonl"]
       }
     }
   }

NATURAL LANGUAGE PATTERNS:

   Creating Charts:
   "I want to create a mobile app in 3 months"
   "My desired outcome is to establish a morning routine"
   
   Progress Tracking:
   "I completed the research phase yesterday"  
   "Show me progress on my Python learning goal"
   
   Telescoping:
   "Break down the Django tutorial step further"
   "I need more detail on the deployment action"

CREATIVE ORIENTATION PRINCIPLES:

   ✅ Focus on Creation (not problem-solving):
      • "I want to create..." vs "I need to fix..."
      • "My desired outcome..." vs "The problem is..."
   
   ✅ Structural Tension Awareness:
      • Always pair desired outcomes with current reality
      • Honest assessment creates productive tension
      • Action steps are strategic secondary action we choose todo to achive the primary goal
   
   ✅ Advancing Patterns:
      • Success builds on success
      • Completed actions become part of current reality
      • Momentum creates natural progression toward goals

PHILOSOPHY:
   COAIA Memory recognizes that structure determines behavior. By organizing
   memory around structural tension rather than problem-solving patterns, it
   naturally forms a structure that advances and helps build, not just the life you want, but the technologies to supports it's manifestation (hopefully!).

CREDITS:
   • Author: J.Guillaume D.-Isabelle <jgi@jgwill.com>
   • Methodology: Robert Fritz - https://robertfritz.com
   • Foundation: Shane Holloman (original mcp-knowledge-graph)
   • License: MIT

For more information, see: CLAUDE.md in the package directory
`);
  process.exit(0);
}

let memoryPath = argv['memory-path'];

// If a custom path is provided, ensure it's absolute
if (memoryPath && !isAbsolute(memoryPath)) {
    memoryPath = path.resolve(process.cwd(), memoryPath);
}

// Tool filtering configuration
const TOOL_GROUPS = {
  STC_TOOLS: [
    'create_structural_tension_chart',
    'telescope_action_step',
    'add_action_step',
    'remove_action_step',
    'mark_action_complete',
    'get_chart_progress',
    'list_active_charts',
    'get_chart',
    'get_action_step',
    'update_action_progress',
    'update_current_reality',
    'update_desired_outcome',
    'perform_mmot_evaluation'
  ],
  NARRATIVE_TOOLS: [
    'create_narrative_beat',
    'telescope_narrative_beat',
    'list_narrative_beats'
  ],
  KG_TOOLS: [
    'create_entities',
    'create_relations',
    'add_observations',
    'delete_entities',
    'delete_observations',
    'delete_relations',
    'search_nodes',
    'open_nodes',
    'read_graph'
  ],
  CORE_TOOLS: [
    'list_active_charts',
    'create_structural_tension_chart',
    'add_action_step',
    'mark_action_complete'
  ]
};

function getEnabledTools(): Set<string> {
  const enabledTools = new Set<string>();

  // Check for COAIA_DISABLED_TOOLS env var (comma or space separated)
  const disabledStr = process.env.COAIA_DISABLED_TOOLS || '';
  const disabledTools = new Set(
    disabledStr.split(/[,\s]+/).filter(t => t.trim())
  );

  // Determine which tools to enable
  const enabledGroupsStr = process.env.COAIA_TOOLS || 'STC_TOOLS,NARRATIVE_TOOLS,init_llm_guidance';
  const enabledGroups = enabledGroupsStr.split(/[,\s]+/).filter(t => t.trim());

  enabledGroups.forEach(group => {
    const groupTools = (TOOL_GROUPS as Record<string, string[]>)[group];
    if (groupTools) {
      groupTools.forEach(tool => enabledTools.add(tool));
    } else {
      // Assume it's an individual tool name
      enabledTools.add(group);
    }
  });

  // Remove disabled tools
  disabledTools.forEach(tool => enabledTools.delete(tool));

  return enabledTools;
}

// Define the path to the JSONL file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Use the custom path or default to the installation directory
const MEMORY_FILE_PATH = memoryPath || path.join(__dirname, 'memory.jsonl');

// We are storing our memory using entities, relations, and observations in a graph structure
// Extended for Creative Orientation AI Assistant (COAIA) with structural tension support
// AND narrative beat support for multi-universe story capture
interface Entity {
  name: string;
  entityType: string;
  observations: string[];
  metadata?: {
    dueDate?: string;
    chartId?: string;
    phase?: 'germination' | 'assimilation' | 'completion';
    completionStatus?: boolean;
    parentChart?: string;
    parentActionStep?: string;
    level?: number;
    createdAt?: string;
    updatedAt?: string;
    // Narrative beat specific metadata
    act?: number;
    type_dramatic?: string;
    universes?: string[];
    timestamp?: string;
    elementsOfPerformance?: Array<{
      description: string;
      type: 'DESIGN' | 'EXECUTION';
    }>;
    mmotEvaluations?: Array<{
      phase: 'acknowledge' | 'analyze' | 'update' | 'recommit';
      assessment: string;
      direction?: 'South' | 'East' | 'West' | 'North';
      timestamp: string;
    }>;
    relationalAlignment?: {
      assessed: boolean;
      score: number | null;
      principles: string[];
    };
    fourDirections?: {
      north_vision: string | null;
      east_intention: string | null;
      south_emotion: string | null;
      west_introspection: string | null;
    };
    narrative?: {
      description: string;
      prose: string;
      lessons: string[];
    };
  };
}

interface Relation {
  from: string;
  to: string;
  relationType: string;
  metadata?: {
    createdAt?: string;
    strength?: number;
    context?: string;
    description?: string;
  };
}

interface KnowledgeGraph {
  entities: Entity[];
  relations: Relation[];
}

// The KnowledgeGraphManager class contains all operations to interact with the knowledge graph
class KnowledgeGraphManager {
  private async loadGraph(): Promise<KnowledgeGraph> {
    try {
      const data = await fs.readFile(MEMORY_FILE_PATH, "utf-8");
      const lines = data.split("\n").filter(line => line.trim() !== "");
      return lines.reduce((graph: KnowledgeGraph, line) => {
        const item = JSON.parse(line);
        if (item.type === "entity") graph.entities.push(item as Entity);
        if (item.type === "relation") graph.relations.push(item as Relation);
        // Support narrative_beat entities (convert to entity format)
        if (item.type === "narrative_beat") {
          const narrativeBeat: Entity = {
            name: item.name,
            entityType: 'narrative_beat',
            observations: item.observations || [],
            metadata: {
              ...item.metadata,
              narrative: item.narrative,
              relationalAlignment: item.relational_alignment,
              fourDirections: item.four_directions
            }
          };
          graph.entities.push(narrativeBeat);
        }
        return graph;
      }, { entities: [], relations: [] });
    } catch (error) {
      if (error instanceof Error && 'code' in error && (error as any).code === "ENOENT") {
        return { entities: [], relations: [] };
      }
      throw error;
    }
  }

  // Helper function to extract current reality from user context
  // Maintains structural tension by requiring explicit assessment
  private extractCurrentRealityFromContext(userInput: string, actionStepTitle: string): string | null {
    // Common patterns that indicate current reality assessment
    const realityPatterns = [
      /(?:currently|right now|at present|today)\s+(.{10,})/i,
      /(?:i am|we are|the situation is)\s+(.{10,})/i,
      /(?:i have|we have|there is|there are)\s+(.{10,})/i,
      /(?:my current|our current|the current)\s+(.{10,})/i
    ];

    for (const pattern of realityPatterns) {
      const match = userInput.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // If no explicit current reality found, require assessment
    return null;
  }

  private async saveGraph(graph: KnowledgeGraph): Promise<void> {
    const lines = [
      ...graph.entities.map(e => JSON.stringify({ type: "entity", ...e })),
      ...graph.relations.map(r => JSON.stringify({ type: "relation", ...r })),
    ];
    await fs.writeFile(MEMORY_FILE_PATH, lines.join("\n"));
  }

  async createEntities(entities: Entity[]): Promise<Entity[]> {
    const graph = await this.loadGraph();
    const newEntities = entities.filter(e => !graph.entities.some(existingEntity => existingEntity.name === e.name));
    graph.entities.push(...newEntities);
    await this.saveGraph(graph);
    return newEntities;
  }

  async createRelations(relations: Relation[]): Promise<Relation[]> {
    const graph = await this.loadGraph();
    const newRelations = relations.filter(r => !graph.relations.some(existingRelation =>
      existingRelation.from === r.from &&
      existingRelation.to === r.to &&
      existingRelation.relationType === r.relationType
    ));
    graph.relations.push(...newRelations);
    await this.saveGraph(graph);
    return newRelations;
  }

  async addObservations(observations: { entityName: string; contents: string[] }[]): Promise<{ entityName: string; addedObservations: string[] }[]> {
    const graph = await this.loadGraph();
    const results = observations.map(o => {
      const entity = graph.entities.find(e => e.name === o.entityName);
      if (!entity) {
        throw new Error(`Entity with name ${o.entityName} not found`);
      }
      const newObservations = o.contents.filter(content => !entity.observations.includes(content));
      entity.observations.push(...newObservations);
      return { entityName: o.entityName, addedObservations: newObservations };
    });
    await this.saveGraph(graph);
    return results;
  }

  async deleteEntities(entityNames: string[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.entities = graph.entities.filter(e => !entityNames.includes(e.name));
    graph.relations = graph.relations.filter(r => !entityNames.includes(r.from) && !entityNames.includes(r.to));
    await this.saveGraph(graph);
  }

  async deleteObservations(deletions: { entityName: string; observations: string[] }[]): Promise<void> {
    const graph = await this.loadGraph();
    deletions.forEach(d => {
      const entity = graph.entities.find(e => e.name === d.entityName);
      if (entity) {
        entity.observations = entity.observations.filter(o => !d.observations.includes(o));
      }
    });
    await this.saveGraph(graph);
  }

  async deleteRelations(relations: Relation[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.relations = graph.relations.filter(r => !relations.some(delRelation =>
      r.from === delRelation.from &&
      r.to === delRelation.to &&
      r.relationType === delRelation.relationType
    ));
    await this.saveGraph(graph);
  }

  async readGraph(): Promise<KnowledgeGraph> {
    return this.loadGraph();
  }

  // Very basic search function
  async searchNodes(query: string): Promise<KnowledgeGraph> {
    const graph = await this.loadGraph();

    // Filter entities
    const filteredEntities = graph.entities.filter(e =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.entityType.toLowerCase().includes(query.toLowerCase()) ||
      e.observations.some(o => o.toLowerCase().includes(query.toLowerCase()))
    );

    // Create a Set of filtered entity names for quick lookup
    const filteredEntityNames = new Set(filteredEntities.map(e => e.name));

    // Filter relations to only include those between filtered entities
    const filteredRelations = graph.relations.filter(r =>
      filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
    );

    const filteredGraph: KnowledgeGraph = {
      entities: filteredEntities,
      relations: filteredRelations,
    };

    return filteredGraph;
  }

  async openNodes(names: string[]): Promise<KnowledgeGraph> {
    const graph = await this.loadGraph();

    // Filter entities
    const filteredEntities = graph.entities.filter(e => names.includes(e.name));

    // Create a Set of filtered entity names for quick lookup
    const filteredEntityNames = new Set(filteredEntities.map(e => e.name));

    // Filter relations to only include those between filtered entities
    const filteredRelations = graph.relations.filter(r =>
      filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
    );

    const filteredGraph: KnowledgeGraph = {
      entities: filteredEntities,
      relations: filteredRelations,
    };

    return filteredGraph;
  }

  async getChartDetails(chartId: string): Promise<KnowledgeGraph | null> {
    const graph = await this.loadGraph();
    const chartEntities = graph.entities.filter(e => e.metadata?.chartId === chartId);
    if (chartEntities.length === 0) {
      return null;
    }
    const chartEntityNames = new Set(chartEntities.map(e => e.name));
    const chartRelations = graph.relations.filter(r =>
      chartEntityNames.has(r.from) && chartEntityNames.has(r.to)
    );
    return {
      entities: chartEntities,
      relations: chartRelations,
    };
  }

  async getActionStepDetails(actionStepName: string): Promise<KnowledgeGraph | null> {
    const graph = await this.loadGraph();
    const actionStepEntity = graph.entities.find(e => e.name === actionStepName && (e.entityType === 'action_step' || e.entityType === 'desired_outcome'));
    if (!actionStepEntity) {
      return null;
    }
    
    // Find the telescoped chart by following the telescopes_into relation
    const telescopesRelation = graph.relations.find(
      r => r.from === actionStepName && r.relationType === 'telescopes_into'
    );
    
    if (!telescopesRelation) {
      return null;
    }
    
    // The relation points to the desired_outcome entity of the telescoped chart
    const telescopedOutcomeEntity = graph.entities.find(e => e.name === telescopesRelation.to);
    if (!telescopedOutcomeEntity || !telescopedOutcomeEntity.metadata?.chartId) {
      return null;
    }
    
    return this.getChartDetails(telescopedOutcomeEntity.metadata.chartId);
  }

  // COAIA-specific methods for structural tension charts and creative processes

  async createStructuralTensionChart(
    desiredOutcome: string,
    currentReality: string,
    dueDate: string,
    actionSteps?: string[],
    elementsOfPerformance?: Array<{ description: string; type: 'DESIGN' | 'EXECUTION' }>
  ): Promise<{ chartId: string; entities: Entity[]; relations: Relation[] }> {
    // Educational validation for creative orientation
    const problemSolvingWords = ['fix', 'solve', 'eliminate', 'prevent', 'stop', 'avoid', 'reduce', 'remove'];
    const detectedProblemWords = problemSolvingWords.filter(word => 
      desiredOutcome.toLowerCase().includes(word)
    );
    
    if (detectedProblemWords.length > 0) {
      throw new Error(`🌊 CREATIVE ORIENTATION REQUIRED

Desired Outcome: "${desiredOutcome}"

❌ **Problem**: Contains problem-solving language: "${detectedProblemWords.join(', ')}"
📚 **Principle**: Structural Tension Charts use creative orientation - focus on what you want to CREATE, not what you want to eliminate.

🎯 **Reframe Your Outcome**:
Instead of elimination → Creation focus

✅ **Examples**:
- Instead of: "Fix communication problems"
- Use: "Establish clear, effective communication practices"

- Instead of: "Reduce website loading time"  
- Use: "Achieve fast, responsive website performance"

**Why This Matters**: Problem-solving creates oscillating patterns. Creative orientation creates advancing patterns toward desired outcomes.

💡 **Tip**: Run 'init_llm_guidance' for complete methodology overview.`);
    }
    
    // Educational validation for current reality
    const readinessWords = ['ready to', 'prepared to', 'all set', 'ready for', 'set to'];
    const detectedReadinessWords = readinessWords.filter(phrase => 
      currentReality.toLowerCase().includes(phrase)
    );
    
    if (detectedReadinessWords.length > 0) {
      throw new Error(`🌊 DELAYED RESOLUTION PRINCIPLE VIOLATION

Current Reality: "${currentReality}"

❌ **Problem**: Contains readiness assumptions: "${detectedReadinessWords.join(', ')}"
📚 **Principle**: "Tolerate discrepancy, tension, and delayed resolution" - Robert Fritz

🎯 **What's Needed**: Factual assessment of your actual current state (not readiness or preparation).

✅ **Examples**:
- Instead of: "Ready to learn Python"
- Use: "Never programmed before, interested in web development"

- Instead of: "Prepared to start the project"
- Use: "Have project requirements, no code written yet"

**Why This Matters**: Readiness assumptions prematurely resolve the structural tension needed for creative advancement.

💡 **Tip**: Run 'init_llm_guidance' for complete methodology overview.`);
    }

    const chartId = `chart_${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    // Create chart, desired outcome, and current reality entities
    const entities: Entity[] = [
      {
        name: `${chartId}_chart`,
        entityType: 'structural_tension_chart',
        observations: [`Chart created on ${timestamp}`],
        metadata: {
          chartId,
          dueDate,
          level: 0,
          createdAt: timestamp,
          updatedAt: timestamp,
          ...(elementsOfPerformance && elementsOfPerformance.length > 0 ? { elementsOfPerformance } : {})
        }
      },
      {
        name: `${chartId}_desired_outcome`,
        entityType: 'desired_outcome',
        observations: [desiredOutcome],
        metadata: {
          chartId,
          dueDate,
          createdAt: timestamp,
          updatedAt: timestamp
        }
      },
      {
        name: `${chartId}_current_reality`,
        entityType: 'current_reality',
        observations: [currentReality],
        metadata: {
          chartId,
          createdAt: timestamp,
          updatedAt: timestamp
        }
      }
    ];

    // Add action steps if provided
    if (actionSteps && actionSteps.length > 0) {
      const stepDueDates = this.distributeActionStepDates(new Date(), new Date(dueDate), actionSteps.length);
      
      actionSteps.forEach((step, index) => {
        entities.push({
          name: `${chartId}_action_${index + 1}`,
          entityType: 'action_step',
          observations: [step],
          metadata: {
            chartId,
            dueDate: stepDueDates[index].toISOString(),
            completionStatus: false,
            createdAt: timestamp,
            updatedAt: timestamp
          }
        });
      });
    }

    // Create relations
    const relations: Relation[] = [
      {
        from: `${chartId}_chart`,
        to: `${chartId}_desired_outcome`,
        relationType: 'contains',
        metadata: { createdAt: timestamp }
      },
      {
        from: `${chartId}_chart`,
        to: `${chartId}_current_reality`,
        relationType: 'contains',
        metadata: { createdAt: timestamp }
      },
      {
        from: `${chartId}_current_reality`,
        to: `${chartId}_desired_outcome`,
        relationType: 'creates_tension_with',
        metadata: { createdAt: timestamp }
      }
    ];

    // Add action step relations
    if (actionSteps && actionSteps.length > 0) {
      actionSteps.forEach((_, index) => {
        const actionName = `${chartId}_action_${index + 1}`;
        relations.push(
          {
            from: `${chartId}_chart`,
            to: actionName,
            relationType: 'contains',
            metadata: { createdAt: timestamp }
          },
          {
            from: actionName,
            to: `${chartId}_desired_outcome`,
            relationType: 'advances_toward',
            metadata: { createdAt: timestamp }
          }
        );
      });
    }

    // Save to graph
    await this.createEntities(entities);
    await this.createRelations(relations);

    return { chartId, entities, relations };
  }

  async telescopeActionStep(
    actionStepName: string,
    newCurrentReality: string,
    initialActionSteps?: string[]
  ): Promise<{ chartId: string; parentChart: string }> {
    const graph = await this.loadGraph();
    const actionStep = graph.entities.find(e => e.name === actionStepName && e.entityType === 'action_step');
    
    if (!actionStep || !actionStep.metadata?.chartId) {
      throw new Error(`Action step ${actionStepName} not found or not properly configured`);
    }

    const parentChartId = actionStep.metadata.chartId;
    const inheritedDueDate = actionStep.metadata.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const desiredOutcome = actionStep.observations[0]; // Use the action step description as the new desired outcome

    const result = await this.createStructuralTensionChart(
      desiredOutcome,
      newCurrentReality,
      inheritedDueDate,
      initialActionSteps
    );

    // Update the new chart's metadata to reflect telescoping relationship
    const newChart = await this.loadGraph();
    const chartEntity = newChart.entities.find(e => e.name === `${result.chartId}_chart`);
    if (chartEntity && chartEntity.metadata) {
      chartEntity.metadata.parentChart = parentChartId;
      chartEntity.metadata.parentActionStep = actionStepName;
      chartEntity.metadata.level = (actionStep.metadata.level || 0) + 1;
      chartEntity.metadata.updatedAt = new Date().toISOString();
    }

    await this.saveGraph(newChart);

    return { chartId: result.chartId, parentChart: parentChartId };
  }

  async markActionStepComplete(actionStepName: string): Promise<void> {
    const graph = await this.loadGraph();
    // An "action step" can be a 'desired_outcome' of a sub-chart, or a simple 'action_step' entity.
    const actionStep = graph.entities.find(e => e.name === actionStepName && (e.entityType === 'action_step' || e.entityType === 'desired_outcome'));

    if (!actionStep) {
      throw new Error(`Action step ${actionStepName} not found`);
    }

    const chartId = actionStep.metadata?.chartId;
    if (!chartId) {
      throw new Error(`Chart ID not found for action step ${actionStepName}`);
    }

    // Mark the action step itself as complete
    if (actionStep.metadata) {
      actionStep.metadata.completionStatus = true;
      actionStep.metadata.updatedAt = new Date().toISOString();
    }

    // Also mark the parent chart entity as complete
    const chartEntity = graph.entities.find(e => e.name === `${chartId}_chart`);
    if (chartEntity && chartEntity.metadata) {
      chartEntity.metadata.completionStatus = true;
      chartEntity.metadata.updatedAt = new Date().toISOString();
    }

    // Structural tension principle: completed action steps flow into the CURRENT REALITY
    // of the PARENT chart, advancing the overall structure.
    const parentChartId = chartEntity?.metadata?.parentChart;
    if (parentChartId) {
      const parentCurrentReality = graph.entities.find(e =>
        e.name === `${parentChartId}_current_reality` &&
        e.entityType === 'current_reality'
      );

      if (parentCurrentReality) {
        const completionMessage = `Completed: ${actionStep.observations[0]}`;
        if (!parentCurrentReality.observations.includes(completionMessage)) {
          parentCurrentReality.observations.push(completionMessage);
          if (parentCurrentReality.metadata) {
            parentCurrentReality.metadata.updatedAt = new Date().toISOString();
          }
        }
      }
    }

    await this.saveGraph(graph);
  }

  async getChartProgress(chartId: string): Promise<{
    chartId: string;
    progress: number;
    completedActions: number;
    totalActions: number;
    nextAction?: string;
    dueDate?: string;
  }> {
    const graph = await this.loadGraph();
    const actionSteps = graph.entities.filter(e => 
      e.entityType === 'action_step' && 
      e.metadata?.chartId === chartId
    );

    const completedActions = actionSteps.filter(e => e.metadata?.completionStatus === true).length;
    const totalActions = actionSteps.length;
    const progress = totalActions > 0 ? completedActions / totalActions : 0;

    // Find next incomplete action step with earliest due date
    const incompleteActions = actionSteps
      .filter(e => e.metadata?.completionStatus !== true)
      .sort((a, b) => {
        const dateA = new Date(a.metadata?.dueDate || '').getTime();
        const dateB = new Date(b.metadata?.dueDate || '').getTime();
        return dateA - dateB;
      });

    const chart = graph.entities.find(e => e.name === `${chartId}_chart`);

    return {
      chartId,
      progress,
      completedActions,
      totalActions,
      nextAction: incompleteActions[0]?.name,
      dueDate: chart?.metadata?.dueDate
    };
  }

  private distributeActionStepDates(startDate: Date, endDate: Date, stepCount: number): Date[] {
    const totalTime = endDate.getTime() - startDate.getTime();
    const stepInterval = totalTime / (stepCount + 1); // +1 to leave space before final due date
    
    const dates: Date[] = [];
    for (let i = 1; i <= stepCount; i++) {
      dates.push(new Date(startDate.getTime() + (stepInterval * i)));
    }
    
    return dates;
  }

  async listActiveCharts(): Promise<Array<{
    chartId: string;
    desiredOutcome: string;
    dueDate?: string;
    progress: number;
    completedActions: number;
    totalActions: number;
    level: number;
    parentChart?: string;
  }>> {
    const graph = await this.loadGraph();
    const charts = graph.entities.filter(e => e.entityType === 'structural_tension_chart');
    
    const chartSummaries = await Promise.all(
      charts.map(async (chart) => {
        const chartId = chart.metadata?.chartId || chart.name.replace('_chart', '');
        const progress = await this.getChartProgress(chartId);
        
        // Get desired outcome
        const desiredOutcome = graph.entities.find(e => 
          e.name === `${chartId}_desired_outcome` && e.entityType === 'desired_outcome'
        );
        
        return {
          chartId,
          desiredOutcome: desiredOutcome?.observations[0] || 'Unknown outcome',
          dueDate: chart.metadata?.dueDate,
          progress: progress.progress,
          completedActions: progress.completedActions,
          totalActions: progress.totalActions,
          level: chart.metadata?.level || 0,
          parentChart: chart.metadata?.parentChart
        };
      })
    );

    return chartSummaries.sort((a, b) => {
      // Sort by level first (master charts first), then by due date
      if (a.level !== b.level) return a.level - b.level;
      
      const dateA = new Date(a.dueDate || '').getTime();
      const dateB = new Date(b.dueDate || '').getTime();
      return dateA - dateB;
    });
  }

  async updateActionProgress(
    actionStepName: string, 
    progressObservation: string,
    updateCurrentReality?: boolean
  ): Promise<void> {
    const graph = await this.loadGraph();
    const actionStep = graph.entities.find(e => e.name === actionStepName && (e.entityType === 'action_step' || e.entityType === 'desired_outcome'));
    
    if (!actionStep) {
      throw new Error(`Action step ${actionStepName} not found`);
    }

    // Add progress observation to action step
    actionStep.observations.push(progressObservation);
    if (actionStep.metadata) {
      actionStep.metadata.updatedAt = new Date().toISOString();
    }

    // Optionally update current reality with progress
    if (updateCurrentReality && actionStep.metadata?.chartId) {
      const chartEntity = graph.entities.find(e => e.name === `${actionStep.metadata!.chartId}_chart`);
      const parentChartId = chartEntity?.metadata?.parentChart;
      const targetChartId = parentChartId || actionStep.metadata!.chartId;

      const currentReality = graph.entities.find(e => 
        e.name === `${targetChartId}_current_reality` && 
        e.entityType === 'current_reality'
      );
      
      if (currentReality) {
        // Progress observations flow into current reality, changing the structural dynamic
        const progressMessage = `Progress on ${actionStep.observations[0]}: ${progressObservation}`;
        if (!currentReality.observations.includes(progressMessage)) {
          currentReality.observations.push(progressMessage);
          if (currentReality.metadata) {
            currentReality.metadata.updatedAt = new Date().toISOString();
          }
        }
      }
    }

    await this.saveGraph(graph);
  }

  async updateCurrentReality(chartId: string, newObservations: string[]): Promise<void> {
    const graph = await this.loadGraph();
    const currentReality = graph.entities.find(e => 
      e.name === `${chartId}_current_reality` && 
      e.entityType === 'current_reality'
    );
    
    if (!currentReality) {
      throw new Error(`Chart ${chartId} not found or missing current reality`);
    }

    // Add new observations to current reality
    const uniqueObservations = newObservations.filter(obs => !currentReality.observations.includes(obs));
    currentReality.observations.push(...uniqueObservations);
    
    if (currentReality.metadata) {
      currentReality.metadata.updatedAt = new Date().toISOString();
    }

    await this.saveGraph(graph);
  }

  async updateDesiredOutcome(chartId: string, newDesiredOutcome: string): Promise<void> {
    const graph = await this.loadGraph();
    const desiredOutcomeEntity = graph.entities.find(e => 
      e.name === `${chartId}_desired_outcome` && e.entityType === 'desired_outcome'
    );
    
    if (!desiredOutcomeEntity) {
      throw new Error(`Chart ${chartId} desired outcome not found`);
    }

    // Replace the first observation (which is the desired outcome text)
    desiredOutcomeEntity.observations[0] = newDesiredOutcome;
    
    if (desiredOutcomeEntity.metadata) {
      desiredOutcomeEntity.metadata.updatedAt = new Date().toISOString();
    }

    await this.saveGraph(graph);
  }

  // MMOT Evaluation — autonomous self-evaluation loop on structural tension charts
  async performMmotEvaluation(
    chartId: string,
    phase: string = 'full',
    assessment?: string,
    direction?: 'South' | 'East' | 'West' | 'North',
    correctiveActions?: string[],
    updateReality: boolean = true
  ): Promise<{ guidance: string; evaluationStored: boolean; beatEmitted: boolean }> {
    const graph = await this.loadGraph();
    const chartEntity = graph.entities.find(e =>
      e.entityType === 'structural_tension_chart' && e.metadata?.chartId === chartId
    );
    if (!chartEntity) {
      throw new Error(`Chart ${chartId} not found`);
    }

    const desiredOutcome = graph.entities.find(e => e.name === `${chartId}_desired_outcome`);
    const currentReality = graph.entities.find(e => e.name === `${chartId}_current_reality`);
    const actionSteps = graph.entities.filter(e =>
      e.entityType === 'action_step' && e.metadata?.chartId === chartId
    );
    const completedActions = actionSteps.filter(a => a.metadata?.completionStatus);
    const totalActions = actionSteps.length;
    const progressPct = totalActions > 0 ? Math.round((completedActions.length / totalActions) * 100) : 0;

    // Retrieve Elements of Performance from chart metadata
    const elementsOfPerformance = chartEntity.metadata?.elementsOfPerformance || [];
    const designElements = elementsOfPerformance.filter((e: any) => e.type === 'DESIGN');
    const executionElements = elementsOfPerformance.filter((e: any) => e.type === 'EXECUTION');

    const directionLabel = direction ? ` [${direction}]` : '';
    const timestamp = new Date().toISOString();

    // Build phase-specific guidance
    const phaseGuidance: Record<string, string> = {
      acknowledge: `## MMOT Phase 1: Acknowledge the Truth${directionLabel}\n\n**Chart**: ${chartId}\n**Desired Outcome**: ${desiredOutcome?.observations[0] || 'Unknown'}\n**Current Reality**: ${currentReality?.observations.join('; ') || 'Unknown'}\n**Progress**: ${progressPct}% (${completedActions.length}/${totalActions} actions)\n\n${elementsOfPerformance.length > 0 ? `**Elements of Performance:**\n${designElements.map((e: any) => `- 🏗️ DESIGN: ${e.description}`).join('\n')}\n${executionElements.map((e: any) => `- ⚡ EXECUTION: ${e.description}`).join('\n')}\n\n` : ''}**Task**: Compare produced output against each element of performance. What difference exists between expected and delivered?\n\n${assessment ? `**Assessment**: ${assessment}` : 'Provide honest assessment of what was expected vs. what actually happened.'}`,

      analyze: `## MMOT Phase 2: Analyze How It Got There${directionLabel}\n\n**Task**: Blow-by-blow of what actions were taken and what dynamics produced the current result.\n- What assumptions were made?\n- What worked and what didn't?\n- What did the engagement reveal?\n\n${assessment ? `**Analysis**: ${assessment}` : 'Walk through the sequence of events that led to the current state.'}`,

      update: `## MMOT Phase 3: Update the Chart${directionLabel}\n\n**Task**: Based on what was learned:\n- Update current reality with new observations\n- Adjust remaining action steps\n- Add corrective actions if needed\n\n${assessment ? `**Updates Applied**: ${assessment}` : 'Describe what observations should flow into current reality.'}`,

      recommit: `## MMOT Phase 4: Recommit or Redirect${directionLabel}\n\n**Desired Outcome**: ${desiredOutcome?.observations[0] || 'Unknown'}\n\n**Task**: Is this desired outcome still what you want to create?\n- If yes: What are the next strategic secondary choices?\n- If no: Close this chart and create a new one with the actual desired outcome.\n\n${assessment ? `**Decision**: ${assessment}` : 'Recommit to the desired outcome or redirect.'}`
    };

    // Full review combines all phases
    if (phase === 'full') {
      phaseGuidance.full = Object.values(phaseGuidance).join('\n\n---\n\n');
    }

    const guidance = phaseGuidance[phase] || phaseGuidance.full || phaseGuidance.acknowledge;
    let evaluationStored = false;
    let beatEmitted = false;

    // Store evaluation observations
    if (assessment && updateReality) {
      const evalObservation = `[MMOT ${phase}${directionLabel}] ${assessment}`;

      // Add to current reality
      if (currentReality) {
        currentReality.observations.push(evalObservation);
        if (currentReality.metadata) {
          currentReality.metadata.updatedAt = timestamp;
        }
      }

      // Store MMOT evaluation in chart metadata
      if (!chartEntity.metadata!.mmotEvaluations) {
        chartEntity.metadata!.mmotEvaluations = [];
      }
      chartEntity.metadata!.mmotEvaluations.push({
        phase: phase as 'acknowledge' | 'analyze' | 'update' | 'recommit',
        assessment,
        direction,
        timestamp
      });
      chartEntity.metadata!.updatedAt = timestamp;

      evaluationStored = true;
    }

    // Add corrective action steps if provided
    if (correctiveActions && correctiveActions.length > 0) {
      const existingActionCount = actionSteps.length;
      correctiveActions.forEach((action, index) => {
        const actionName = `${chartId}_action_${existingActionCount + index + 1}`;
        graph.entities.push({
          name: actionName,
          entityType: 'action_step',
          observations: [action],
          metadata: {
            chartId,
            completionStatus: false,
            createdAt: timestamp,
            updatedAt: timestamp
          }
        });
        graph.relations.push({
          from: actionName,
          to: `${chartId}_desired_outcome`,
          relationType: 'advances_toward',
          metadata: { createdAt: timestamp }
        });
      });
    }

    // Emit MMOT evaluation as narrative beat (JSONL-compatible)
    const beatName = `${chartId}_mmot_${Date.now()}`;
    const mmotBeat: Entity = {
      name: beatName,
      entityType: 'narrative_beat',
      observations: [
        `MMOT evaluation: ${phase}${directionLabel}`,
        ...(assessment ? [`Assessment: ${assessment}`] : [])
      ],
      metadata: {
        chartId,
        type_dramatic: 'mmot_evaluation',
        timestamp,
        fourDirections: direction ? {
          north_vision: direction === 'North' ? assessment || null : null,
          east_intention: direction === 'East' ? assessment || null : null,
          south_emotion: direction === 'South' ? assessment || null : null,
          west_introspection: direction === 'West' ? assessment || null : null
        } : undefined
      }
    };
    graph.entities.push(mmotBeat);
    graph.relations.push({
      from: beatName,
      to: `${chartId}_chart`,
      relationType: 'evaluates',
      metadata: { createdAt: timestamp }
    });
    beatEmitted = true;

    await this.saveGraph(graph);

    return { guidance, evaluationStored, beatEmitted };
  }

  // Narrative beat creation functionality
  async createNarrativeBeat(
    parentChartId: string,
    title: string,
    act: number,
    type_dramatic: string,
    universes: string[],
    description: string,
    prose: string,
    lessons: string[],
    assessRelationalAlignment = false,
    initiateFourDirectionsInquiry = false,
    filePath?: string
  ): Promise<{ entity: Entity; beatName: string }> {
    const timestamp = Date.now();
    const beatName = `${parentChartId}_beat_${timestamp}`;
    
    // Create narrative beat entity
    const entity: Entity = {
      name: beatName,
      entityType: 'narrative_beat',
      observations: [
        `Act ${act} ${type_dramatic}`,
        `Timestamp: ${new Date().toISOString()}`,
        `Universe: ${universes.join(', ')}`
      ],
      metadata: {
        chartId: parentChartId,
        act,
        type_dramatic,
        universes,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        narrative: {
          description,
          prose,
          lessons
        },
        relationalAlignment: {
          assessed: false,
          score: null,
          principles: []
        },
        fourDirections: {
          north_vision: null,
          east_intention: null,
          south_emotion: null,
          west_introspection: null
        }
      }
    };

    // Add to graph
    await this.createEntities([entity]);

    // Create relation to parent chart if it exists
    const graph = await this.loadGraph();
    const parentChart = graph.entities.find(e => 
      e.entityType === 'structural_tension_chart' && e.metadata?.chartId === parentChartId
    );
    
    if (parentChart) {
      await this.createRelations([{
        from: beatName,
        to: `${parentChartId}_chart`,
        relationType: 'documents',
        metadata: { 
          createdAt: new Date().toISOString(),
          description: 'Narrative beat documents chart progress'
        }
      }]);
    }

    // TODO: IAIP integration would go here
    if (assessRelationalAlignment) {
      console.log('🔮 Relational alignment assessment requested (iaip-mcp integration pending)');
    }

    if (initiateFourDirectionsInquiry) {
      console.log('🧭 Four Directions inquiry requested (iaip-mcp integration pending)');
    }

    return { entity, beatName };
  }

  async telescopeNarrativeBeat(
    parentBeatName: string,
    newCurrentReality: string,
    initialSubBeats?: Array<{
      title: string;
      type_dramatic: string;
      description: string;
      prose: string;
      lessons: string[];
    }>
  ): Promise<{ parentBeat: Entity; subBeats: Entity[] }> {
    const graph = await this.loadGraph();
    const parentBeat = graph.entities.find(e => 
      e.name === parentBeatName && e.entityType === 'narrative_beat'
    );
    
    if (!parentBeat) {
      throw new Error(`Parent narrative beat not found: ${parentBeatName}`);
    }

    // Update parent beat's current reality (add to observations)
    parentBeat.observations.push(`Telescoped: ${newCurrentReality}`);
    if (parentBeat.metadata) {
      parentBeat.metadata.updatedAt = new Date().toISOString();
    }

    const subBeats: Entity[] = [];

    // Create sub-beats if provided
    if (initialSubBeats && initialSubBeats.length > 0) {
      for (let i = 0; i < initialSubBeats.length; i++) {
        const subBeat = initialSubBeats[i];
        
        const result = await this.createNarrativeBeat(
          parentBeatName, // Use parent beat as chart ID
          subBeat.title,
          i + 1, // Sequential act numbers
          subBeat.type_dramatic,
          parentBeat.metadata?.universes || ['engineer-world'],
          subBeat.description,
          subBeat.prose,
          subBeat.lessons
        );
        
        subBeats.push(result.entity);
      }
    }

    await this.saveGraph(graph);

    return { parentBeat, subBeats };
  }

  async listNarrativeBeats(parentChartId?: string): Promise<Entity[]> {
    const graph = await this.loadGraph();
    const beats = graph.entities.filter(e => e.entityType === 'narrative_beat');
    
    if (parentChartId) {
      return beats.filter(beat => beat.metadata?.chartId === parentChartId);
    }
    
    return beats;
  }

  async addActionStep(
    parentChartId: string,
    actionStepTitle: string,
    dueDate?: string,
    currentReality?: string,
    performanceElements?: Array<{ description: string; type: 'DESIGN' | 'EXECUTION' }>
  ): Promise<{ chartId: string; actionStepName: string }> {
    const graph = await this.loadGraph();
    const parentChart = graph.entities.find(e => 
      e.entityType === 'structural_tension_chart' && e.metadata?.chartId === parentChartId
    );
    
    if (!parentChart) {
      throw new Error(`Parent chart ${parentChartId} not found`);
    }

    // Get parent chart's due date for auto-distribution
    const parentDueDate = parentChart.metadata?.dueDate;
    if (!parentDueDate) {
      throw new Error(`Parent chart ${parentChartId} has no due date`);
    }

    // Calculate due date for action step if not provided
    let actionStepDueDate = dueDate;
    if (!actionStepDueDate) {
      // Distribute between now and parent due date (simple midpoint for now)
      const now = new Date();
      const parentEnd = new Date(parentDueDate);
      const midpoint = new Date(now.getTime() + (parentEnd.getTime() - now.getTime()) / 2);
      actionStepDueDate = midpoint.toISOString();
    }

    // Require current reality assessment - no defaults that prematurely resolve tension
    if (!currentReality) {
      throw new Error(`🌊 DELAYED RESOLUTION PRINCIPLE VIOLATION

Action step: "${actionStepTitle}"

❌ **Problem**: Current reality assessment missing
📚 **Principle**: "Tolerate discrepancy, tension, and delayed resolution" - Robert Fritz

🎯 **What's Needed**: Honest assessment of your actual current state relative to this action step.

✅ **Examples**:
- "Never used Django, completed Python basics"  
- "Built one API, struggling with authentication"
- "Read 3 chapters, concepts still unclear"

❌ **Avoid**: "Ready to begin", "Prepared to start", "All set to..."

**Why This Matters**: Premature resolution destroys the structural tension that generates creative advancement. The system NEEDS honest current reality to create productive tension.

💡 **Tip**: Run 'init_llm_guidance' for complete methodology overview.`);
    }
    
    const actionCurrentReality = currentReality;

    // Create telescoped structural tension chart
    const telescopedChart = await this.createStructuralTensionChart(
      actionStepTitle,
      actionCurrentReality,
      actionStepDueDate,
      undefined,
      performanceElements
    );

    // Update the telescoped chart's metadata to show parent relationship
    const updatedGraph = await this.loadGraph();
    const telescopedChartEntity = updatedGraph.entities.find(e => e.name === `${telescopedChart.chartId}_chart`);
    if (telescopedChartEntity && telescopedChartEntity.metadata) {
      telescopedChartEntity.metadata.parentChart = parentChartId;
      telescopedChartEntity.metadata.level = (parentChart.metadata?.level || 0) + 1;
      telescopedChartEntity.metadata.updatedAt = new Date().toISOString();
    }

    // Create relationship: telescoped chart advances toward parent's desired outcome
    const parentDesiredOutcome = updatedGraph.entities.find(e => 
      e.name === `${parentChartId}_desired_outcome` && e.entityType === 'desired_outcome'
    );

    if (parentDesiredOutcome) {
      const timestamp = new Date().toISOString();
      await this.createRelations([{
        from: `${telescopedChart.chartId}_desired_outcome`,
        to: parentDesiredOutcome.name,
        relationType: 'advances_toward',
        metadata: { createdAt: timestamp }
      }]);
    }

    await this.saveGraph(updatedGraph);

    return { 
      chartId: telescopedChart.chartId, 
      actionStepName: `${telescopedChart.chartId}_desired_outcome` 
    };
  }

  // Enhanced method for LLMs to telescope with intelligent current reality extraction
  async telescopeActionStepWithContext(
    parentChartId: string,
    actionStepTitle: string,
    userContext: string,
    currentReality?: string,
    dueDate?: string
  ): Promise<{ chartId: string; actionStepName: string }> {

    // If current reality not provided, try to extract from context
    let finalCurrentReality = currentReality;
    if (!finalCurrentReality) {
      finalCurrentReality = this.extractCurrentRealityFromContext(userContext, actionStepTitle) ?? undefined;
    }

    // If still no current reality, provide guidance while maintaining tension
    if (!finalCurrentReality) {
      throw new Error(
        `Current reality assessment needed for "${actionStepTitle}". ` +
        `Please assess your actual current state relative to this action step. ` +
        `Example: "I have never used Django before" or "I completed the basics but haven't built a real project" ` +
        `rather than assuming readiness. Structural tension requires honest current reality assessment.`
      );
    }

    // Proceed with telescoping using the assessed current reality
    return this.addActionStep(parentChartId, actionStepTitle, dueDate, finalCurrentReality);
  }

  // Unified interface for managing action steps - handles both creation and expansion
  async manageActionStep(
    parentReference: string,
    actionDescription: string,
    currentReality?: string,
    initialActionSteps?: string[],
    dueDate?: string,
    performanceElements?: Array<{ description: string; type: 'DESIGN' | 'EXECUTION' }>
  ): Promise<{ chartId: string; actionStepName: string }> {
    const graph = await this.loadGraph();

    // Pattern detection: Determine if parentReference is entity name or chart ID
    const actionStepPattern = /^chart_\d+_action_\d+$/;
    const desiredOutcomePattern = /^chart_\d+_desired_outcome$/;
    const chartIdPattern = /^chart_\d+$/;

    const isActionStepEntity = actionStepPattern.test(parentReference);
    const isDesiredOutcomeEntity = desiredOutcomePattern.test(parentReference);
    const isChartId = chartIdPattern.test(parentReference);

    // Route 1: Expanding existing action_step entity (legacy pattern)
    if (isActionStepEntity) {
      const actionStep = graph.entities.find(e =>
        e.name === parentReference && e.entityType === 'action_step'
      );

      if (!actionStep) {
        // Provide helpful error with available actions
        const allActionSteps = graph.entities
          .filter(e => e.entityType === 'action_step')
          .map(e => `- ${e.name}: "${e.observations[0]}"`);

        throw new Error(`🔍 ACTION STEP ENTITY NOT FOUND

Received: "${parentReference}"
Expected: Valid action_step entity name (e.g., "chart_123_action_1")

Available action steps in memory:
${allActionSteps.length > 0 ? allActionSteps.join('\n') : '(none found)'}

Tip: If creating a new action step, use the parent chart ID instead.`);
      }

      // Use telescoping logic for legacy action_step entities
      const currentRealityToUse = currentReality || "Expanding action step into detailed sub-chart";
      const telescopedResult = await this.telescopeActionStep(
        parentReference,
        currentRealityToUse,
        initialActionSteps
      );
      // Transform result to include actionStepName
      return {
        chartId: telescopedResult.chartId,
        actionStepName: `${telescopedResult.chartId}_desired_outcome`
      };
    }

    // Route 2: Expanding existing desired_outcome entity (modern pattern)
    if (isDesiredOutcomeEntity) {
      const desiredOutcome = graph.entities.find(e =>
        e.name === parentReference && e.entityType === 'desired_outcome'
      );

      if (!desiredOutcome || !desiredOutcome.metadata?.chartId) {
        throw new Error(`🔍 DESIRED OUTCOME ENTITY NOT FOUND

Received: "${parentReference}"
Expected: Valid desired_outcome entity name (e.g., "chart_123_desired_outcome")

Tip: If creating a new action step, use the parent chart ID instead.`);
      }

      // Use telescoping logic for desired_outcome entities
      const currentRealityToUse = currentReality || "Expanding desired outcome into detailed sub-chart";
      const telescopedResult = await this.telescopeActionStep(
        parentReference,
        currentRealityToUse,
        initialActionSteps
      );
      // Transform result to include actionStepName
      return {
        chartId: telescopedResult.chartId,
        actionStepName: `${telescopedResult.chartId}_desired_outcome`
      };
    }

    // Route 3: Creating new action step under parent chart (modern pattern)
    if (isChartId) {
      // Validate parent chart exists
      const parentChart = graph.entities.find(e =>
        e.entityType === 'structural_tension_chart' &&
        e.metadata?.chartId === parentReference
      );

      if (!parentChart) {
        // Provide helpful error with available charts
        const allCharts = graph.entities
          .filter(e => e.entityType === 'structural_tension_chart')
          .map(e => {
            const outcome = graph.entities.find(o =>
              o.name === `${e.metadata?.chartId}_desired_outcome`
            );
            return `- ${e.metadata?.chartId}: "${outcome?.observations[0] || 'Unknown'}"`;
          });

        throw new Error(`🔍 PARENT CHART NOT FOUND

Received: "${parentReference}"
Expected: Valid chart ID (e.g., "chart_123")

Available charts in memory:
${allCharts.length > 0 ? allCharts.join('\n') : '(none found)'}

Tip: Use 'list_active_charts' to see all available charts.`);
      }

      // Enforce delayed resolution principle for new action creation
      if (!currentReality) {
        throw new Error(`🌊 DELAYED RESOLUTION PRINCIPLE VIOLATION

Action step: "${actionDescription}"
Parent chart: "${parentReference}"

❌ **Problem**: Current reality assessment missing
📚 **Principle**: "Tolerate discrepancy, tension, and delayed resolution" - Robert Fritz

🎯 **What's Needed**: Honest assessment of actual current state relative to this action step.

✅ **Examples**:
- "Never used Django, completed Python basics"
- "Built one API, struggling with authentication"
- "Read 3 chapters, concepts still unclear"

❌ **Avoid**: "Ready to begin", "Prepared to start", "All set to..."

**Why This Matters**: Premature resolution destroys structural tension essential for creative advancement.

💡 **Tip**: Run 'init_llm_guidance' for complete methodology overview.`);
      }

      // Create new action step as telescoped chart
      return await this.addActionStep(
        parentReference,
        actionDescription,
        dueDate,
        currentReality,
        performanceElements
      );
    }

    // Route 4: Invalid format - provide comprehensive guidance
    throw new Error(`🚨 INVALID PARENT REFERENCE FORMAT

Received: "${parentReference}"

Valid formats:
1. Chart ID: "chart_123" → Creates new action step
2. Action entity: "chart_123_action_1" → Expands existing legacy action step
3. Desired outcome: "chart_123_desired_outcome" → Expands existing modern action step

Examples:
- Create new action: manageActionStep("chart_123", "Complete tutorial", "Never used Django")
- Expand existing: manageActionStep("chart_123_action_1", "Complete tutorial", undefined, ["Step 1", "Step 2"])

💡 **Tip**: Use 'list_active_charts' to see available charts and their IDs.`);
  }

  async removeActionStep(parentChartId: string, actionStepName: string): Promise<void> {
    const graph = await this.loadGraph();
    
    // Find the action step (which is actually a telescoped chart's desired outcome)
    const actionStepEntity = graph.entities.find(e => e.name === actionStepName);
    if (!actionStepEntity || !actionStepEntity.metadata?.chartId) {
      throw new Error(`Action step ${actionStepName} not found`);
    }

    const telescopedChartId = actionStepEntity.metadata.chartId;
    
    // Verify it belongs to the parent chart
    const telescopedChart = graph.entities.find(e => 
      e.entityType === 'structural_tension_chart' && 
      e.metadata?.chartId === telescopedChartId &&
      e.metadata?.parentChart === parentChartId
    );
    
    if (!telescopedChart) {
      throw new Error(`Action step ${actionStepName} does not belong to chart ${parentChartId}`);
    }

    // Remove all entities belonging to the telescoped chart
    const entitiesToRemove = graph.entities
      .filter(e => e.metadata?.chartId === telescopedChartId)
      .map(e => e.name);

    await this.deleteEntities(entitiesToRemove);
  }
}

const knowledgeGraphManager = new KnowledgeGraphManager();


// The server instance and tools exposed to AI models
const server = new Server({
  name: "coaia-narrative",
  version: "0.1.0",
  description: "COAIA Narrative - Structural Tension Charts with Narrative Beat Extension for multi-universe story capture. Extends coaia-memory with relational and ceremonial integration. 🚨 NEW LLM? Run 'init_llm_guidance' first."
},    {
    capabilities: {
      tools: {},
    },
  },);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const enabledTools = getEnabledTools();

  const allTools = [
      {
        name: "create_entities",
        description: "ADVANCED: Create traditional knowledge graph entities. For structural tension charts, use create_structural_tension_chart or add_action_step instead.",
        inputSchema: {
          type: "object",
          properties: {
            entities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "The name of the entity" },
                  entityType: { type: "string", description: "The type of the entity" },
                  observations: {
                    type: "array",
                    items: { type: "string" },
                    description: "An array of observation contents associated with the entity"
                  },
                },
                required: ["name", "entityType", "observations"],
              },
            },
          },
          required: ["entities"],
        },
      },
      {
        name: "create_relations",
        description: "Create multiple new relations between entities in the knowledge graph. Relations should be in active voice",
        inputSchema: {
          type: "object",
          properties: {
            relations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  from: { type: "string", description: "The name of the entity where the relation starts" },
                  to: { type: "string", description: "The name of the entity where the relation ends" },
                  relationType: { type: "string", description: "The type of the relation" },
                },
                required: ["from", "to", "relationType"],
              },
            },
          },
          required: ["relations"],
        },
      },
      {
        name: "add_observations",
        description: "ADVANCED: Add observations to traditional knowledge graph entities. For structural tension charts, use update_current_reality instead.",
        inputSchema: {
          type: "object",
          properties: {
            observations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  entityName: { type: "string", description: "The name of the entity to add the observations to" },
                  contents: {
                    type: "array",
                    items: { type: "string" },
                    description: "An array of observation contents to add"
                  },
                },
                required: ["entityName", "contents"],
              },
            },
          },
          required: ["observations"],
        },
      },
      {
        name: "delete_entities",
        description: "Delete multiple entities and their associated relations from the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            entityNames: {
              type: "array",
              items: { type: "string" },
              description: "An array of entity names to delete"
            },
          },
          required: ["entityNames"],
        },
      },
      {
        name: "delete_observations",
        description: "Delete specific observations from entities in the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            deletions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  entityName: { type: "string", description: "The name of the entity containing the observations" },
                  observations: {
                    type: "array",
                    items: { type: "string" },
                    description: "An array of observations to delete"
                  },
                },
                required: ["entityName", "observations"],
              },
            },
          },
          required: ["deletions"],
        },
      },
      {
        name: "delete_relations",
        description: "Delete multiple relations from the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            relations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  from: { type: "string", description: "The name of the entity where the relation starts" },
                  to: { type: "string", description: "The name of the entity where the relation ends" },
                  relationType: { type: "string", description: "The type of the relation" },
                },
                required: ["from", "to", "relationType"],
              },
              description: "An array of relations to delete"
            },
          },
          required: ["relations"],
        },
      },
      {
        name: "read_graph",
        description: "RARELY USED: Dumps entire knowledge graph (all entities and relations). Only use for debugging or when you need to see ALL data. For chart work, use list_active_charts instead.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "search_nodes",
        description: "Search for nodes in the knowledge graph based on a query",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "The search query to match against entity names, types, and observation content" },
          },
          required: ["query"],
        },
      },
      {
        name: "open_nodes",
        description: "ADVANCED: Open specific entity nodes by exact name (e.g. 'chart_123_current_reality'). Only use if you need to inspect specific chart components. NOT for general chart viewing - use list_active_charts instead.",
        inputSchema: {
          type: "object",
          properties: {
            names: {
              type: "array",
              items: { type: "string" },
              description: "An array of exact entity names to retrieve (e.g. 'chart_123_desired_outcome')",
            },
          },
          required: ["names"],
        },
      },
      {
        name: "create_structural_tension_chart", 
        description: "Create a new structural tension chart with desired outcome, current reality, and optional action steps. CRITICAL: Use creative orientation (what you want to CREATE) not problem-solving (what you want to fix/solve). Current reality must be factual assessment, never 'ready to begin'.",
        inputSchema: {
          type: "object",
          properties: {
            desiredOutcome: { type: "string", description: "What you want to CREATE (not solve/fix). Focus on positive outcomes, not problems to eliminate." },
            currentReality: { type: "string", description: "Your current situation - factual assessment only. NEVER use 'ready to begin' or similar readiness statements." },
            dueDate: { type: "string", description: "When you want to achieve this outcome (ISO date string)" },
            actionSteps: {
              type: "array",
              items: { type: "string" },
              description: "Optional list of action steps needed to achieve the outcome"
            },
            elementsOfPerformance: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string", description: "What is being evaluated" },
                  type: { type: "string", enum: ["DESIGN", "EXECUTION"], description: "DESIGN = structural intent/architecture, EXECUTION = delivery/implementation quality" }
                },
                required: ["description", "type"]
              },
              description: "Optional Elements of Performance for MMOT evaluation — criteria the agent uses to self-assess output"
            }
          },
          required: ["desiredOutcome", "currentReality", "dueDate"]
        }
      },
      {
        name: "telescope_action_step",
        description: "⚠️ DEPRECATED: Use 'manage_action_step' instead for unified interface. Break down an action step into a detailed structural tension chart. CRITICAL: Current reality must be an honest assessment of actual current state relative to this specific action step, NOT readiness or preparation statements. This maintains structural tension essential for creative advancement.",
        inputSchema: {
          type: "object",
          properties: {
            actionStepName: { type: "string", description: "Name of the action step to telescope" },
            newCurrentReality: {
              type: "string",
              description: "REQUIRED: Honest assessment of actual current state relative to this action step. Examples: 'Never used Django before', 'Completed models section, struggling with views'. AVOID: 'Ready to begin', 'Prepared to start'."
            },
            initialActionSteps: {
              type: "array",
              items: { type: "string" },
              description: "Optional list of initial action steps for the telescoped chart"
            }
          },
          required: ["actionStepName", "newCurrentReality"]
        }
      },
      {
        name: "mark_action_complete",
        description: "Mark an action step as completed and update current reality",
        inputSchema: {
          type: "object",
          properties: {
            actionStepName: { type: "string", description: "Name of the completed action step" }
          },
          required: ["actionStepName"]
        }
      },
      {
        name: "get_chart_progress",
        description: "Get detailed progress for a specific chart (redundant if you just used list_active_charts which shows progress). Only use if you need the nextAction details.",
        inputSchema: {
          type: "object",
          properties: {
            chartId: { type: "string", description: "ID of the chart to check progress for" }
          },
          required: ["chartId"]
        }
      },
      {
        name: "list_active_charts",
        description: "List all active structural tension charts with their progress. Use this FIRST to see all charts and their IDs. This shows chart overview with progress - you don't need other tools after this for basic chart information.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "get_chart",
        description: "Get the full details of a specific structural tension chart, including its desired outcome, current reality, and all associated action steps.",
        inputSchema: {
          type: "object",
          properties: {
            chartId: { type: "string", description: "ID of the chart to retrieve." }
          },
          required: ["chartId"]
        }
      },
      {
        name: "get_action_step",
        description: "Get the full details of a specific action step, which is itself a telescoped chart.",
        inputSchema: {
          type: "object",
          properties: {
            actionStepName: { type: "string", description: "Name of the action step (e.g., 'chart_123_desired_outcome') to retrieve." }
          },
          required: ["actionStepName"]
        }
      },
      {
        name: "update_action_progress",
        description: "Update progress on an action step without marking it complete, optionally updating current reality",
        inputSchema: {
          type: "object",
          properties: {
            actionStepName: { type: "string", description: "Name of the action step to update progress for" },
            progressObservation: { type: "string", description: "Description of progress made on this action step" },
            updateCurrentReality: { 
              type: "boolean", 
              description: "Whether to also add this progress to current reality (optional, defaults to false)"
            }
          },
          required: ["actionStepName", "progressObservation"]
        }
      },
      {
        name: "update_current_reality", 
        description: "FOR STRUCTURAL TENSION CHARTS: Add observations to current reality. DO NOT use add_observations or create_entities for chart work - use this instead.",
        inputSchema: {
          type: "object",
          properties: {
            chartId: { type: "string", description: "ID of the chart to update current reality for" },
            newObservations: {
              type: "array",
              items: { type: "string" },
              description: "Array of new observations to add to current reality"
            }
          },
          required: ["chartId", "newObservations"]
        }
      },
      {
        name: "manage_action_step",
        description: "✨ RECOMMENDED: Unified interface for managing action steps - handles both creation and expansion. Automatically detects whether you're creating a new action step (chart ID) or expanding an existing one (entity name). Provides clear error messages when parameters are invalid.",
        inputSchema: {
          type: "object",
          properties: {
            parentReference: {
              type: "string",
              description: "Chart ID (e.g., 'chart_123') to create new action step, OR action step entity name (e.g., 'chart_123_action_1' or 'chart_123_desired_outcome') to expand existing action step"
            },
            actionDescription: {
              type: "string",
              description: "Title/description of the action step"
            },
            currentReality: {
              type: "string",
              description: "REQUIRED for new action creation. Honest assessment of actual current state relative to this action step. Examples: 'Never used Django', 'Completed models, struggling with views'. AVOID: 'Ready to begin'. Optional when expanding existing actions."
            },
            initialActionSteps: {
              type: "array",
              items: { type: "string" },
              description: "Optional list of sub-actions for the action step"
            },
            dueDate: {
              type: "string",
              description: "Optional due date (ISO string). Auto-distributed if not provided."
            },
            performanceElements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string", description: "What is being evaluated for this action step" },
                  type: { type: "string", enum: ["DESIGN", "EXECUTION"], description: "DESIGN or EXECUTION element" }
                },
                required: ["description", "type"]
              },
              description: "Optional per-step Elements of Performance for MMOT evaluation"
            }
          },
          required: ["parentReference", "actionDescription"]
        }
      },
      {
        name: "add_action_step",
        description: "⚠️ DEPRECATED: Use 'manage_action_step' instead for unified interface. Add a strategic action step to an existing structural tension chart (creates telescoped chart). WARNING: Requires honest current reality assessment - avoid 'ready to begin' language. Action steps become full structural tension charts.",
        inputSchema: {
          type: "object",
          properties: {
            parentChartId: { type: "string", description: "ID of the parent chart to add the action step to" },
            actionStepTitle: { type: "string", description: "Title of the action step (becomes desired outcome of telescoped chart)" },
            dueDate: {
              type: "string",
              description: "Optional due date for the action step (ISO string). If not provided, auto-distributed between now and parent due date"
            },
            currentReality: {
              type: "string",
              description: "Current reality specific to this action step. Required to maintain structural tension - assess the actual current state relative to this action step, not readiness to begin."
            }
          },
          required: ["parentChartId", "actionStepTitle", "currentReality"]
        }
      },
      {
        name: "remove_action_step", 
        description: "Remove an action step from a structural tension chart (deletes telescoped chart)",
        inputSchema: {
          type: "object",
          properties: {
            parentChartId: { type: "string", description: "ID of the parent chart containing the action step" },
            actionStepName: { type: "string", description: "Name of the action step to remove (telescoped chart's desired outcome name)" }
          },
          required: ["parentChartId", "actionStepName"]
        }
      },
      {
        name: "update_desired_outcome",
        description: "Update a chart's desired outcome (goal). Works for BOTH master charts AND action steps (which are telescoped charts). Provide the chart ID of the chart you want to update - whether it's a master chart or an action step chart.",
        inputSchema: {
          type: "object",
          properties: {
            chartId: { type: "string", description: "ID of the chart to update (works for master charts like 'chart_123' or action step charts like 'chart_456')" },
            newDesiredOutcome: { type: "string", description: "New desired outcome text" }
          },
          required: ["chartId", "newDesiredOutcome"]
        }
      },
      {
        name: "perform_mmot_evaluation",
        description: "Autonomous MMOT (Managerial Moment of Truth) self-evaluation on a structural tension chart. The agent compares produced output against defined Elements of Performance, acknowledges discrepancy, analyzes dynamics, updates the chart, and recommits or redirects. Runs the four Creator's Moment of Truth steps: acknowledge → analyze → update → recommit. Can be called from any directional perspective (South/East/West/North) for collective inquiry.",
        inputSchema: {
          type: "object",
          properties: {
            chartId: { type: "string", description: "ID of the chart to evaluate" },
            phase: {
              type: "string",
              enum: ["full", "acknowledge", "analyze", "update", "recommit"],
              default: "full",
              description: "Which MMOT phase: 'full' runs all four steps, or run individual phases"
            },
            assessment: {
              type: "string",
              description: "The agent's honest assessment — what was expected vs. what was delivered, observations, corrective insights"
            },
            direction: {
              type: "string",
              enum: ["South", "East", "West", "North"],
              description: "Optional directional perspective: South=DESIGN/structure (Mia), East=EXECUTION/narrative (Miette), West=EXECUTION/embodied (Heyva), North=DESIGN/wisdom (Echo Weaver)"
            },
            correctiveActions: {
              type: "array",
              items: { type: "string" },
              description: "Optional corrective action steps to add to the chart based on evaluation"
            },
            updateReality: {
              type: "boolean",
              default: true,
              description: "Whether to write evaluation observations into current reality"
            }
          },
          required: ["chartId"]
        }
      },
      {
        name: "init_llm_guidance",
        description: "🚨 NEW LLM? Essential guidance for understanding COAIA Memory's structural tension methodology, delayed resolution principle, and proper tool usage. Run this FIRST to avoid common mistakes.",
        inputSchema: {
          type: "object",
          properties: {
            format: {
              type: "string",
              enum: ["full", "quick", "save_directive"],
              default: "full",
              description: "Level of detail: 'full' for complete guidance, 'quick' for essentials only, 'save_directive' for session memory instructions"
            }
          }
        }
      },
      {
        name: "create_narrative_beat",
        description: "Create a new narrative beat with multi-universe perspective and optional IAIP integration. Documents story progression across three archetypal universes (engineer-world, ceremony-world, story-engine-world).",
        inputSchema: {
          type: "object",
          properties: {
            parentChartId: { type: "string", description: "ID of the parent structural tension chart" },
            title: { type: "string", description: "Title of the narrative beat" },
            act: { type: "number", description: "Act number in the narrative sequence" },
            type_dramatic: { type: "string", description: "Dramatic type (e.g. 'Crisis/Antagonist Force', 'Setup', 'Turning Point')" },
            universes: { 
              type: "array", 
              items: { type: "string" },
              description: "Universe perspectives (engineer-world, ceremony-world, story-engine-world)" 
            },
            description: { type: "string", description: "Detailed description of the narrative beat" },
            prose: { type: "string", description: "Prose narrative of the beat" },
            lessons: { 
              type: "array", 
              items: { type: "string" },
              description: "Key lessons or insights from this beat" 
            },
            assessRelationalAlignment: { type: "boolean", description: "Whether to call iaip-mcp assess_relational_alignment" },
            initiateFourDirectionsInquiry: { type: "boolean", description: "Whether to call iaip-mcp get_direction_guidance" },
            filePath: { type: "string", description: "Path to narrative JSONL file (optional)" }
          },
          required: ["parentChartId", "title", "act", "type_dramatic", "universes", "description", "prose", "lessons"]
        }
      },
      {
        name: "telescope_narrative_beat",
        description: "Telescope a narrative beat into sub-beats for detailed exploration. Creates detailed sub-narrative structure from a parent beat.",
        inputSchema: {
          type: "object",
          properties: {
            parentBeatName: { type: "string", description: "Name of the parent narrative beat to telescope" },
            newCurrentReality: { type: "string", description: "Updated current reality for the telescoped beat" },
            initialSubBeats: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  type_dramatic: { type: "string" },
                  description: { type: "string" },
                  prose: { type: "string" },
                  lessons: { type: "array", items: { type: "string" } }
                },
                required: ["title", "type_dramatic", "description", "prose", "lessons"]
              },
              description: "Optional initial sub-beats to create"
            }
          },
          required: ["parentBeatName", "newCurrentReality"]
        }
      },
      {
        name: "list_narrative_beats",
        description: "List all narrative beats, optionally filtered by parent chart ID. Shows multi-universe story progression.",
        inputSchema: {
          type: "object",
          properties: {
            parentChartId: { type: "string", description: "Optional: Filter by parent chart ID" }
          }
        }
      }
    ];

  // Filter tools based on enabled tools set
  const filteredTools = allTools.filter(tool => enabledTools.has(tool.name));

  return {
    tools: filteredTools,
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    // Strict validation: name must exist
    if (!name || typeof name !== 'string') {
      return {
        content: [{ type: "text", text: `Error: Invalid tool name: ${name}` }],
        isError: true
      };
    }

    // Strict validation: args must be object or undefined
    if (args !== undefined && (typeof args !== 'object' || args === null || Array.isArray(args))) {
      return {
        content: [{ type: "text", text: `Error: Tool arguments must be an object, received: ${typeof args}` }],
        isError: true
      };
    }

    const toolArgs = args || {};

    switch (name) {
      case "create_entities": {
        const valResult = validate(toolArgs, { entities: ValidationSchemas.entityArray() });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };
        const result = await knowledgeGraphManager.createEntities(toolArgs.entities as Entity[]);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      case "create_relations": {
        const valResult = validate(toolArgs, { relations: ValidationSchemas.relationArray() });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };
        const result = await knowledgeGraphManager.createRelations(toolArgs.relations as Relation[]);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      case "add_observations": {
        const valResult = validate(toolArgs, {
          observations: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              properties: {
                entityName: { type: 'string', required: true },
                contents: { type: 'array', required: true, items: { type: 'string' } }
              }
            }
          }
        });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };
        const result = await knowledgeGraphManager.addObservations(toolArgs.observations as { entityName: string; contents: string[] }[]);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      case "delete_entities": {
        const valResult = validate(toolArgs, { entityNames: ValidationSchemas.stringArray() });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };
        await knowledgeGraphManager.deleteEntities(toolArgs.entityNames as string[]);
        return { content: [{ type: "text", text: "Entities deleted successfully" }] };
      }
      case "delete_observations": {
        const valResult = validate(toolArgs, {
          deletions: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              properties: {
                entityName: { type: 'string', required: true },
                observations: { type: 'array', required: true, items: { type: 'string' } }
              }
            }
          }
        });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };
        await knowledgeGraphManager.deleteObservations(toolArgs.deletions as { entityName: string; observations: string[] }[]);
        return { content: [{ type: "text", text: "Observations deleted successfully" }] };
      }
      case "delete_relations": {
        const valResult = validate(toolArgs, { relations: ValidationSchemas.relationArray() });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };
        await knowledgeGraphManager.deleteRelations(toolArgs.relations as Relation[]);
        return { content: [{ type: "text", text: "Relations deleted successfully" }] };
      }
      case "read_graph": {
        const result = await knowledgeGraphManager.readGraph();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      case "search_nodes": {
        const valResult = validate(toolArgs, { query: ValidationSchemas.nonEmptyString() });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };
        const result = await knowledgeGraphManager.searchNodes(toolArgs.query as string);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      case "open_nodes": {
        const valResult = validate(toolArgs, { names: { type: 'array', required: true, minLength: 1, items: { type: 'string' } } });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };
        const result = await knowledgeGraphManager.openNodes(toolArgs.names as string[]);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      case "create_structural_tension_chart": {
        const valResult = validate(toolArgs, {
          desiredOutcome: ValidationSchemas.nonEmptyString(),
          currentReality: ValidationSchemas.nonEmptyString(),
          dueDate: ValidationSchemas.isoDate(),
          actionSteps: { type: 'array', items: { type: 'string' } }
        });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };
        const chartResult = await knowledgeGraphManager.createStructuralTensionChart(
          toolArgs.desiredOutcome as string,
          toolArgs.currentReality as string,
          toolArgs.dueDate as string,
          (Array.isArray(toolArgs.actionSteps) ? toolArgs.actionSteps : []) as string[],
          toolArgs.elementsOfPerformance as Array<{ description: string; type: 'DESIGN' | 'EXECUTION' }> | undefined
        );
        return { content: [{ type: "text", text: JSON.stringify(chartResult, null, 2) }] };
      }
      case "telescope_action_step": {
        const valResult = validate(toolArgs, {
          actionStepName: ValidationSchemas.nonEmptyString(),
          newCurrentReality: ValidationSchemas.nonEmptyString(),
          initialActionSteps: { type: 'array', items: { type: 'string' } }
        });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };
        const telescopeResult = await knowledgeGraphManager.telescopeActionStep(
          toolArgs.actionStepName as string,
          toolArgs.newCurrentReality as string,
          (Array.isArray(toolArgs.initialActionSteps) ? toolArgs.initialActionSteps : []) as string[]
        );
        return { content: [{ type: "text", text: JSON.stringify(telescopeResult, null, 2) }] };
      }
      case "mark_action_complete": {
        const valResult = validate(toolArgs, { actionStepName: ValidationSchemas.nonEmptyString() });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };
        await knowledgeGraphManager.markActionStepComplete(toolArgs.actionStepName as string);
        return { content: [{ type: "text", text: `Action step '${toolArgs.actionStepName as string}' marked as complete and current reality updated` }] };
      }
      case "get_chart_progress": {
        const valResult = validate(toolArgs, { chartId: ValidationSchemas.nonEmptyString() });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };
        const progressResult = await knowledgeGraphManager.getChartProgress(toolArgs.chartId as string);
        return { content: [{ type: "text", text: JSON.stringify(progressResult, null, 2) }] };
      }
      case "list_active_charts": {
        const chartsResult = await knowledgeGraphManager.listActiveCharts();
        let hierarchyText = "## Structural Tension Charts Hierarchy\n\n";
        const masterCharts = chartsResult.filter(c => c.level === 0);
        const actionCharts = chartsResult.filter(c => c.level > 0);
        
        masterCharts.forEach(master => {
          const progress = master.progress > 0 ? ` (${Math.round(master.progress * 100)}% complete)` : "";
          const dueDate = master.dueDate ? ` [Due: ${new Date(master.dueDate).toLocaleDateString()}]` : "";
          hierarchyText += `📋 **${master.desiredOutcome}** (Master Chart)${progress}${dueDate}\n`;
          hierarchyText += `    ID: ${master.chartId}\n`;
          
          const actions = actionCharts.filter(a => a.parentChart === master.chartId);
          if (actions.length > 0) {
            actions.forEach((action, index) => {
              const isLast = index === actions.length - 1;
              const connector = isLast ? "└── " : "├── ";
              const actionProgress = action.progress > 0 ? ` (${Math.round(action.progress * 100)}%)` : "";
              const actionDue = action.dueDate ? ` [${new Date(action.dueDate).toLocaleDateString()}]` : "";
              hierarchyText += `    ${connector}🎯 ${action.desiredOutcome} (Action Step)${actionProgress}${actionDue}\n`;
              hierarchyText += `        ID: ${action.chartId}\n`;
            });
          } else {
            hierarchyText += `    └── (No action steps yet)\n`;
          }
          hierarchyText += "\n";
        });
        
        if (masterCharts.length === 0) {
          hierarchyText += "No active structural tension charts found.\n\n";
          hierarchyText += "💡 Create your first chart with: create_structural_tension_chart\n";
        }
        
        return { content: [{ type: "text", text: hierarchyText }] };
      }
      case "get_chart": {
        const valResult = validate(toolArgs, { chartId: ValidationSchemas.nonEmptyString() });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };
        const result = await knowledgeGraphManager.getChartDetails(toolArgs.chartId as string);
        if (!result) return { content: [{ type: "text", text: `Error: Chart with ID ${toolArgs.chartId} not found` }], isError: true };
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      case "get_action_step": {
        const valResult = validate(toolArgs, { actionStepName: ValidationSchemas.nonEmptyString() });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };
        const result = await knowledgeGraphManager.getActionStepDetails(toolArgs.actionStepName as string);
        if (!result) return { content: [{ type: "text", text: `Error: Action step with name ${toolArgs.actionStepName} not found` }], isError: true };
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      case "update_action_progress": {
        const valResult = validate(toolArgs, {
          actionStepName: ValidationSchemas.nonEmptyString(),
          progressObservation: ValidationSchemas.nonEmptyString(),
          updateCurrentReality: { type: 'boolean' }
        });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };
        await knowledgeGraphManager.updateActionProgress(
          toolArgs.actionStepName as string,
          toolArgs.progressObservation as string,
          toolArgs.updateCurrentReality === true
        );
        return { content: [{ type: "text", text: `Action step '${toolArgs.actionStepName as string}' progress updated` }] };
      }
      case "update_current_reality": {
        const valResult = validate(toolArgs, {
          chartId: ValidationSchemas.nonEmptyString(),
          newObservations: { type: 'array', required: true, minLength: 1, items: { type: 'string' } }
        });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };
        await knowledgeGraphManager.updateCurrentReality(toolArgs.chartId as string, toolArgs.newObservations as string[]);
        return { content: [{ type: "text", text: `Current reality updated for chart '${toolArgs.chartId as string}'` }] };
      }
      case "manage_action_step": {
        const valResult = validate(toolArgs, {
          parentReference: ValidationSchemas.nonEmptyString(),
          actionDescription: ValidationSchemas.nonEmptyString(),
          currentReality: { type: 'string' },
          initialActionSteps: { type: 'array', items: { type: 'string' } },
          dueDate: { type: 'date' }
        });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };
        const manageActionResult = await knowledgeGraphManager.manageActionStep(
          toolArgs.parentReference as string,
          toolArgs.actionDescription as string,
          toolArgs.currentReality as string | undefined,
          toolArgs.initialActionSteps as string[] | undefined,
          toolArgs.dueDate as string | undefined,
          toolArgs.performanceElements as Array<{ description: string; type: 'DESIGN' | 'EXECUTION' }> | undefined
        );
        return { content: [{ type: "text", text: `Action step '${toolArgs.actionDescription as string}' managed for parent '${toolArgs.parentReference as string}'. Result: ${JSON.stringify(manageActionResult, null, 2)}` }] };
      }
      case "add_action_step": {
        const valResult = validate(toolArgs, {
          parentChartId: ValidationSchemas.nonEmptyString(),
          actionStepTitle: ValidationSchemas.nonEmptyString(),
          currentReality: ValidationSchemas.nonEmptyString(),
          dueDate: { type: 'date' }
        });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };
        const addActionResult = await knowledgeGraphManager.addActionStep(
          toolArgs.parentChartId as string,
          toolArgs.actionStepTitle as string,
          toolArgs.dueDate as string | undefined,
          toolArgs.currentReality as string
        );
        return { content: [{ type: "text", text: `Action step '${toolArgs.actionStepTitle as string}' added to chart '${toolArgs.parentChartId as string}' as telescoped chart '${addActionResult.chartId}'` }] };
      }
      case "remove_action_step": {
        const valResult = validate(toolArgs, {
          parentChartId: ValidationSchemas.nonEmptyString(),
          actionStepName: ValidationSchemas.nonEmptyString()
        });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };
        await knowledgeGraphManager.removeActionStep(toolArgs.parentChartId as string, toolArgs.actionStepName as string);
        return { content: [{ type: "text", text: `Action step '${toolArgs.actionStepName as string}' removed from chart '${toolArgs.parentChartId as string}'` }] };
      }
      case "update_desired_outcome": {
        const valResult = validate(toolArgs, {
          chartId: ValidationSchemas.nonEmptyString(),
          newDesiredOutcome: ValidationSchemas.nonEmptyString()
        });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };
        await knowledgeGraphManager.updateDesiredOutcome(toolArgs.chartId as string, toolArgs.newDesiredOutcome as string);
        return { content: [{ type: "text", text: `Desired outcome updated for chart '${toolArgs.chartId as string}'` }] };
      }
      case "perform_mmot_evaluation": {
        const valResult = validate(toolArgs, {
          chartId: ValidationSchemas.nonEmptyString(),
          phase: { type: 'enum', enumValues: ['full', 'acknowledge', 'analyze', 'update', 'recommit'] },
          assessment: { type: 'string' },
          direction: { type: 'enum', enumValues: ['South', 'East', 'West', 'North'] },
          correctiveActions: { type: 'array', items: { type: 'string' } },
          updateReality: { type: 'boolean' }
        });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };
        const mmotResult = await knowledgeGraphManager.performMmotEvaluation(
          toolArgs.chartId as string,
          (toolArgs.phase as string) || 'full',
          toolArgs.assessment as string | undefined,
          toolArgs.direction as 'South' | 'East' | 'West' | 'North' | undefined,
          toolArgs.correctiveActions as string[] | undefined,
          toolArgs.updateReality !== false
        );
        let responseText = mmotResult.guidance;
        if (mmotResult.evaluationStored) {
          responseText += '\n\n✅ Evaluation stored in chart current reality.';
        }
        if (mmotResult.beatEmitted) {
          responseText += '\n📡 MMOT narrative beat emitted.';
        }
        return { content: [{ type: "text", text: responseText }] };
      }
      case "create_narrative_beat": {
        const valResult = validate(toolArgs, {
          parentChartId: ValidationSchemas.nonEmptyString(),
          title: ValidationSchemas.nonEmptyString(),
          act: { type: 'number', required: true, minValue: 1 },
          type_dramatic: ValidationSchemas.nonEmptyString(),
          universes: { type: 'array', required: true, minLength: 1, items: { type: 'string' } },
          description: ValidationSchemas.nonEmptyString(),
          prose: ValidationSchemas.nonEmptyString(),
          lessons: { type: 'array', required: true, items: { type: 'string' } },
          assessRelationalAlignment: { type: 'boolean' },
          initiateFourDirectionsInquiry: { type: 'boolean' },
          filePath: { type: 'string' }
        });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };

        const beatResult = await knowledgeGraphManager.createNarrativeBeat(
          toolArgs.parentChartId as string,
          toolArgs.title as string,
          toolArgs.act as number,
          toolArgs.type_dramatic as string,
          toolArgs.universes as string[],
          toolArgs.description as string,
          toolArgs.prose as string,
          toolArgs.lessons as string[],
          (toolArgs.assessRelationalAlignment as boolean) || false,
          (toolArgs.initiateFourDirectionsInquiry as boolean) || false,
          toolArgs.filePath as string | undefined
        );
        return { content: [{ type: "text", text: JSON.stringify(beatResult, null, 2) }] };
      }
      case "telescope_narrative_beat": {
        const valResult = validate(toolArgs, {
          parentBeatName: ValidationSchemas.nonEmptyString(),
          newCurrentReality: ValidationSchemas.nonEmptyString(),
          initialSubBeats: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string', required: true },
                type_dramatic: { type: 'string', required: true },
                description: { type: 'string', required: true },
                prose: { type: 'string', required: true },
                lessons: { type: 'array', required: true, items: { type: 'string' } }
              }
            }
          }
        });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };

        const telescopeResult = await knowledgeGraphManager.telescopeNarrativeBeat(
          toolArgs.parentBeatName as string,
          toolArgs.newCurrentReality as string,
          (Array.isArray(toolArgs.initialSubBeats) ? toolArgs.initialSubBeats : []) as Array<any>
        );
        return { content: [{ type: "text", text: JSON.stringify(telescopeResult, null, 2) }] };
      }
      case "list_narrative_beats": {
        const valResult = validate(toolArgs, {
          parentChartId: { type: 'string' }
        });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };
        const parentChartId = toolArgs.parentChartId as string | undefined;
        const beatsResult = await knowledgeGraphManager.listNarrativeBeats(parentChartId);

        if (beatsResult.length === 0) {
          return { content: [{ type: "text", text: "No narrative beats found." }] };
        }

        let beatsText = "## 📖 Narrative Beats\n\n";
        beatsResult.forEach((beat) => {
          const act = beat.metadata?.act || '?';
          const type = beat.metadata?.type_dramatic || 'Unknown';
          const universes = beat.metadata?.universes?.join(', ') || 'Unknown';
          const lessons = beat.metadata?.narrative?.lessons || [];

          beatsText += `### Act ${act}: ${type}\n`;
          beatsText += `**Name**: ${beat.name}\n`;
          beatsText += `**Universes**: ${universes}\n`;
          beatsText += `**Description**: ${beat.metadata?.narrative?.description || 'N/A'}\n`;
          if (lessons.length > 0) {
            beatsText += `**Lessons**: ${lessons.join(', ')}\n`;
          }
          beatsText += "\n";
        });

        return { content: [{ type: "text", text: beatsText }] };
      }
      case "init_llm_guidance": {
        const valResult = validate(toolArgs, {
          format: { type: 'enum', enumValues: ['full', 'quick', 'save_directive'] }
        });
        if (!valResult.valid) return { content: [{ type: "text", text: `Error: ${valResult.error}` }], isError: true };
        const format = toolArgs.format as string || "full";

        if (format === "save_directive") {
          return { content: [{ type: "text", text: `## 💡 RECOMMENDED: Save This Guidance\n\n**Claude Code**: Add this guidance to CLAUDE.md in your project directory\n**Gemini**: Save as GEMINI.md in your workspace  \n**Other Agents**: Create AGENTS.md or similar session memory file\n\nThis ensures you remember COAIA Memory's structural tension principles across our entire conversation.\n\n**Quick Command**: Use format="full" to get the complete guidance content to save.` }] };
        }

        if (format === "quick") {
          return { content: [{ type: "text", text: `## 🚨 COAIA Memory Quick Reference\n\n**CRITICAL**: "Ready to begin" = WRONG. Current reality must be factual assessment.\n\n**Core Tools**:\n1. \`list_active_charts\` → Start here, see all charts\n2. \`create_structural_tension_chart\` → New chart (outcome + reality + actions)\n3. \`add_action_step\` → Add strategic actions (creates telescoped chart)\n4. \`telescope_action_step\` → Break down actions into detailed sub-charts\n\n**Common Mistakes**:\n❌ "Ready to begin Django tutorial" \n✅ "Never used Django, completed Python basics"\n\nUse format="full" for complete guidance.` }] };
        }

        // Default: full guidance
        return { content: [{ type: "text", text: LLM_GUIDANCE }] };
      }
      default: {
        return {
          content: [{ type: "text", text: `Error: Unknown tool: ${name}` }],
          isError: true
        };
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error executing tool: ${errorMessage}` }],
      isError: true
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("COAIA Narrative - Creative Oriented AI Assistant Memory Server - Narrative Beat Extension running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
