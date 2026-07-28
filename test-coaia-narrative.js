#!/usr/bin/env node

/**
 * Integration tests for coaia-narrative refactored modules.
 *
 * Tests the shared core modules:
 * - KnowledgeGraphManager (graph-manager.ts)
 * - handleToolCall (tool-handlers.ts)
 * - getEnabledTools / TOOL_GROUPS (tool-groups.ts)
 * - Tool definitions (tool-definitions.ts)
 * - MCP server wiring (index.ts)
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { KnowledgeGraphManager } from './dist/src/graph-manager.js';
import { handleToolCall } from './dist/src/tool-handlers.js';
import { getEnabledTools, TOOL_GROUPS } from './dist/src/tool-groups.js';
import { ALL_TOOL_DEFINITIONS } from './dist/src/tool-definitions.js';
import {
  GITHUB_PROJECT_FIELD_NAMES,
  createGithubProjectFieldProjection,
  normalizeGithubBridgeMetadata,
} from './dist/src/github-bridge.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, 'dist', 'index.js');
const PACKAGE_VERSION = JSON.parse(await fs.readFile(join(__dirname, 'package.json'), 'utf8')).version;

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, testName) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${testName}`);
  } else {
    failed++;
    failures.push(testName);
    console.log(`  ❌ ${testName}`);
  }
}

// ==================== GitHub Bridge Helper Tests ====================

async function testGithubBridgeHelpers() {
  console.log('\n🔗 Testing GitHub Bridge Helpers...');
  const testFile = join(__dirname, 'test-github-bridge.jsonl');

  const requiredFieldNames = [
    'goal',
    'current_reality',
    'observations',
    'question',
    'Status',
    'phase',
    'session_id',
    'four_dir_east',
    'four_dir_south',
    'four_dir_west',
    'four_dir_north',
    'relational_assessed',
    'relational_principles',
  ];

  for (const fieldName of requiredFieldNames) {
    assert(GITHUB_PROJECT_FIELD_NAMES.includes(fieldName), `GitHub field family includes ${fieldName}`);
  }

  const chartEntity = {
    name: 'chart_123_chart',
    entityType: 'structural_tension_chart',
    observations: ['Chart created for GitHub bridge verification'],
    metadata: {
      chartId: 'chart_123',
      phase: 'assimilation',
      source: { system: 'coaia-github', sessionId: 'session-bridge-1' },
      narrative: {
        description: 'What creates a stable GitHub bridge?',
        prose: '',
        lessons: [],
      },
      fourDirections: {
        east_intention: 'Name the canonical bridge shape',
        south_emotion: 'Keep compatibility with existing JSONL',
        west_introspection: 'Project fields are projections, not duplicated state',
        north_vision: 'Runtime memory mirrors local structural tension',
      },
      relationalAlignment: {
        assessed: true,
        score: null,
        principles: ['OCAP', 'dual-read transition'],
      },
      github: {
        issue: {
          owner: 'avadisabelle',
          repo: 'coaia-narrative',
          number: 34,
        },
        projectItem: {
          projectNumber: 18,
          projectOwner: 'jgwill',
          itemId: 'PVTI_canonical',
        },
        syncState: 'synced',
      },
      sync_target: {
        owner: 'avadisabelle',
        repo: 'coaia-narrative',
        issue_number: 28,
        project_number: 18,
        item_id: 'PVTI_legacy',
      },
    },
  };

  const desiredOutcome = {
    name: 'chart_123_desired_outcome',
    entityType: 'desired_outcome',
    observations: ['Canonical GitHub bridge support for structural runtime memory.'],
    metadata: { chartId: 'chart_123' },
  };

  const currentReality = {
    name: 'chart_123_current_reality',
    entityType: 'current_reality',
    observations: [
      'metadata.github is not yet represented in runtime types',
      'legacy aliases still appear in existing bridge specs',
    ],
    metadata: { chartId: 'chart_123' },
  };

  const actionOne = {
    name: 'chart_123_action_1',
    entityType: 'action_step',
    observations: ['Add canonical types'],
    metadata: { chartId: 'chart_123', completionStatus: true },
  };

  const actionTwo = {
    name: 'chart_123_action_2',
    entityType: 'action_step',
    observations: ['Add projection helper tests'],
    metadata: { chartId: 'chart_123', completionStatus: false },
  };

  const graph = {
    entities: [chartEntity, desiredOutcome, currentReality, actionOne, actionTwo],
    relations: [
      { from: 'chart_123_chart', to: 'chart_123_desired_outcome', relationType: 'contains' },
      { from: 'chart_123_chart', to: 'chart_123_current_reality', relationType: 'contains' },
      { from: 'chart_123_chart', to: 'chart_123_action_1', relationType: 'contains' },
      { from: 'chart_123_chart', to: 'chart_123_action_2', relationType: 'contains' },
    ],
  };

  const normalized = normalizeGithubBridgeMetadata(chartEntity.metadata);
  assert(normalized.issue?.number === 34, 'Canonical metadata.github issue wins over sync_target');
  assert(normalized.projectItems[0]?.itemId === 'PVTI_canonical', 'Canonical project item wins over legacy item');
  assert(normalized.syncState === 'synced', 'Canonical sync state is preserved');

  const legacySyncTarget = normalizeGithubBridgeMetadata({
    sync_target: {
      owner: 'avadisabelle',
      repo: 'coaia-narrative',
      issue_number: 28,
      project_number: 18,
      item_id: 'PVTI_legacy',
    },
  });
  assert(legacySyncTarget.issue?.number === 28, 'Legacy sync_target issue normalizes');
  assert(legacySyncTarget.projectItems[0]?.projectOwner === 'avadisabelle', 'Legacy sync_target project owner falls back to repo owner');
  assert(legacySyncTarget.legacyProjectItemId === 'PVTI_legacy', 'Legacy sync_target item id is retained');

  const legacyGithubRef = normalizeGithubBridgeMetadata({
    github_ref: {
      owner: 'jgwill',
      repo: 'coaia-agent',
      issue_number: '18',
    },
  });
  assert(legacyGithubRef.issue?.number === 18, 'Legacy github_ref issue normalizes');

  const projection = createGithubProjectFieldProjection(chartEntity, graph);
  assert(projection.goal === desiredOutcome.observations[0], 'Projection derives goal from desired_outcome');
  assert(projection.current_reality === currentReality.observations.join('\n'), 'Projection derives current_reality observations');
  assert(projection.Status === 'In progress', 'Projection derives Status from phase and completion ratio');
  assert(projection.phase === 'assimilation', 'Projection includes phase field');
  assert(projection.session_id === 'session-bridge-1', 'Projection includes session_id from source metadata');
  assert(projection.four_dir_east === 'Name the canonical bridge shape', 'Projection includes east direction');
  assert(projection.four_dir_south === 'Keep compatibility with existing JSONL', 'Projection includes south direction');
  assert(projection.four_dir_west === 'Project fields are projections, not duplicated state', 'Projection includes west direction');
  assert(projection.four_dir_north === 'Runtime memory mirrors local structural tension', 'Projection includes north direction');
  assert(projection.relational_assessed === 'Yes', 'Projection maps relational assessment');
  assert(projection.relational_principles === 'OCAP\ndual-read transition', 'Projection maps relational principles');

  try {
    try { await fs.unlink(testFile); } catch {}
    const manager = new KnowledgeGraphManager(testFile);
    await manager.createEntities(graph.entities);
    await manager.createRelations(graph.relations);

    const managerProjection = await manager.getGithubProjectFieldProjection('chart_123');
    assert(managerProjection?.goal === desiredOutcome.observations[0], 'Manager exposes GitHub projection by chart ID');
  } finally {
    try { await fs.unlink(testFile); } catch {}
  }
}

// ==================== Graph Manager Tests ====================

async function testGraphManager() {
  console.log('\n📊 Testing KnowledgeGraphManager...');
  const testFile = join(__dirname, 'test-graph-manager.jsonl');

  try {
    // Clean up
    try { await fs.unlink(testFile); } catch {}

    const manager = new KnowledgeGraphManager(testFile);

    // Test 1: Empty graph
    const emptyGraph = await manager.readGraph();
    assert(emptyGraph.entities.length === 0, 'Empty graph has no entities');
    assert(emptyGraph.relations.length === 0, 'Empty graph has no relations');

    // Test 2: Create chart
    const chart = await manager.createStructuralTensionChart(
      'Learn TypeScript',
      'I know JavaScript but not TypeScript',
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      ['Read handbook', 'Build a project']
    );
    assert(chart.chartId.startsWith('chart_'), 'Chart ID has correct prefix');
    assert(chart.entities.length >= 3, 'Chart has at least 3 entities (chart, outcome, reality)');
    assert(chart.relations.length >= 3, 'Chart has at least 3 relations');

    // Test 3: List active charts
    const activeCharts = await manager.listActiveCharts();
    assert(activeCharts.length === 1, 'One active chart');
    assert(activeCharts[0].desiredOutcome === 'Learn TypeScript', 'Correct desired outcome');

    // Test 4: Get chart progress
    const progress = await manager.getChartProgress(chart.chartId);
    assert(progress.totalActions === 2, 'Two action steps');
    assert(progress.completedActions === 0, 'No completed actions');
    assert(progress.progress === 0, 'Zero progress');

    // Test 5: Get chart details
    const details = await manager.getChartDetails(chart.chartId);
    assert(details !== null, 'Chart details returned');
    assert(details.entities.length >= 3, 'Chart details have entities');

    // Test 6: Update current reality
    await manager.updateCurrentReality(chart.chartId, ['Started reading TypeScript handbook']);
    const graphAfterUpdate = await manager.readGraph();
    const currentReality = graphAfterUpdate.entities.find(e =>
      e.name === `${chart.chartId}_current_reality`
    );
    assert(
      currentReality.observations.includes('Started reading TypeScript handbook'),
      'Current reality updated with new observation'
    );

    // Test 7: Update desired outcome
    await manager.updateDesiredOutcome(chart.chartId, 'Master TypeScript for full-stack development');
    const graphAfterOutcomeUpdate = await manager.readGraph();
    const desiredOutcome = graphAfterOutcomeUpdate.entities.find(e =>
      e.name === `${chart.chartId}_desired_outcome`
    );
    assert(
      desiredOutcome.observations[0] === 'Master TypeScript for full-stack development',
      'Desired outcome updated'
    );

    // Test 8: Mark action complete
    const actionSteps = graphAfterOutcomeUpdate.entities.filter(e =>
      e.entityType === 'action_step' && e.metadata?.chartId === chart.chartId
    );
    assert(actionSteps.length === 2, 'Two action step entities exist');

    await manager.markActionStepComplete(actionSteps[0].name);
    const progressAfterComplete = await manager.getChartProgress(chart.chartId);
    assert(progressAfterComplete.completedActions === 1, 'One action completed');
    assert(progressAfterComplete.progress === 0.5, 'Progress is 50%');

    // Test 9: Search nodes
    const searchResult = await manager.searchNodes('TypeScript');
    assert(searchResult.entities.length > 0, 'Search finds TypeScript entities');

    // Test 10: Add action step (creates telescoped chart)
    const addResult = await manager.addActionStep(
      chart.chartId,
      'Write a REST API',
      undefined,
      'Never built a REST API with TypeScript'
    );
    assert(addResult.chartId.startsWith('chart_'), 'Telescoped chart created');
    const chartsAfterAdd = await manager.listActiveCharts();
    assert(chartsAfterAdd.length === 2, 'Two charts after adding action step');

    // Test 11: MMOT evaluation
    const mmotResult = await manager.performMmotEvaluation(
      chart.chartId,
      'acknowledge',
      'Progress is slower than expected',
      'South',
      undefined,
      true
    );
    assert(mmotResult.guidance.includes('MMOT Phase 1'), 'MMOT guidance generated');
    assert(mmotResult.evaluationStored === true, 'MMOT evaluation stored');
    assert(mmotResult.beatEmitted === true, 'MMOT beat emitted');

    // Test 12: Create entities (KG operations)
    const newEntities = await manager.createEntities([
      { name: 'test_entity', entityType: 'concept', observations: ['A test concept'] }
    ]);
    assert(newEntities.length === 1, 'Entity created');

    // Test 13: Create relations
    const newRelations = await manager.createRelations([
      { from: 'test_entity', to: `${chart.chartId}_chart`, relationType: 'relates_to' }
    ]);
    assert(newRelations.length === 1, 'Relation created');

    // Test 14: Delete entities
    await manager.deleteEntities(['test_entity']);
    const graphAfterDelete = await manager.readGraph();
    assert(!graphAfterDelete.entities.find(e => e.name === 'test_entity'), 'Entity deleted');

    // Test 15: Narrative beats
    const beat = await manager.createNarrativeBeat(
      chart.chartId, 'Test Beat', 1, 'Setup',
      ['engineer-world'], 'A test narrative beat',
      'Once upon a time...', ['Testing works']
    );
    assert(beat.beatName.includes('beat_'), 'Narrative beat created');

    const beats = await manager.listNarrativeBeats(chart.chartId);
    assert(beats.length >= 1, 'Narrative beats listed');

    // Test 16: manage_action_step (unified interface)
    const manageResult = await manager.manageActionStep(
      chart.chartId,
      'Deploy to production',
      'No deployment experience yet'
    );
    assert(manageResult.chartId.startsWith('chart_'), 'manage_action_step creates chart');

    // Test 17: Wampum belt sequencing (parallel non-linear narrative layer)
    const { beltId, entity: beltEntity } = await manager.createWampumBelt(
      'Treaty Belt',
      'Anchor obligations and witness relational memory',
      2,
      3
    );
    assert(beltId.startsWith('belt_'), 'Wampum belt created');
    assert(beltEntity.entityType === 'wampum_belt', 'Wampum entity type stored');

    const { bead } = await manager.addWampumBead(
      beltId,
      'the crossing',
      'purple',
      { row: 0, col: 0 },
      'Where paths first met',
      { left: 'Origin point', center: 'Meeting place' },
      { ceremonyType: 'accountability', chartId: chart.chartId, beatName: beat.beatName }
    );
    assert(bead.id === `bead_${beltId}_0_0`, 'Wampum bead created at position');
    const graphWithWampum = await manager.readGraph();
    assert(
      graphWithWampum.relations.some(r => r.relationType === 'wampum_holds_accountable' && r.from === `${beltId}_belt` && r.to === `${chart.chartId}_chart`),
      'Wampum ceremony link creates accountability relation'
    );
    assert(
      graphWithWampum.relations.some(r => r.relationType === 'wampum_witnesses' && r.from === `${beltId}_belt` && r.to === beat.beatName),
      'Wampum ceremony link creates witness relation'
    );

    const { bead: edgeBead } = await manager.addWampumBead(
      beltId,
      'western witness',
      'white',
      { row: 1, col: 2 },
      'Boundary witness',
      { right: 'Edge perspective' }
    );
    assert(edgeBead.id === `bead_${beltId}_1_2`, 'Wampum bead supports multi-row multi-column positions');

    const beltRead = await manager.readWampumBelt(beltId, { row: 0, col: 0 });
    assert(beltRead.bead?.mnemonic === 'the crossing', 'Wampum bead resolved by position');
    assert(beltRead.positionalReading === 'Origin point', 'Relational reading resolved by position');
    const edgeRead = await manager.readWampumBelt(beltId, { row: 1, col: 2 });
    assert(edgeRead.positionalReading === 'Edge perspective', 'Wampum right-edge positional reading resolved');

    let outOfBoundsReadThrown = false;
    let outOfBoundsMessage = '';
    try {
      await manager.readWampumBelt(beltId, { row: 4, col: 0 });
    } catch (error) {
      outOfBoundsReadThrown = true;
      outOfBoundsMessage = error.message;
    }
    assert(outOfBoundsReadThrown, 'Out-of-bounds Wampum read throws error');
    assert(outOfBoundsMessage.includes('out of bounds'), 'Out-of-bounds read returns explicit bounds error');
    let outOfBoundsColThrown = false;
    try {
      await manager.readWampumBelt(beltId, { row: 0, col: 5 });
    } catch {
      outOfBoundsColThrown = true;
    }
    assert(outOfBoundsColThrown, 'Out-of-bounds Wampum column read throws error');

    // Test 18: GitHub issue provenance on charts (metadata.github.issue)
    const issueChart = await manager.createStructuralTensionChart(
      'Establish a readable record of where each chart came from',
      'Charts carry no reference to the issue they were written from',
      '2026-08-15T00:00:00Z',
      [],
      undefined,
      'avadisabelle/coaia-narrative#50'
    );
    const issueChartEntity = issueChart.entities.find(e => e.entityType === 'structural_tension_chart');
    assert(issueChartEntity.metadata.github.issue.owner === 'avadisabelle', 'Chart create records issue owner');
    assert(issueChartEntity.metadata.github.issue.repo === 'coaia-narrative', 'Chart create records issue repo');
    assert(issueChartEntity.metadata.github.issue.number === 50, 'Chart create records issue number');
    assert(
      issueChartEntity.metadata.github.issue.url === 'https://github.com/avadisabelle/coaia-narrative/issues/50',
      'Chart create derives issue url'
    );

    const linked = await manager.linkChartToGithubIssue(chart.chartId, 'jgwill/Miadi#36');
    assert(linked.issue.owner === 'jgwill' && linked.issue.number === 36, 'Existing chart links to issue');
    const graphWithIssue = await manager.readGraph();
    const linkedEntity = graphWithIssue.entities.find(e => e.name === `${chart.chartId}_chart`);
    assert(linkedEntity.metadata.github.issue.repo === 'Miadi', 'Issue reference persists on the chart entity');

    let bareRefThrown = false;
    let bareRefMessage = '';
    try {
      await manager.linkChartToGithubIssue(chart.chartId, '#36');
    } catch (error) {
      bareRefThrown = true;
      bareRefMessage = error.message;
    }
    assert(bareRefThrown, 'Bare #number issue reference is rejected');
    assert(bareRefMessage.includes('owner/repo#number'), 'Rejection names the required full path form');

    let ownerOnlyThrown = false;
    try {
      await manager.linkChartToGithubIssue(chart.chartId, 'coaia-narrative#50');
    } catch {
      ownerOnlyThrown = true;
    }
    assert(ownerOnlyThrown, 'Repo-without-owner issue reference is rejected');

    let missingChartThrown = false;
    try {
      await manager.linkChartToGithubIssue('chart_does_not_exist', 'jgwill/Miadi#36');
    } catch {
      missingChartThrown = true;
    }
    assert(missingChartThrown, 'Linking an absent chart throws');
  } finally {
    // Clean up
    try { await fs.unlink(testFile); } catch {}
  }
}

// ==================== Tool Handlers Tests ====================

async function testToolHandlers() {
  console.log('\n🔧 Testing Tool Handlers...');
  const testFile = join(__dirname, 'test-tool-handlers.jsonl');

  try {
    try { await fs.unlink(testFile); } catch {}

    const manager = new KnowledgeGraphManager(testFile);

    // Test 1: create_structural_tension_chart via handler
    const createResult = await handleToolCall('create_structural_tension_chart', {
      desiredOutcome: 'Build a web app',
      currentReality: 'Have an idea but no code',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    }, manager);
    assert(!createResult.isError, 'create_structural_tension_chart succeeds');
    assert(createResult.content[0].text.includes('chartId'), 'Response includes chartId');

    // Extract chartId from response
    const chartData = JSON.parse(createResult.content[0].text);
    const chartId = chartData.chartId;

    // Test 2: list_active_charts via handler
    const listResult = await handleToolCall('list_active_charts', {}, manager);
    assert(!listResult.isError, 'list_active_charts succeeds');
    assert(listResult.content[0].text.includes('Build a web app'), 'List shows chart outcome');

    // Test 3: get_chart_progress via handler
    const progressResult = await handleToolCall('get_chart_progress', {
      chartId
    }, manager);
    assert(!progressResult.isError, 'get_chart_progress succeeds');

    // Test 4: update_current_reality via handler
    const updateResult = await handleToolCall('update_current_reality', {
      chartId,
      newObservations: ['Started researching frameworks']
    }, manager);
    assert(!updateResult.isError, 'update_current_reality succeeds');

    // Test 5: manage_action_step via handler
    const manageResult = await handleToolCall('manage_action_step', {
      parentReference: chartId,
      actionDescription: 'Choose a tech stack',
      currentReality: 'Evaluating React vs Vue vs Angular'
    }, manager);
    assert(!manageResult.isError, 'manage_action_step succeeds');
    assert(manageResult.content[0].text.includes('managed'), 'manage_action_step response text');

    // Test 6: init_llm_guidance via handler
    const guidanceResult = await handleToolCall('init_llm_guidance', {
      format: 'quick'
    }, manager);
    assert(!guidanceResult.isError, 'init_llm_guidance succeeds');
    assert(guidanceResult.content[0].text.includes('Quick Reference'), 'Guidance text returned');

    // Test 7: Unknown tool
    const unknownResult = await handleToolCall('nonexistent_tool', {}, manager);
    assert(unknownResult.isError === true, 'Unknown tool returns error');

    // Test 8: Validation error
    const validationResult = await handleToolCall('create_structural_tension_chart', {
      desiredOutcome: 'Something',
      // Missing required fields
    }, manager);
    assert(validationResult.isError === true, 'Missing fields returns validation error');

    // Test 9: perform_mmot_evaluation via handler
    const mmotResult = await handleToolCall('perform_mmot_evaluation', {
      chartId,
      phase: 'full'
    }, manager);
    assert(!mmotResult.isError, 'perform_mmot_evaluation succeeds');
    assert(mmotResult.content[0].text.includes('MMOT'), 'MMOT response text');

    // Test 10: create_wampum_belt via handler
    const createWampumResult = await handleToolCall('create_wampum_belt', {
      title: 'Handler Belt',
      purpose: 'Validate non-linear narrative memory',
      rows: 1,
      cols: 2
    }, manager);
    assert(!createWampumResult.isError, 'create_wampum_belt succeeds');
    const parsedBelt = JSON.parse(createWampumResult.content[0].text);

    // Test 11: add_wampum_bead via handler
    const addBeadResult = await handleToolCall('add_wampum_bead', {
      beltId: parsedBelt.beltId,
      mnemonic: 'dawn light',
      color: 'white',
      position: { row: 0, col: 1 },
      reading: 'Beginnings',
      relationalReadings: { right: 'Horizon intention' }
    }, manager);
    assert(!addBeadResult.isError, 'add_wampum_bead succeeds');

    // Test 12: read_wampum_belt via handler
    const readWampumResult = await handleToolCall('read_wampum_belt', {
      beltId: parsedBelt.beltId,
      position: { row: 0, col: 1 }
    }, manager);
    assert(!readWampumResult.isError, 'read_wampum_belt succeeds');
    const parsedRead = JSON.parse(readWampumResult.content[0].text);
    assert(parsedRead.positionalReading === 'Horizon intention', 'read_wampum_belt returns relational positional reading');

    // Test 13: invalid belt dimensions are rejected
    const invalidBeltResult = await handleToolCall('create_wampum_belt', {
      title: 'Invalid Belt',
      purpose: 'Should fail',
      rows: 0,
      cols: 2
    }, manager);
    assert(invalidBeltResult.isError === true, 'create_wampum_belt rejects non-positive dimensions');

    // Test 14: link_chart_to_github_issue via handler
    const issueChartResult = await handleToolCall('create_structural_tension_chart', {
      desiredOutcome: 'Have each chart carry the issue it was written from',
      currentReality: 'Chart provenance lives only in commit messages',
      dueDate: '2026-08-15T00:00:00Z',
      githubIssue: 'avadisabelle/coaia-narrative#50'
    }, manager);
    assert(!issueChartResult.isError, 'create_structural_tension_chart accepts githubIssue');
    const issueChartId = JSON.parse(issueChartResult.content[0].text).chartId;

    const linkResult = await handleToolCall('link_chart_to_github_issue', {
      chartId: issueChartId,
      githubIssue: 'jgwill/Miadi#36'
    }, manager);
    assert(!linkResult.isError, 'link_chart_to_github_issue succeeds');
    assert(JSON.parse(linkResult.content[0].text).issue.owner === 'jgwill', 'link returns parsed issue reference');

    // Test 15: bare #number is rejected at the handler boundary
    let bareRefHandlerThrew = false;
    try {
      await handleToolCall('link_chart_to_github_issue', {
        chartId: issueChartId,
        githubIssue: '#36'
      }, manager);
    } catch {
      bareRefHandlerThrew = true;
    }
    assert(bareRefHandlerThrew, 'link_chart_to_github_issue rejects bare #number');

  } finally {
    try { await fs.unlink(testFile); } catch {}
  }
}

// ==================== Tool Groups Tests ====================

async function testToolGroups() {
  console.log('\n🏷️  Testing Tool Groups...');

  // Test 1: STC_TOOLS includes manage_action_step (THE BUG FIX)
  assert(
    TOOL_GROUPS.STC_TOOLS.includes('manage_action_step'),
    'STC_TOOLS includes manage_action_step (bug fix)'
  );

  // Test 2: STC_TOOLS includes perform_mmot_evaluation
  assert(
    TOOL_GROUPS.STC_TOOLS.includes('perform_mmot_evaluation'),
    'STC_TOOLS includes perform_mmot_evaluation'
  );

  // Test 3: All tool groups exist
  assert(TOOL_GROUPS.STC_TOOLS.length >= 14, 'STC_TOOLS has 14+ tools');
  assert(
    TOOL_GROUPS.STC_TOOLS.includes('link_chart_to_github_issue'),
    'STC_TOOLS includes link_chart_to_github_issue'
  );
  assert(TOOL_GROUPS.NARRATIVE_TOOLS.length === 3, 'NARRATIVE_TOOLS has 3 tools');
  assert(TOOL_GROUPS.WAMPUM_TOOLS.length === 3, 'WAMPUM_TOOLS has 3 tools');
  assert(TOOL_GROUPS.KG_TOOLS.length === 9, 'KG_TOOLS has 9 tools');
  assert(TOOL_GROUPS.CORE_TOOLS.length === 4, 'CORE_TOOLS has 4 tools');

  // Test 4: getEnabledTools with defaults
  const originalEnv = process.env.COAIA_TOOLS;
  process.env.COAIA_TOOLS = 'STC_TOOLS';
  const stcTools = getEnabledTools();
  assert(stcTools.has('manage_action_step'), 'Enabled tools include manage_action_step');
  assert(stcTools.has('create_structural_tension_chart'), 'Enabled tools include create chart');
  assert(!stcTools.has('create_entities'), 'STC_TOOLS excludes KG tools');
  if (originalEnv === undefined) {
    delete process.env.COAIA_TOOLS;
  } else {
    process.env.COAIA_TOOLS = originalEnv;
  }

  // Test 5: Tool definitions count matches
  assert(ALL_TOOL_DEFINITIONS.length >= 21, 'At least 21 tool definitions');

  // Test 6: Every tool in TOOL_GROUPS has a matching definition
  const definedToolNames = new Set(ALL_TOOL_DEFINITIONS.map(t => t.name));
  for (const [groupName, tools] of Object.entries(TOOL_GROUPS)) {
    for (const tool of tools) {
      assert(definedToolNames.has(tool), `${groupName}.${tool} has a definition`);
    }
  }
}

// ==================== MCP Protocol Tests ====================

async function testMcpProtocol() {
  console.log('\n🌐 Testing MCP Protocol...');
  const testFile = join(__dirname, 'test-mcp-protocol.jsonl');

  try {
    try { await fs.unlink(testFile); } catch {}

    return new Promise((resolve) => {
      const server = spawn('node', [serverPath, '--memory-path', testFile], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let buffer = '';
      const responses = {};

      server.stdout.on('data', (data) => {
        buffer += data.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const resp = JSON.parse(line);
              if (resp.id !== undefined) {
                responses[resp.id] = resp;
              }
            } catch {}
          }
        }
      });

      function send(msg) { server.stdin.write(JSON.stringify(msg) + '\n'); }
      function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

      (async () => {
        // Step 1: Initialize
        send({
          jsonrpc: '2.0', id: 1, method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'test', version: '1.0' }
          }
        });
        await delay(1000);

        // Send initialized notification
        send({ jsonrpc: '2.0', method: 'notifications/initialized' });
        await delay(500);

        // Test 1: Initialize response
        assert(
          responses[1]?.result?.serverInfo?.name === 'coaia-narrative',
          'MCP initialize returns correct server name'
        );
        assert(
          responses[1]?.result?.serverInfo?.version === PACKAGE_VERSION,
          `MCP initialize returns version ${PACKAGE_VERSION}`
        );

        // Step 2: Tools list
        send({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
        await delay(500);

        if (responses[2]?.result?.tools) {
          const toolNames = responses[2].result.tools.map(t => t.name);
          assert(toolNames.includes('manage_action_step'), 'tools/list includes manage_action_step');
          assert(toolNames.includes('perform_mmot_evaluation'), 'tools/list includes perform_mmot_evaluation');
          assert(toolNames.includes('list_active_charts'), 'tools/list includes list_active_charts');
          assert(toolNames.length >= 15, `tools/list has 15+ tools (got ${toolNames.length})`);
        } else {
          assert(false, 'tools/list response received');
        }

        // Step 3: Create chart
        send({
          jsonrpc: '2.0', id: 3, method: 'tools/call',
          params: {
            name: 'create_structural_tension_chart',
            arguments: {
              desiredOutcome: 'MCP test chart',
              currentReality: 'Running integration tests',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }
          }
        });
        await delay(500);

        if (responses[3]?.result?.content) {
          assert(!responses[3].result.isError, 'Chart creation via MCP succeeds');
        } else {
          assert(false, 'Chart creation response received');
        }

        // Step 4: List active charts
        send({
          jsonrpc: '2.0', id: 4, method: 'tools/call',
          params: { name: 'list_active_charts', arguments: {} }
        });
        await delay(500);

        if (responses[4]?.result?.content) {
          assert(
            responses[4].result.content[0].text.includes('MCP test chart'),
            'list_active_charts via MCP shows created chart'
          );
        } else {
          assert(false, 'list_active_charts response received');
        }

        server.stdin.end();
        await delay(200);
        try { process.kill(server.pid, 'SIGTERM'); } catch {}
        resolve();
      })();
    });
  } finally {
    try { await fs.unlink(testFile); } catch {}
  }
}

// ==================== Run All Tests ====================

async function runTests() {
  console.log(`🚀 COAIA Narrative v${PACKAGE_VERSION} - Integration Tests\n`);
  console.log('Testing modular architecture: types → graph-manager → tool-handlers → MCP server');

  await testToolGroups();
  await testGithubBridgeHelpers();
  await testGraphManager();
  await testToolHandlers();
  await testMcpProtocol();

  console.log('\n' + '═'.repeat(60));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  if (failures.length > 0) {
    console.log('\n❌ Failures:');
    failures.forEach(f => console.log(`   - ${f}`));
  }
  console.log('');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
