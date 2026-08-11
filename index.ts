#!/usr/bin/env node

/**
 * COAIA Narrative - MCP Server Entry Point
 *
 * Thin wiring layer that connects the modular components:
 * - KnowledgeGraphManager (business logic)
 * - Tool definitions (MCP schemas)
 * - Tool handlers (request dispatch)
 * - Tool groups (filtering)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import path from 'path';
import { fileURLToPath } from 'url';
import minimist from 'minimist';
import { isAbsolute } from 'path';

import { KnowledgeGraphManager } from './src/graph-manager.js';
import { ALL_TOOL_DEFINITIONS } from './src/tool-definitions.js';
import { handleToolCall } from './src/tool-handlers.js';
import { getEnabledTools } from './src/tool-groups.js';
import { getHelpText } from './src/help.js';

// Parse args and handle paths safely
const argv = minimist(process.argv.slice(2));

// Handle help command
if (argv.help || argv.h) {
  console.log(getHelpText());
  process.exit(0);
}

let memoryPath = argv['memory-path'];

/**
 * Refuse a path that still carries an unexpanded shell variable.
 *
 * Paid for 2026-08-11. A seat booted with `MIADI_MINO_STCBOT_TRIAGE_CHART_MEMORY_PATH`
 * unset, so its `.mcp.json` handed this process the placeholder verbatim. The server
 * started happily and wrote a live structural tension chart into a file literally
 * NAMED `${MIADI_MINO_STCBOT_TRIAGE_CHART_MEMORY_PATH}` in whatever directory it
 * happened to be launched from. Nothing failed. The seat's charts were simply
 * somewhere nobody would ever look, and it took another seat auditing the boot to
 * find them.
 *
 * The sibling failure is worse and is the reason this is fatal rather than a warning:
 * had the variable been set to a path that does not exist, this server would have
 * started CLEAN and EMPTY, and the seat would have reported its whole store lost.
 * A store is the one input where "start anyway" is never the kind answer.
 *
 * `${` cannot appear in a legitimate path here: `$` is legal in a filename, but a
 * caller writing `${...}` is quoting a shell they expected to have run.
 */
if (typeof memoryPath === 'string' && memoryPath.includes('${')) {
  console.error(
    `[coaia-narrative] Refusing to start: --memory-path contains an unexpanded ` +
    `shell variable.\n` +
    `  got: ${memoryPath}\n` +
    `  The variable was not set in the environment that launched this process, so ` +
    `this would create a file with that literal name and write your charts into it ` +
    `where nothing will find them.\n` +
    `  Fix the environment (or pass a real path) and start again — no store was touched.`
  );
  process.exit(1);
}

// If a custom path is provided, ensure it's absolute
if (memoryPath && !isAbsolute(memoryPath)) {
  memoryPath = path.resolve(process.cwd(), memoryPath);
}

// Define the path to the JSONL file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEMORY_FILE_PATH = memoryPath || path.join(__dirname, 'memory.jsonl');

// Create the graph manager with the resolved memory path
const knowledgeGraphManager = new KnowledgeGraphManager(MEMORY_FILE_PATH);

// The server instance and tools exposed to AI models
const server = new Server({
  name: "coaia-narrative",
  version: "0.16.2",
  description: "COAIA Narrative - Structural Tension Charts with Narrative Beat Extension for multi-universe story capture. Extends coaia-memory with relational and ceremonial integration. 🚨 NEW LLM? Run 'init_llm_guidance' first."
}, {
  capabilities: {
    tools: {},
  },
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const enabledTools = getEnabledTools();
  const filteredTools = ALL_TOOL_DEFINITIONS.filter(tool => enabledTools.has(tool.name));
  return { tools: filteredTools };
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

    return await handleToolCall(name, (args || {}) as Record<string, unknown>, knowledgeGraphManager) as any;
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
