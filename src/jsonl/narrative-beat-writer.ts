/**
 * JSONL writer for narrative beat entities
 * Handles persistence of narrative beats to JSONL files
 */

import * as fs from 'fs';
import * as path from 'path';
import { NarrativeBeatEntity, NarrativeRelation } from '../types/index.js';

export class NarrativeBeatWriter {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Append a narrative beat entity to the JSONL file
   */
  async writeNarrativeBeat(beat: NarrativeBeatEntity): Promise<void> {
    const jsonLine = JSON.stringify(beat) + '\n';
    await fs.promises.appendFile(this.filePath, jsonLine, 'utf8');
  }

  /**
   * Append a narrative relation to the JSONL file
   */
  async writeNarrativeRelation(relation: NarrativeRelation): Promise<void> {
    const jsonLine = JSON.stringify(relation) + '\n';
    await fs.promises.appendFile(this.filePath, jsonLine, 'utf8');
  }

  /**
   * Write multiple entities at once
   */
  async writeBatch(items: (NarrativeBeatEntity | NarrativeRelation)[]): Promise<void> {
    const content = items.map(item => JSON.stringify(item)).join('\n') + '\n';
    await fs.promises.appendFile(this.filePath, content, 'utf8');
  }

  /**
   * Get the file path for this writer
   */
  getFilePath(): string {
    return this.filePath;
  }
}