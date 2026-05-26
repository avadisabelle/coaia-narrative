#!/usr/bin/env node

import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { KnowledgeGraphManager } from './dist/src/graph-manager.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const testFile = join(__dirname, 'test-rich-metadata-preservation.jsonl');

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, testName) {
  if (condition) {
    passed++;
    console.log(`  OK ${testName}`);
  } else {
    failed++;
    failures.push(testName);
    console.log(`  FAIL ${testName}`);
  }
}

function parseJsonl(content) {
  return content
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function findByName(records, name) {
  return records.find((record) => record.name === name);
}

async function run() {
  console.log('\nTesting rich JSONL metadata preservation...');

  const fixture = [
    {
      type: 'entity',
      name: 'chart_preserve_chart',
      entityType: 'structural_tension_chart',
      observations: ['Chart fixture'],
      metadata: {
        chartId: 'chart_preserve',
        dueDate: '2026-12-31T00:00:00.000Z',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        github: { owner: 'avadisabelle', repo: 'coaia-narrative', issue: 35 },
        runtime: { agent: 'coaia-agent', lane: 'metadata-preservation' },
        extension: { unknown: ['survives', { nested: true }] }
      },
      topLevelExtension: { source: 'fixture-chart' }
    },
    {
      type: 'entity',
      name: 'chart_preserve_desired_outcome',
      entityType: 'desired_outcome',
      observations: ['Preserve all rich metadata'],
      metadata: {
        chartId: 'chart_preserve',
        github: { owner: 'avadisabelle', repo: 'coaia-narrative', issue: 35 },
        sourceRefs: ['coaia-agent']
      }
    },
    {
      type: 'entity',
      name: 'chart_preserve_current_reality',
      entityType: 'current_reality',
      observations: ['Writer updates can rewrite JSONL'],
      metadata: {
        chartId: 'chart_preserve',
        github: { owner: 'avadisabelle', repo: 'coaia-narrative', issue: 35 },
        provenance: { importedBy: 'test-fixture' }
      }
    },
    {
      type: 'entity',
      name: 'chart_preserve_action_1',
      entityType: 'action_step',
      observations: ['Update safely'],
      metadata: {
        chartId: 'chart_preserve',
        completionStatus: false,
        github: { owner: 'avadisabelle', repo: 'coaia-narrative', issue: 35 },
        unknownActionMetadata: { depth: 2 }
      }
    },
    {
      type: 'narrative_beat',
      name: 'chart_preserve_beat_1',
      observations: ['Act 1 setup'],
      metadata: {
        chartId: 'chart_preserve',
        act: 1,
        type_dramatic: 'setup',
        github: { owner: 'avadisabelle', repo: 'coaia-narrative', issue: 35 },
        beatSpecific: { arc: 'metadata-continuity', nested: { survives: true } }
      },
      narrative: {
        description: 'A beat with top-level legacy narrative shape',
        prose: 'The record keeps its story while chart writers operate.',
        lessons: ['Unknown fields matter']
      },
      relational_alignment: { assessed: true, score: 1, principles: ['preservation'] },
      four_directions: { north_vision: 'trust', east_intention: null, south_emotion: null, west_introspection: null },
      topLevelExtension: { source: 'legacy-beat' }
    },
    {
      type: 'entity',
      name: 'chart_preserve_foundation_entity',
      entityType: 'artifact',
      observations: ['Foundation research metadata test entity'],
      metadata: {
        chartId: 'chart_preserve',
        foundation: {
          packetRoot: 'foundations/atlas-chronicle/',
          foundationType: 'atlas-chronicle',
          parentIssue: 'jgwill/coaia-agent#27',
          baselineIssue: 'jgwill/coaia-agent#31',
          inquiryIssue: 'jgwill/coaia-agent#29',
          protocolIssue: 'jgwill/coaia-agent#30',
          schemaIssue: 'avadisabelle/coaia-narrative#39',
          visualizerIssue: 'jgwill/coaia-visualizer#24',
          expectedArtifacts: ['README.md', 'ACADEMIC-FIELD-MAP.md', 'ACADEMIC-COVERAGE-MATRIX.md'],
          producedArtifacts: ['README.md'],
          evaluationStatus: 'produced',
          privacyClass: 'public-safe',
          publicationStatus: 'draft',
          commitHandles: ['abc123def456', '789ghi012jkl']
        }
      }
    },
    {
      type: 'entity',
      name: 'chart_preserve_lineage_entity',
      entityType: 'narrative_beat',
      observations: ['Session lineage metadata test entity'],
      metadata: {
        chartId: 'chart_preserve',
        act: 1,
        sessionLineage: {
          platform: 'telegram',
          parentChartId: 'chart_1779738656753',
          sourceBeat: 'chart_1779738656753_beat_1779809139411',
          originalSessionId: '20260526_150547_aac625',
          branchSessionId: '20260526_190820_c74f5e',
          branchIndex: 2,
          copiedMessageCount: 4,
          branchPurpose: 'Implement cross-repo metadata requirements for foundation/chart metadata',
          relatedIssues: ['avadisabelle/coaia-narrative#39', 'avadisabelle/coaia-narrative#40', 'jgwill/coaia-visualizer#24'],
          handoffState: 'implementation-ready'
        }
      }
    },
    {
      type: 'relation',
      from: 'chart_preserve_beat_1',
      to: 'chart_preserve_chart',
      relationType: 'documents',
      metadata: {
        github: { owner: 'avadisabelle', repo: 'coaia-narrative', issue: 35 },
        relationExtension: { survives: true }
      }
    }
  ];

  try {
    await fs.writeFile(testFile, `${fixture.map((record) => JSON.stringify(record)).join('\n')}\n`, 'utf-8');

    const manager = new KnowledgeGraphManager(testFile);
    await manager.updateCurrentReality('chart_preserve', ['Writer added one current reality observation']);
    await manager.updateActionProgress('chart_preserve_action_1', 'Progress observation added', false);

    const records = parseJsonl(await fs.readFile(testFile, 'utf-8'));
    const chart = findByName(records, 'chart_preserve_chart');
    const currentReality = findByName(records, 'chart_preserve_current_reality');
    const action = findByName(records, 'chart_preserve_action_1');
    const beat = findByName(records, 'chart_preserve_beat_1');
    const foundationEntity = findByName(records, 'chart_preserve_foundation_entity');
    const lineageEntity = findByName(records, 'chart_preserve_lineage_entity');
    const relation = records.find((record) => record.type === 'relation');

    assert(chart.metadata.github.issue === 35, 'chart metadata.github survived');
    assert(chart.metadata.extension.unknown[1].nested === true, 'unknown chart metadata survived');
    assert(chart.topLevelExtension.source === 'fixture-chart', 'unknown chart top-level field survived');
    assert(currentReality.metadata.github.repo === 'coaia-narrative', 'current reality metadata.github survived');
    assert(currentReality.metadata.provenance.importedBy === 'test-fixture', 'current reality provenance survived');
    assert(action.metadata.github.issue === 35, 'action metadata.github survived');
    assert(action.metadata.unknownActionMetadata.depth === 2, 'unknown action metadata survived');
    assert(beat.type === 'narrative_beat', 'legacy narrative beat record type survived');
    assert(beat.metadata.github.issue === 35, 'narrative beat metadata.github survived');
    assert(beat.metadata.beatSpecific.nested.survives === true, 'narrative beat-specific metadata survived');
    assert(beat.narrative.lessons[0] === 'Unknown fields matter', 'legacy top-level narrative survived');
    assert(beat.topLevelExtension.source === 'legacy-beat', 'narrative beat top-level extension survived');
    assert(relation.metadata.relationExtension.survives === true, 'relation extension metadata survived');
    
    // Asterion metadata preservation tests (issues #39 and #40)
    assert(foundationEntity.metadata.foundation.packetRoot === 'foundations/atlas-chronicle/', 'foundation metadata.packetRoot survived');
    assert(foundationEntity.metadata.foundation.foundationType === 'atlas-chronicle', 'foundation metadata.foundationType survived');
    assert(foundationEntity.metadata.foundation.parentIssue === 'jgwill/coaia-agent#27', 'foundation metadata.parentIssue survived');
    assert(foundationEntity.metadata.foundation.evaluationStatus === 'produced', 'foundation metadata.evaluationStatus survived');
    assert(foundationEntity.metadata.foundation.privacyClass === 'public-safe', 'foundation metadata.privacyClass survived');
    assert(foundationEntity.metadata.foundation.publicationStatus === 'draft', 'foundation metadata.publicationStatus survived');
    assert(foundationEntity.metadata.foundation.expectedArtifacts.length === 3, 'foundation metadata.expectedArtifacts array survived');
    assert(foundationEntity.metadata.foundation.producedArtifacts[0] === 'README.md', 'foundation metadata.producedArtifacts survived');
    assert(foundationEntity.metadata.foundation.commitHandles[0] === 'abc123def456', 'foundation metadata.commitHandles survived');
    
    assert(lineageEntity.metadata.sessionLineage.platform === 'telegram', 'sessionLineage metadata.platform survived');
    assert(lineageEntity.metadata.sessionLineage.parentChartId === 'chart_1779738656753', 'sessionLineage metadata.parentChartId survived');
    assert(lineageEntity.metadata.sessionLineage.sourceBeat === 'chart_1779738656753_beat_1779809139411', 'sessionLineage metadata.sourceBeat survived');
    assert(lineageEntity.metadata.sessionLineage.branchIndex === 2, 'sessionLineage metadata.branchIndex survived');
    assert(lineageEntity.metadata.sessionLineage.copiedMessageCount === 4, 'sessionLineage metadata.copiedMessageCount survived');
    assert(lineageEntity.metadata.sessionLineage.handoffState === 'implementation-ready', 'sessionLineage metadata.handoffState survived');
    assert(lineageEntity.metadata.sessionLineage.relatedIssues.length === 3, 'sessionLineage metadata.relatedIssues array survived');
    assert(lineageEntity.metadata.sessionLineage.relatedIssues[0] === 'avadisabelle/coaia-narrative#39', 'sessionLineage metadata.relatedIssues[0] survived');

    if (failed > 0) {
      throw new Error(`Metadata preservation test failed:\n- ${failures.join('\n- ')}`);
    }

    console.log(`\nMetadata preservation tests passed: ${passed}`);
  } finally {
    try { await fs.unlink(testFile); } catch {}
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
