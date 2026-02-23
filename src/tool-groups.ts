/**
 * COAIA Narrative - Tool Group Configuration
 *
 * Defines which MCP tools belong to each logical group and provides
 * filtering logic based on COAIA_TOOLS / COAIA_DISABLED_TOOLS environment variables.
 */

export const TOOL_GROUPS: Record<string, string[]> = {
  STC_TOOLS: [
    'create_structural_tension_chart',
    'telescope_action_step',
    'add_action_step',
    'manage_action_step',
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

export function getEnabledTools(): Set<string> {
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
    const groupTools = TOOL_GROUPS[group];
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
