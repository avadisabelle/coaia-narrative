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
  version: "0.13.4",
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
