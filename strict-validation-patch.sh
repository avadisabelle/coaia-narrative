#!/bin/bash
# Add strict input validation to all tool handlers

# Create a validated handler wrapper
cat > temp-handlers.ts << 'EOF'
// STRICT VALIDATION WRAPPER - All tools validated before execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    // STRICT: Validate request structure
    if (!name || typeof name !== 'string') {
      return {
        content: [{ type: "text", text: `Error: Invalid or missing tool name` }],
        isError: true
      };
    }

    // STRICT: Validate arguments type
    if (args !== undefined && (typeof args !== 'object' || Array.isArray(args))) {
      return {
        content: [{ type: "text", text: `Error: Tool arguments must be an object` }],
        isError: true
      };
    }

    // Safely cast args
    const toolArgs = (args as Record<string, unknown>) || {};

    switch (name) {
      case "create_entities": {
        if (!Array.isArray(toolArgs.entities)) throw new Error("entities must be array");
        return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.createEntities(toolArgs.entities as Entity[]), null, 2) }] };
      }
      case "create_relations": {
        if (!Array.isArray(toolArgs.relations)) throw new Error("relations must be array");
        return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.createRelations(toolArgs.relations as Relation[]), null, 2) }] };
      }
      case "add_observations": {
        if (!Array.isArray(toolArgs.observations)) throw new Error("observations must be array");
        return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.addObservations(toolArgs.observations as { entityName: string; contents: string[] }[]), null, 2) }] };
      }
      case "delete_entities": {
        if (!Array.isArray(toolArgs.entityNames)) throw new Error("entityNames must be array");
        await knowledgeGraphManager.deleteEntities(toolArgs.entityNames as string[]);
        return { content: [{ type: "text", text: "Entities deleted successfully" }] };
      }
      case "delete_observations": {
        if (!Array.isArray(toolArgs.deletions)) throw new Error("deletions must be array");
        await knowledgeGraphManager.deleteObservations(toolArgs.deletions as { entityName: string; observations: string[] }[]);
        return { content: [{ type: "text", text: "Observations deleted successfully" }] };
      }
      case "delete_relations": {
        if (!Array.isArray(toolArgs.relations)) throw new Error("relations must be array");
        await knowledgeGraphManager.deleteRelations(toolArgs.relations as Relation[]);
        return { content: [{ type: "text", text: "Relations deleted successfully" }] };
      }
      case "read_graph": {
        return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.readGraph(), null, 2) }] };
      }
      case "search_nodes": {
        if (typeof toolArgs.query !== 'string') throw new Error("query must be string");
        return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.searchNodes(toolArgs.query), null, 2) }] };
      }
      case "open_nodes": {
        if (!Array.isArray(toolArgs.names)) throw new Error("names must be array");
        return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.openNodes(toolArgs.names as string[]), null, 2) }] };
      }
      case "create_structural_tension_chart": {
        const desiredOutcome = toolArgs.desiredOutcome as string | undefined;
        const currentReality = toolArgs.currentReality as string | undefined;
        const dueDate = toolArgs.dueDate as string | undefined;
        
        if (!desiredOutcome || typeof desiredOutcome !== 'string') throw new Error("desiredOutcome must be string");
        if (!currentReality || typeof currentReality !== 'string') throw new Error("currentReality must be string");
        if (!dueDate || typeof dueDate !== 'string') throw new Error("dueDate must be string");
        
        const chartResult = await knowledgeGraphManager.createStructuralTensionChart(
          desiredOutcome, currentReality, dueDate,
          Array.isArray(toolArgs.actionSteps) ? (toolArgs.actionSteps as string[]) : undefined
        );
        return { content: [{ type: "text", text: JSON.stringify(chartResult, null, 2) }] };
      }
      case "telescope_action_step": {
        const actionStepName = toolArgs.actionStepName as string | undefined;
        const newCurrentReality = toolArgs.newCurrentReality as string | undefined;
        
        if (!actionStepName || typeof actionStepName !== 'string') throw new Error("actionStepName must be string");
        if (!newCurrentReality || typeof newCurrentReality !== 'string') throw new Error("newCurrentReality must be string");
        
        const result = await knowledgeGraphManager.telescopeActionStep(
          actionStepName, newCurrentReality,
          Array.isArray(toolArgs.initialActionSteps) ? (toolArgs.initialActionSteps as string[]) : undefined
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      case "mark_action_complete": {
        if (typeof toolArgs.actionStepName !== 'string') throw new Error("actionStepName must be string");
        await knowledgeGraphManager.markActionStepComplete(toolArgs.actionStepName);
        return { content: [{ type: "text", text: `Action step marked complete` }] };
      }
      case "get_chart_progress": {
        if (typeof toolArgs.chartId !== 'string') throw new Error("chartId must be string");
        const result = await knowledgeGraphManager.getChartProgress(toolArgs.chartId);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      case "list_active_charts": {
        const chartsResult = await knowledgeGraphManager.listActiveCharts();
        let text = "## Structural Tension Charts\n\n";
        const masterCharts = chartsResult.filter(c => c.level === 0);
        masterCharts.forEach(master => {
          const progress = master.progress > 0 ? ` (${Math.round(master.progress * 100)}%)` : "";
          text += `📋 ${master.desiredOutcome}${progress}\n  ID: ${master.chartId}\n\n`;
        });
        return { content: [{ type: "text", text: text || "No charts found" }] };
      }
      case "update_action_progress": {
        if (typeof toolArgs.actionStepName !== 'string') throw new Error("actionStepName must be string");
        if (typeof toolArgs.progressObservation !== 'string') throw new Error("progressObservation must be string");
        await knowledgeGraphManager.updateActionProgress(
          toolArgs.actionStepName, toolArgs.progressObservation,
          toolArgs.updateCurrentReality === true
        );
        return { content: [{ type: "text", text: "Progress updated" }] };
      }
      case "update_current_reality": {
        if (typeof toolArgs.chartId !== 'string') throw new Error("chartId must be string");
        if (!Array.isArray(toolArgs.newObservations)) throw new Error("newObservations must be array");
        await knowledgeGraphManager.updateCurrentReality(toolArgs.chartId, toolArgs.newObservations as string[]);
        return { content: [{ type: "text", text: "Current reality updated" }] };
      }
      case "add_action_step": {
        if (typeof toolArgs.parentChartId !== 'string') throw new Error("parentChartId must be string");
        if (typeof toolArgs.actionStepTitle !== 'string') throw new Error("actionStepTitle must be string");
        if (typeof toolArgs.currentReality !== 'string') throw new Error("currentReality must be string");
        const result = await knowledgeGraphManager.addActionStep(
          toolArgs.parentChartId, toolArgs.actionStepTitle,
          toolArgs.dueDate as string | undefined, toolArgs.currentReality
        );
        return { content: [{ type: "text", text: `Action step added: ${result.chartId}` }] };
      }
      case "remove_action_step": {
        if (typeof toolArgs.parentChartId !== 'string') throw new Error("parentChartId must be string");
        if (typeof toolArgs.actionStepName !== 'string') throw new Error("actionStepName must be string");
        await knowledgeGraphManager.removeActionStep(toolArgs.parentChartId, toolArgs.actionStepName);
        return { content: [{ type: "text", text: "Action step removed" }] };
      }
      case "update_desired_outcome": {
        if (typeof toolArgs.chartId !== 'string') throw new Error("chartId must be string");
        if (typeof toolArgs.newDesiredOutcome !== 'string') throw new Error("newDesiredOutcome must be string");
        await knowledgeGraphManager.updateDesiredOutcome(toolArgs.chartId, toolArgs.newDesiredOutcome);
        return { content: [{ type: "text", text: "Desired outcome updated" }] };
      }
      case "update_action_step_title": {
        if (typeof toolArgs.actionStepName !== 'string') throw new Error("actionStepName must be string");
        if (typeof toolArgs.newTitle !== 'string') throw new Error("newTitle must be string");
        await knowledgeGraphManager.updateActionStepTitle(toolArgs.actionStepName, toolArgs.newTitle);
        return { content: [{ type: "text", text: "Action step title updated" }] };
      }
      case "creator_moment_of_truth": {
        if (typeof toolArgs.chartId !== 'string') throw new Error("chartId must be string");
        const step = (toolArgs.step as string) || "full_review";
        const input = toolArgs.userInput as string | undefined;
        const progress = await knowledgeGraphManager.getChartProgress(toolArgs.chartId);
        return { content: [{ type: "text", text: `Creator Moment of Truth (${step}): ${Math.round(progress.progress * 100)}% complete` }] };
      }
      case "init_llm_guidance": {
        const format = (toolArgs.format as string) || "full";
        if (format === "quick") {
          return { content: [{ type: "text", text: "🚨 CRITICAL: Current reality must be FACTUAL, never 'ready to begin'. Use list_active_charts first." }] };
        }
        return { content: [{ type: "text", text: LLM_GUIDANCE }] };
      }
      default: {
        return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
      }
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
});
EOF
echo "Handler validation patch created"
