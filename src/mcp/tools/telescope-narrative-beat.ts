/**
 * Telescope narrative beat tool
 * Enables telescoping a narrative beat into sub-beats for detailed exploration
 */

import { z } from 'zod';
import { NarrativeBeatEntity } from '../../types/index.js';
import { NarrativeBeatParser, NarrativeBeatWriter } from '../../jsonl/index.js';
import { createNarrativeBeat, CreateNarrativeBeatInput } from './create-narrative-beat.js';

export const telescopeNarrativeBeatSchema = z.object({
  parentBeatName: z.string().describe('Name of the parent narrative beat to telescope'),
  newCurrentReality: z.string().describe('Updated current reality for the telescoped beat'),
  initialSubBeats: z.array(z.object({
    title: z.string(),
    type_dramatic: z.string(),
    description: z.string(),
    prose: z.string(),
    lessons: z.array(z.string())
  })).optional().describe('Optional initial sub-beats to create'),
  filePath: z.string().optional().describe('Path to narrative JSONL file')
});

export type TelescopeNarrativeBeatInput = z.infer<typeof telescopeNarrativeBeatSchema>;

export interface TelescopeNarrativeBeatResult {
  parentBeat: NarrativeBeatEntity;
  subBeats: NarrativeBeatEntity[];
  filePath: string;
}

export async function telescopeNarrativeBeat(input: TelescopeNarrativeBeatInput): Promise<TelescopeNarrativeBeatResult> {
  // Determine file path
  const filePath = input.filePath || './src/memories/default-narrative.jsonl';
  
  // Parse existing file to find parent beat
  const parser = new NarrativeBeatParser(filePath);
  const parentBeat = await parser.findBeatByName(input.parentBeatName);
  
  if (!parentBeat) {
    throw new Error(`Parent beat not found: ${input.parentBeatName}`);
  }

  // Update parent beat's current reality (add to observations)
  parentBeat.observations.push(`Telescoped: ${input.newCurrentReality}`);
  
  const subBeats: NarrativeBeatEntity[] = [];

  // Create sub-beats if provided
  if (input.initialSubBeats && input.initialSubBeats.length > 0) {
    for (let i = 0; i < input.initialSubBeats.length; i++) {
      const subBeat = input.initialSubBeats[i];
      
      const createInput: CreateNarrativeBeatInput = {
        parentChartId: input.parentBeatName, // Use parent beat as chart ID
        title: subBeat.title,
        act: i + 1, // Sequential act numbers
        type_dramatic: subBeat.type_dramatic,
        universes: parentBeat.metadata.universes, // Inherit universes
        description: subBeat.description,
        prose: subBeat.prose,
        lessons: subBeat.lessons,
        filePath: filePath
      };

      const result = await createNarrativeBeat(createInput);
      subBeats.push(result.entity);
    }
  }

  // Write updated parent beat
  const writer = new NarrativeBeatWriter(filePath);
  await writer.writeNarrativeBeat(parentBeat);

  return {
    parentBeat,
    subBeats,
    filePath
  };
}