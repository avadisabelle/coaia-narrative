import { Entity, Relation, KnowledgeGraph, WampumBead, WampumBeltMetadata, WampumBeadPosition, WampumCeremonyLink, GithubIssueRef } from './types.js';
import { readJsonlMemoryFile, writeJsonlMemoryFile } from './jsonl-preservation.js';
import {
  createGithubProjectFieldProjection,
  type GithubProjectFieldProjection,
} from './github-bridge.js';

/**
 * Parse a GitHub issue reference written as `owner/repo#number`.
 *
 * The full path is required. A bare `#42` is rejected: charts travel between
 * repositories, and a bare number silently resolves against whichever repo the
 * reader happens to be in — which is how an issue from one project ends up
 * cited as another project's.
 */
export function parseGithubIssueSpec(spec: string): GithubIssueRef {
  const match = /^([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+)#(\d+)$/.exec(spec.trim());
  if (!match) {
    throw new Error(
      `Invalid GitHub issue reference: "${spec}". Use the full path 'owner/repo#number' (e.g. avadisabelle/coaia-narrative#50). A bare '#number' is not accepted — it resolves against the wrong repository as soon as the chart is read somewhere else.`
    );
  }
  const [, owner, repo, number] = match;
  return {
    owner,
    repo,
    number: Number(number),
    url: `https://github.com/${owner}/${repo}/issues/${number}`
  };
}

export class KnowledgeGraphManager {
  private memoryFilePath: string;

  constructor(memoryFilePath: string) {
    this.memoryFilePath = memoryFilePath;
  }

  private async loadGraph(): Promise<KnowledgeGraph> {
    return readJsonlMemoryFile(this.memoryFilePath);
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
    await writeJsonlMemoryFile(this.memoryFilePath, graph);
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

  async getGithubProjectFieldProjection(entityNameOrChartId: string): Promise<GithubProjectFieldProjection | null> {
    const graph = await this.loadGraph();
    const entity = graph.entities.find(e => e.name === entityNameOrChartId)
      ?? graph.entities.find(e =>
        e.entityType === 'structural_tension_chart' &&
        e.metadata?.chartId === entityNameOrChartId
      );

    if (!entity) {
      return null;
    }

    return createGithubProjectFieldProjection(entity, graph);
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
    elementsOfPerformance?: Array<{ description: string; type: 'DESIGN' | 'EXECUTION' }>,
    githubIssue?: string
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
    const issueRef = githubIssue ? parseGithubIssueSpec(githubIssue) : undefined;

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
          ...(elementsOfPerformance && elementsOfPerformance.length > 0 ? { elementsOfPerformance } : {}),
          ...(issueRef ? { github: { issue: issueRef } } : {})
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

  async getChartProgress(chartId: string, preloadedGraph?: KnowledgeGraph): Promise<{
    chartId: string;
    progress: number;
    completedActions: number;
    totalActions: number;
    nextAction?: string;
    dueDate?: string;
  }> {
    const graph = preloadedGraph ?? await this.loadGraph();
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
        const progress = await this.getChartProgress(chartId, graph);
        
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

  /**
   * Record on an existing chart the GitHub issue it was written from.
   * Writes metadata.github.issue, which EntityMetadata already carried and no
   * tool could reach.
   */
  async linkChartToGithubIssue(
    chartId: string,
    githubIssue: string
  ): Promise<{ chartId: string; issue: GithubIssueRef }> {
    const graph = await this.loadGraph();
    const chartEntity = graph.entities.find(
      e => e.name === `${chartId}_chart` && e.entityType === 'structural_tension_chart'
    );

    if (!chartEntity) {
      throw new Error(`Chart ${chartId} not found`);
    }

    const issue = parseGithubIssueSpec(githubIssue);
    const timestamp = new Date().toISOString();

    chartEntity.metadata = chartEntity.metadata || {};
    chartEntity.metadata.github = { ...(chartEntity.metadata.github || {}), issue };
    chartEntity.metadata.updatedAt = timestamp;

    await this.saveGraph(graph);
    return { chartId, issue };
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

    // Only emit beat and save when there is something meaningful to persist
    const shouldSave = evaluationStored || (correctiveActions && correctiveActions.length > 0);
    if (shouldSave) {
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
    }

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

  // Wampum Belt sequencing functionality (parallel to linear narrative beats)
  async createWampumBelt(
    title: string,
    purpose: string,
    rows: number = 1,
    cols: number = 1
  ): Promise<{ beltId: string; entity: Entity }> {
    if (!Number.isInteger(rows) || rows <= 0 || !Number.isInteger(cols) || cols <= 0) {
      throw new Error(`rows and cols must be positive integers (received rows=${rows}, cols=${cols})`);
    }
    const beltId = `belt_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const beltMetadata: WampumBeltMetadata = {
      beltId,
      title,
      purpose,
      rows,
      cols,
      beads: [],
      createdAt: timestamp,
      updatedAt: timestamp
    };

    const entity: Entity = {
      name: `${beltId}_belt`,
      entityType: 'wampum_belt',
      observations: [`Wampum Belt created: ${title}`, `Purpose: ${purpose}`],
      metadata: {
        beltId,
        createdAt: timestamp,
        updatedAt: timestamp,
        wampumBelt: beltMetadata
      }
    };

    await this.createEntities([entity]);
    return { beltId, entity };
  }

  async addWampumBead(
    beltId: string,
    mnemonic: string,
    color: WampumBead['color'],
    position: WampumBeadPosition,
    reading: string,
    relationalReadings?: Record<string, string>,
    ceremonyLink?: WampumCeremonyLink,
    observations: string[] = []
  ): Promise<{ bead: WampumBead }> {
    const graph = await this.loadGraph();
    const beltEntity = graph.entities.find(
      e => e.entityType === 'wampum_belt' && e.metadata?.beltId === beltId
    );
    if (!beltEntity?.metadata?.wampumBelt) {
      throw new Error(`Wampum Belt not found: ${beltId}`);
    }

    const beltMeta = beltEntity.metadata.wampumBelt as WampumBeltMetadata;
    if (
      !Number.isInteger(position.row) ||
      !Number.isInteger(position.col) ||
      position.row < 0 ||
      position.col < 0 ||
      position.row >= beltMeta.rows ||
      position.col >= beltMeta.cols
    ) {
      throw new Error(`Position (${position.row},${position.col}) out of bounds for belt ${beltId} (${beltMeta.rows}x${beltMeta.cols})`);
    }

    const conflict = beltMeta.beads.find(
      b => b.position.row === position.row && b.position.col === position.col
    );
    if (conflict) {
      throw new Error(`Position (${position.row},${position.col}) already occupied by bead "${conflict.mnemonic}"`);
    }

    const timestamp = new Date().toISOString();
    const bead: WampumBead = {
      id: `bead_${beltId}_${position.row}_${position.col}`,
      mnemonic,
      color,
      position,
      reading,
      ...(relationalReadings ? { relationalReadings } : {}),
      ...(ceremonyLink ? { ceremonyLink } : {}),
      observations,
      createdAt: timestamp
    };

    beltMeta.beads.push(bead);
    beltMeta.updatedAt = timestamp;
    beltEntity.metadata.updatedAt = timestamp;

    // Ceremony edges are subject to the BEAD, not the belt.
    //
    // A relation's identity in the store is (from, to, relationType) —
    // jsonl-preservation.ts:57-59. With the belt as subject, a second bead
    // linking the same chart under a different ceremonyType collided on that
    // triple: the existence check below matched, the push was skipped, and the
    // bead kept a ceremonyType the graph had no edge for. Silent discard — the
    // bead's own record disagreed with the graph, and nothing said so.
    //
    // bead.id is `bead_${beltId}_${row}_${col}` and a position can be written
    // only once, so (bead, target, relationType) is unique by construction and
    // every ceremony link survives with its own ceremonyType.
    if (ceremonyLink?.chartId) {
      const from = bead.id;
      const to = `${ceremonyLink.chartId}_chart`;
      const exists = graph.relations.some(r => r.from === from && r.to === to && r.relationType === 'wampum_holds_accountable');
      if (!exists) {
        graph.relations.push({
          from,
          to,
          relationType: 'wampum_holds_accountable',
          metadata: { createdAt: timestamp, context: ceremonyLink.ceremonyType, beltId }
        });
      }
    }
    if (ceremonyLink?.beatName) {
      const from = bead.id;
      const to = ceremonyLink.beatName;
      const exists = graph.relations.some(r => r.from === from && r.to === to && r.relationType === 'wampum_witnesses');
      if (!exists) {
        graph.relations.push({
          from,
          to,
          relationType: 'wampum_witnesses',
          metadata: { createdAt: timestamp, beltId }
        });
      }
    }

    await this.saveGraph(graph);
    return { bead };
  }

  async readWampumBelt(
    beltId: string,
    position?: WampumBeadPosition
  ): Promise<{ belt: WampumBeltMetadata; bead?: WampumBead; positionalReading?: string }> {
    const graph = await this.loadGraph();
    const beltEntity = graph.entities.find(
      e => e.entityType === 'wampum_belt' && e.metadata?.beltId === beltId
    );
    if (!beltEntity?.metadata?.wampumBelt) {
      throw new Error(`Wampum Belt not found: ${beltId}`);
    }

    const belt = beltEntity.metadata.wampumBelt as WampumBeltMetadata;
    if (!position) {
      return { belt };
    }
    if (
      !Number.isInteger(position.row) ||
      !Number.isInteger(position.col) ||
      position.row < 0 ||
      position.col < 0 ||
      position.row >= belt.rows ||
      position.col >= belt.cols
    ) {
      throw new Error(`Position (${position.row},${position.col}) out of bounds for belt ${beltId} (${belt.rows}x${belt.cols})`);
    }

    const bead = belt.beads.find(
      b => b.position.row === position.row && b.position.col === position.col
    );
    if (!bead) {
      return { belt };
    }

    const colLabel = position.col === 0
      ? 'left'
      : position.col === belt.cols - 1
        ? 'right'
        : 'center';
    const positionalReading =
      bead.relationalReadings?.[`col:${position.col}`] ??
      bead.relationalReadings?.[`row:${position.row}`] ??
      bead.relationalReadings?.[colLabel] ??
      bead.reading;

    return { belt, bead, positionalReading };
  }

  /**
   * List Wampum Belts as a read-side projection over entities and relations
   * that already exist. Nothing here is stored: heldCharts is derived by
   * walking wampum_holds_accountable relations, because the belt entity holds
   * no chartId and must not gain one — a denormalized field would become a
   * second source of truth that drifts from the edges.
   *
   * heldCharts is an ARRAY. A belt may hold several charts accountable, one
   * relation per ceremony-linked bead; a scalar would tell implementers the
   * wrong cardinality.
   *
   * Entities typed wampum_belt whose metadata.wampumBelt is absent are skipped
   * — there is no belt to report, and readWampumBelt already throws for them.
   */
  async listWampumBelts(options: {
    chartId?: string;
    ceremonyType?: WampumCeremonyLink['ceremonyType'];
    includeBeads?: boolean;
  } = {}): Promise<Array<{
    beltId: string;
    title: string;
    purpose: string;
    rows: number;
    cols: number;
    beadCount: number;
    heldCharts: Array<{ chartId: string; ceremonyType?: string; beadId?: string; present: boolean }>;
    heldBeats: Array<{ beatName: string; beadId?: string; present: boolean }>;
    beads?: WampumBead[];
  }>> {
    const { chartId, ceremonyType, includeBeads = false } = options;
    const graph = await this.loadGraph();

    const entitiesByName = new Map(graph.entities.map(e => [e.name, e]));

    const belts = graph.entities
      .filter(e => e.entityType === 'wampum_belt' && e.metadata?.wampumBelt)
      .map(e => e.metadata!.wampumBelt as WampumBeltMetadata);

    // Ceremony edges are subject to the bead (`bead_${beltId}_${row}_${col}`).
    // Edges written before that fix are subject to `${beltId}_belt`; both are
    // matched, so no migration is needed and nothing written earlier drops out
    // of a listing.
    const beltIdOfEdge = (relation: Relation): string | undefined => {
      const declared = relation.metadata?.beltId;
      if (typeof declared === 'string') return declared;
      const beadMatch = /^bead_(belt_\d+)_\d+_\d+$/.exec(relation.from);
      if (beadMatch) return beadMatch[1];
      if (relation.from.endsWith('_belt')) return relation.from.slice(0, -'_belt'.length);
      return undefined;
    };

    const beadIdOfEdge = (relation: Relation): string | undefined =>
      relation.from.startsWith('bead_') ? relation.from : undefined;

    const projected = belts.map(belt => {
      const chartsSeen = new Set<string>();
      const beatsSeen = new Set<string>();
      const heldCharts: Array<{ chartId: string; ceremonyType?: string; beadId?: string; present: boolean }> = [];
      const heldBeats: Array<{ beatName: string; beadId?: string; present: boolean }> = [];

      for (const relation of graph.relations) {
        if (beltIdOfEdge(relation) !== belt.beltId) continue;

        if (relation.relationType === 'wampum_holds_accountable') {
          // Resolve the target through the entity map rather than trusting its
          // name. A ceremony link to a chart id that does not exist is accepted
          // on write, and inferring the id by stripping `_chart` would present
          // that typo as a real held chart.
          const target = entitiesByName.get(relation.to);
          const resolvedChartId = (target?.metadata?.chartId as string | undefined)
            ?? relation.to.replace(/_chart$/, '');
          const context = relation.metadata?.context as string | undefined;
          const key = `${resolvedChartId}::${context ?? ''}`;
          if (chartsSeen.has(key)) continue;
          chartsSeen.add(key);
          const beadId = beadIdOfEdge(relation);
          heldCharts.push({
            chartId: resolvedChartId,
            ...(context ? { ceremonyType: context } : {}),
            ...(beadId ? { beadId } : {}),
            present: target !== undefined
          });
          continue;
        }

        if (relation.relationType === 'wampum_witnesses') {
          // Witness edges carry no metadata.context. The asymmetry lives in the
          // writer, not here.
          if (beatsSeen.has(relation.to)) continue;
          beatsSeen.add(relation.to);
          const beadId = beadIdOfEdge(relation);
          heldBeats.push({
            beatName: relation.to,
            ...(beadId ? { beadId } : {}),
            present: entitiesByName.has(relation.to)
          });
        }
      }

      return {
        beltId: belt.beltId,
        title: belt.title,
        purpose: belt.purpose,
        rows: belt.rows,
        cols: belt.cols,
        beadCount: belt.beads.length,
        heldCharts,
        heldBeats,
        ...(includeBeads ? { beads: belt.beads } : {}),
        createdAt: belt.createdAt
      };
    });

    const filtered = projected.filter(belt => {
      if (chartId && !belt.heldCharts.some(held => held.chartId === chartId)) return false;
      if (ceremonyType && !belt.heldCharts.some(held => held.ceremonyType === ceremonyType)) return false;
      return true;
    });

    // Deterministic order so a list view does not reshuffle between reads.
    filtered.sort((a, b) =>
      a.createdAt === b.createdAt ? a.beltId.localeCompare(b.beltId) : a.createdAt.localeCompare(b.createdAt)
    );

    return filtered.map(({ createdAt, ...belt }) => belt);
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

    // Load once, apply all mutations, save once — no races
    const updatedGraph = await this.loadGraph();
    const timestamp = new Date().toISOString();

    const telescopedChartEntity = updatedGraph.entities.find(e => e.name === `${telescopedChart.chartId}_chart`);
    if (telescopedChartEntity && telescopedChartEntity.metadata) {
      telescopedChartEntity.metadata.parentChart = parentChartId;
      telescopedChartEntity.metadata.level = (parentChart.metadata?.level || 0) + 1;
      telescopedChartEntity.metadata.updatedAt = timestamp;
    }

    const parentDesiredOutcome = updatedGraph.entities.find(e =>
      e.name === `${parentChartId}_desired_outcome` && e.entityType === 'desired_outcome'
    );
    if (parentDesiredOutcome) {
      updatedGraph.relations.push({
        from: `${telescopedChart.chartId}_desired_outcome`,
        to: parentDesiredOutcome.name,
        relationType: 'advances_toward',
        metadata: { createdAt: timestamp }
      });
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
