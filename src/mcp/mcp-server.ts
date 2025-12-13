/**
 * Main MCP server for coaia-narrative
 * Extends coaia-memory with narrative beat support and IAIP integration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  CallToolRequest,
  ListToolsRequest,
  Tool
} from '@modelcontextprotocol/sdk/types.js';

import { 
  createNarrativeBeat, 
  CreateNarrativeBeatInput,
  telescopeNarrativeBeat,
  TelescopeNarrativeBeatInput
} from './tools/index.js';

class CoaiaNarrativeServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'coaia-narrative',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupTools();
  }

  private setupTools(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: 'create_narrative_beat',
          description: 'Create a new narrative beat with multi-universe perspective and optional IAIP integration',
          inputSchema: {
            type: 'object',
            properties: {
              parentChartId: { type: 'string', description: 'ID of the parent structural tension chart' },
              title: { type: 'string', description: 'Title of the narrative beat' },
              act: { type: 'number', description: 'Act number in the narrative sequence' },
              type_dramatic: { type: 'string', description: 'Dramatic type (e.g., "Crisis/Antagonist Force", "Setup", "Turning Point")' },
              universes: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Universe perspectives (engineer-world, ceremony-world, story-engine-world)' 
              },
              description: { type: 'string', description: 'Detailed description of the narrative beat' },
              prose: { type: 'string', description: 'Prose narrative of the beat' },
              lessons: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Key lessons or insights from this beat' 
              },
              assessRelationalAlignment: { type: 'boolean', description: 'Whether to call iaip-mcp assess_relational_alignment' },
              initiateFourDirectionsInquiry: { type: 'boolean', description: 'Whether to call iaip-mcp get_direction_guidance' },
              filePath: { type: 'string', description: 'Path to narrative JSONL file (defaults to memory path with -narrative suffix)' }
            },
            required: ['parentChartId', 'title', 'act', 'type_dramatic', 'universes', 'description', 'prose', 'lessons']
          }
        },
        {
          name: 'telescope_narrative_beat',
          description: 'Telescope a narrative beat into sub-beats for detailed exploration',
          inputSchema: {
            type: 'object',
            properties: {
              parentBeatName: { type: 'string', description: 'Name of the parent narrative beat to telescope' },
              newCurrentReality: { type: 'string', description: 'Updated current reality for the telescoped beat' },
              initialSubBeats: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    type_dramatic: { type: 'string' },
                    description: { type: 'string' },
                    prose: { type: 'string' },
                    lessons: { type: 'array', items: { type: 'string' } }
                  },
                  required: ['title', 'type_dramatic', 'description', 'prose', 'lessons']
                },
                description: 'Optional initial sub-beats to create'
              },
              filePath: { type: 'string', description: 'Path to narrative JSONL file' }
            },
            required: ['parentBeatName', 'newCurrentReality']
          }
        }
      ];

      return { tools };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_narrative_beat': {
            const input = args as CreateNarrativeBeatInput;
            const result = await createNarrativeBeat(input);
            
            return {
              content: [
                {
                  type: 'text',
                  text: `Created narrative beat: ${result.entity.title}\n` +
                        `Name: ${result.entity.name}\n` +
                        `Act: ${result.entity.metadata.act} (${result.entity.metadata.type_dramatic})\n` +
                        `Universes: ${result.entity.metadata.universes.join(', ')}\n` +
                        `File: ${result.filePath}\n` +
                        `${result.relationalAssessment ? '\n✅ Relational alignment assessed' : ''}` +
                        `${result.fourDirectionsGuidance ? '\n✅ Four Directions guidance provided' : ''}`
                }
              ]
            };
          }

          case 'telescope_narrative_beat': {
            const input = args as TelescopeNarrativeBeatInput;
            const result = await telescopeNarrativeBeat(input);
            
            return {
              content: [
                {
                  type: 'text',
                  text: `Telescoped narrative beat: ${result.parentBeat.title}\n` +
                        `Current Reality Updated: ${input.newCurrentReality}\n` +
                        `Sub-beats Created: ${result.subBeats.length}\n` +
                        `File: ${result.filePath}\n` +
                        result.subBeats.map(beat => `  - ${beat.title} (${beat.metadata.type_dramatic})`).join('\n')
                }
              ]
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Main execution
const server = new CoaiaNarrativeServer();
server.run().catch(console.error);