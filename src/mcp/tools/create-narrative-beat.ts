/**
 * Create narrative beat tool
 * Main MCP tool for creating narrative beats with IAIP integration
 */

import { z } from 'zod';
import { NarrativeBeatEntity, NarrativeBeatMetadata, NarrativeContent } from '../../types/index.js';
import { NarrativeBeatWriter } from '../../jsonl/index.js';

export const createNarrativeBeatSchema = z.object({
  parentChartId: z.string().describe('ID of the parent structural tension chart'),
  title: z.string().describe('Title of the narrative beat'),
  act: z.number().describe('Act number in the narrative sequence'),
  type_dramatic: z.string().describe('Dramatic type (e.g., "Crisis/Antagonist Force", "Setup", "Turning Point")'),
  universes: z.array(z.string()).describe('Universe perspectives (engineer-world, ceremony-world, story-engine-world)'),
  description: z.string().describe('Detailed description of the narrative beat'),
  prose: z.string().describe('Prose narrative of the beat'),
  lessons: z.array(z.string()).describe('Key lessons or insights from this beat'),
  assessRelationalAlignment: z.boolean().optional().describe('Whether to call iaip-mcp assess_relational_alignment'),
  initiateFourDirectionsInquiry: z.boolean().optional().describe('Whether to call iaip-mcp get_direction_guidance'),
  filePath: z.string().optional().describe('Path to narrative JSONL file (defaults to memory path with -narrative suffix)')
});

export type CreateNarrativeBeatInput = z.infer<typeof createNarrativeBeatSchema>;

export interface CreateNarrativeBeatResult {
  entity: NarrativeBeatEntity;
  filePath: string;
  relationalAssessment?: any;
  fourDirectionsGuidance?: any;
}

export async function createNarrativeBeat(input: CreateNarrativeBeatInput): Promise<CreateNarrativeBeatResult> {
  // Generate unique name for the beat
  const timestamp = Date.now();
  const beatName = `${input.parentChartId}_beat_${timestamp}`;
  
  // Determine file path
  const filePath = input.filePath || getDefaultNarrativeFilePath(input.parentChartId);
  
  // Create metadata
  const metadata: NarrativeBeatMetadata = {
    act: input.act,
    type_dramatic: input.type_dramatic,
    universes: input.universes,
    timestamp: new Date().toISOString(),
    parentChart: input.parentChartId,
    createdAt: new Date().toISOString()
  };

  // Create narrative content
  const narrative: NarrativeContent = {
    description: input.description,
    prose: input.prose,
    lessons: input.lessons
  };

  // Create the narrative beat entity
  const entity: NarrativeBeatEntity = {
    type: "narrative_beat",
    name: beatName,
    title: input.title,
    observations: [
      `Act ${input.act} ${input.type_dramatic}`,
      `Timestamp: ${metadata.timestamp}`,
      `Universe: ${input.universes.join(', ')}`
    ],
    metadata,
    narrative,
    relational_alignment: {
      assessed: false,
      score: null,
      principles: []
    },
    four_directions: {
      north_vision: null,
      east_intention: null,
      south_emotion: null,
      west_introspection: null
    }
  };

  // Initialize result
  const result: CreateNarrativeBeatResult = {
    entity,
    filePath
  };

  // TODO: Call iaip-mcp tools if requested
  if (input.assessRelationalAlignment) {
    // result.relationalAssessment = await callRelationalAlignment(entity);
    console.log('Relational alignment assessment requested (iaip-mcp integration pending)');
  }

  if (input.initiateFourDirectionsInquiry) {
    // result.fourDirectionsGuidance = await callFourDirectionsGuidance(entity);
    console.log('Four Directions inquiry requested (iaip-mcp integration pending)');
  }

  // Write to JSONL file
  const writer = new NarrativeBeatWriter(filePath);
  await writer.writeNarrativeBeat(entity);

  return result;
}

function getDefaultNarrativeFilePath(parentChartId: string): string {
  // Extract base name from parent chart ID and add -narrative suffix
  const baseName = parentChartId.replace(/^chart_/, '').replace(/_\d+$/, '');
  return `./src/memories/${baseName}-narrative.jsonl`;
}