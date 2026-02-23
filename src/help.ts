/**
 * COAIA Narrative - CLI Help Text
 *
 * Generates help text for the MCP server CLI entry point.
 */

export function getHelpText(): string {
  return `
🧠 COAIA Narrative - Creative-Oriented AI Assistant Memory System v0.12.0
   Based on Robert Fritz's Structural Tension methodology

DESCRIPTION:
   MCP server that extends knowledge graphs with structural tension charts for 
   creative-oriented memory management. Supports advancing patterns, telescoping
   charts, and natural language interaction for AI assistants.

USAGE:
   coaia-narrative [OPTIONS]
   npx coaia-narrative [OPTIONS]

OPTIONS:
   --memory-path PATH    Custom path for memory storage (default: ./memory.jsonl)
   --help, -h           Show this help message

ENVIRONMENT VARIABLES:
   COAIA_TOOLS          Comma or space separated list of tool groups and/or individual tools to enable
                        (default: "STC_TOOLS,NARRATIVE_TOOLS,init_llm_guidance")

   COAIA_DISABLED_TOOLS Comma or space separated list of tools to disable
                        (useful for selectively removing tools from a group)

TOOL GROUPS:
   STC_TOOLS            All structural tension chart tools (14 tools) - recommended for creative work
   KG_TOOLS             All knowledge graph tools (9 tools) - for traditional entity/relation work
   CORE_TOOLS           Essential tools only (4 tools) - minimal viable set

EXAMPLES:
   # Use only STC tools (default)
   coaia-narrative --memory-path ./memory.jsonl

   # Enable both STC and KG tools
   COAIA_TOOLS="STC_TOOLS KG_TOOLS" coaia-narrative --memory-path ./memory.jsonl

   # Use only core tools
   COAIA_TOOLS="CORE_TOOLS" coaia-narrative --memory-path ./memory.jsonl

   # Enable STC tools but disable specific tools
   COAIA_TOOLS="STC_TOOLS" COAIA_DISABLED_TOOLS="delete_entities,delete_relations" coaia-narrative

   # Enable specific individual tools
   COAIA_TOOLS="create_structural_tension_chart add_action_step list_active_charts" coaia-narrative

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
   • manage_action_step            - ✨ RECOMMENDED: Unified add/expand action steps
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
   coaia-narrative --memory-path /path/to/my-charts.jsonl
   
   # Use in Claude Desktop (add to claude_desktop_config.json):
   {
     "mcpServers": {
       "coaia-narrative": {
         "command": "npx", 
         "args": ["-y", "coaia-narrative", "--memory-path", "./charts.jsonl"]
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
   COAIA Narrative recognizes that structure determines behavior. By organizing
   memory around structural tension rather than problem-solving patterns, it
   naturally forms a structure that advances and helps build, not just the life you want, but the technologies to support its manifestation (hopefully!).

CREDITS:
   • Author: J.Guillaume D.-Isabelle <jgi@jgwill.com>
   • Methodology: Robert Fritz - https://robertfritz.com
   • Foundation: Shane Holloman (original mcp-knowledge-graph)
   • License: MIT

For more information, see: CLAUDE.md in the package directory
`;
}
