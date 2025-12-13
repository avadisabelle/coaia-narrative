/**
 * JSONL parser for narrative beat entities
 * Handles reading and parsing of narrative beats from JSONL files
 */

import * as fs from 'fs';
import { NarrativeBeatEntity, NarrativeRelation } from '../types/index.js';

export interface NarrativeBeatParseResult {
  beats: NarrativeBeatEntity[];
  relations: NarrativeRelation[];
  errors: string[];
}

export class NarrativeBeatParser {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  /**
   * Parse all narrative beats and relations from the JSONL file
   */
  async parseFile(): Promise<NarrativeBeatParseResult> {
    const result: NarrativeBeatParseResult = {
      beats: [],
      relations: [],
      errors: []
    };

    if (!fs.existsSync(this.filePath)) {
      return result;
    }

    try {
      const content = await fs.promises.readFile(this.filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());

      for (let i = 0; i < lines.length; i++) {
        try {
          const obj = JSON.parse(lines[i]);
          
          if (obj.type === 'narrative_beat') {
            result.beats.push(obj as NarrativeBeatEntity);
          } else if (obj.type === 'relation') {
            result.relations.push(obj as NarrativeRelation);
          }
        } catch (parseError) {
          result.errors.push(`Line ${i + 1}: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
        }
      }
    } catch (fileError) {
      result.errors.push(`File read error: ${fileError instanceof Error ? fileError.message : 'Unknown file error'}`);
    }

    return result;
  }

  /**
   * Find narrative beats by parent chart ID
   */
  async findBeatsByParentChart(parentChartId: string): Promise<NarrativeBeatEntity[]> {
    const parseResult = await this.parseFile();
    return parseResult.beats.filter(beat => 
      beat.metadata.parentChart === parentChartId
    );
  }

  /**
   * Find narrative beat by name
   */
  async findBeatByName(name: string): Promise<NarrativeBeatEntity | null> {
    const parseResult = await this.parseFile();
    return parseResult.beats.find(beat => beat.name === name) || null;
  }

  /**
   * Find relations involving a specific beat
   */
  async findRelationsForBeat(beatName: string): Promise<NarrativeRelation[]> {
    const parseResult = await this.parseFile();
    return parseResult.relations.filter(relation => 
      relation.from === beatName || relation.to === beatName
    );
  }
}