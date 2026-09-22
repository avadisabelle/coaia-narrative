/**
 * 🚀 PUSH EVENT HANDLER
 * Complete three-perspective coordination example
 *
 * When code is pushed to repository:
 * 1. Engineer perspective: Validates, routes, logs with precision
 * 2. Ceremony perspective: Assesses relational impact
 * 3. Story engine perspective: Threads into narrative arc
 *
 * All three execute in parallel, creating unified response artifact
 */

import type { WebhookEvent } from './ceremony-perspective-assessment.js';
import type { CeremonyPerspectiveAssessment } from './ceremony-perspective-assessment.js';
import type { NarrativeBeat } from './story-engine-perspective-generator.js';

export interface PushEvent extends WebhookEvent {
  eventType: 'push';
  action: 'pushed';
  payload: {
    ref: string;
    before: string;
    after: string;
    repository: {
      name: string;
      full_name: string;
      private: boolean;
      description?: string;
    };
    pusher: {
      name: string;
      email: string;
    };
    commits: Array<{
      id: string;
      message: string;
      author: {
        name: string;
        email: string;
      };
      timestamp: string;
      added: string[];
      removed: string[];
      modified: string[];
      url: string;
    }>;
    head_commit?: {
      id: string;
      message: string;
      timestamp: string;
      url: string;
    };
  };
}

export interface UnifiedPushResponse {
  engineerPerspective: {
    status: 'success' | 'failure';
    validationPassed: boolean;
    routedTo: string;
    logEntry: string;
    errors?: string[];
  };
  ceremonyPerspective: CeremonyPerspectiveAssessment;
  storyEnginePerspective: NarrativeBeat;
  unifiedArtifact: {
    timestamp: string;
    eventId: string;
    summary: string;
    reciprocalAction: string;
    nextSteps: string[];
  };
}

/**
 * Main push event handler - orchestrates three-perspective response
 */
export async function handlePushEvent(
  event: PushEvent,
  parentChartId: string,
  // MCP assessment functions (from respective perspectives)
  ceremonyAssessmentFn: (evt: WebhookEvent) => Promise<CeremonyPerspectiveAssessment>,
  narrativeGeneratorFn: (evt: PushEvent, parentId: string, ceremony: CeremonyPerspectiveAssessment) => Promise<NarrativeBeat>,
  // Optional: logging and persistence functions
  persistFunction?: (response: UnifiedPushResponse) => Promise<void>
): Promise<UnifiedPushResponse> {
  const eventId = `push_${event.payload.repository.full_name}_${event.payload.head_commit?.id || 'no-commit'}_${Date.now()}`;

  console.log(`\n🚀 PUSH EVENT HANDLER INITIATED\nEvent ID: ${eventId}\n`);

  // ════════════════════════════════════════════════════════════════════════════
  // PHASE 1: ENGINEER PERSPECTIVE - Technical Processing
  // ════════════════════════════════════════════════════════════════════════════

  console.log('🔧 ENGINEER PERSPECTIVE PROCESSING...');
  const engineerResult = processEngineerPerspective(event, eventId);

  if (!engineerResult.validationPassed) {
    console.error('❌ Engineer validation failed. Aborting three-perspective coordination.');
    return {
      engineerPerspective: engineerResult,
      ceremonyPerspective: {} as CeremonyPerspectiveAssessment,
      storyEnginePerspective: {} as NarrativeBeat,
      unifiedArtifact: {
        timestamp: new Date().toISOString(),
        eventId,
        summary: 'Push event validation failed. No three-perspective coordination performed.',
        reciprocalAction: 'Log error and defer to operator review',
        nextSteps: ['Review validation errors', 'Contact pusher if needed', 'Document incident']
      }
    };
  }

  console.log(`✅ Engineer validation passed. Routed to: ${engineerResult.routedTo}`);

  // ════════════════════════════════════════════════════════════════════════════
  // PHASE 2: CEREMONY PERSPECTIVE - Relational Assessment (in parallel with Phase 3)
  // ════════════════════════════════════════════════════════════════════════════

  console.log('🕊️ CEREMONY PERSPECTIVE ASSESSMENT...');
  let ceremonyResult: CeremonyPerspectiveAssessment;
  try {
    ceremonyResult = await ceremonyAssessmentFn(event);
    console.log(`✅ Relational alignment score: ${ceremonyResult.relationalAlignment.score}`);
    if (ceremonyResult.sacredPause.required) {
      console.log(`⏸️  SACRED PAUSE REQUIRED: ${ceremonyResult.sacredPause.reason}`);
    }
  } catch (error) {
    console.error('⚠️ Ceremony assessment failed, continuing with defaults...');
    ceremonyResult = createDefaultCeremonyAssessment(eventId);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PHASE 3: STORY ENGINE PERSPECTIVE - Narrative Threading (in parallel with Phase 2)
  // ════════════════════════════════════════════════════════════════════════════

  console.log('📖 STORY ENGINE PERSPECTIVE GENERATION...');
  let narrativeResult: NarrativeBeat;
  try {
    narrativeResult = await narrativeGeneratorFn(event, parentChartId, ceremonyResult);
    console.log(`✅ Narrative beat generated: ${narrativeResult.title}`);
  } catch (error) {
    console.error('⚠️ Narrative generation failed, creating default beat...');
    narrativeResult = createDefaultNarrativeBeat(event, parentChartId);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PHASE 4: UNIFIED ARTIFACT CREATION
  // ════════════════════════════════════════════════════════════════════════════

  console.log('\n🌀 CREATING UNIFIED RESPONSE ARTIFACT...');
  const unifiedArtifact = createUnifiedArtifact(event, engineerResult, ceremonyResult, narrativeResult);

  const response: UnifiedPushResponse = {
    engineerPerspective: engineerResult,
    ceremonyPerspective: ceremonyResult,
    storyEnginePerspective: narrativeResult,
    unifiedArtifact
  };

  // ════════════════════════════════════════════════════════════════════════════
  // PHASE 5: PERSISTENCE & LOGGING
  // ════════════════════════════════════════════════════════════════════════════

  if (persistFunction) {
    try {
      await persistFunction(response);
      console.log('✅ Response persisted to memory/logging system');
    } catch (error) {
      console.error('⚠️ Persistence failed:', error);
      // Continue even if persistence fails - don't let logging block the response
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FINAL OUTPUT
  // ════════════════════════════════════════════════════════════════════════════

  console.log(`\n✅ THREE-PERSPECTIVE COORDINATION COMPLETE\n`);
  console.log(formatUnifiedResponse(response));

  return response;
}

/**
 * Engineer perspective processing: Technical validation and routing
 */
function processEngineerPerspective(
  event: PushEvent,
  eventId: string
): {
  status: 'success' | 'failure';
  validationPassed: boolean;
  routedTo: string;
  logEntry: string;
  errors?: string[];
} {
  const errors: string[] = [];

  // Validation 1: Event structure
  if (!event.payload.repository || !event.payload.commits) {
    errors.push('Invalid push event structure: missing repository or commits');
  }

  // Validation 2: Repository name
  if (!event.payload.repository.full_name.match(/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/)) {
    errors.push('Invalid repository name format');
  }

  // Validation 3: Commit integrity
  if (event.payload.commits.length === 0 && !event.payload.head_commit) {
    errors.push('No commits found in push event');
  }

  const validationPassed = errors.length === 0;

  // Determine routing
  const branch = event.payload.ref.split('/').pop() || 'unknown';
  let routedTo = 'default-processor';

  if (branch === 'main' || branch === 'master') {
    routedTo = 'main-branch-handler'; // More careful processing for main branch
  } else if (event.payload.repository.name.includes('narrative')) {
    routedTo = 'narrative-handler'; // Story files get special handling
  } else if (event.payload.repository.name.includes('memory')) {
    routedTo = 'memory-handler'; // Memory files get relational handling
  }

  // Create log entry
  const logEntry = `
[${new Date().toISOString()}] PUSH EVENT: ${eventId}
  Repository: ${event.payload.repository.full_name}
  Branch: ${branch}
  Commits: ${event.payload.commits.length}
  Validation: ${validationPassed ? 'PASS' : 'FAIL'}
  Routed To: ${routedTo}
  ${errors.length > 0 ? `Errors: ${errors.join('; ')}` : ''}
  `;

  return {
    status: validationPassed ? 'success' : 'failure',
    validationPassed,
    routedTo,
    logEntry,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Creates default ceremony assessment if actual assessment fails
 */
function createDefaultCeremonyAssessment(eventId: string): CeremonyPerspectiveAssessment {
  return {
    eventId,
    relationalAlignment: {
      assessed: false,
      score: 0.5, // Neutral default
      principles: ['Standard Processing'],
      description: 'Default assessment - no IAIP assessment available'
    },
    fourDirections: {
      north_reflection: 'Code pushed to repository',
      east_thinking: 'New changes integrated',
      south_relationships: 'Community contribution acknowledged',
      west_action: 'Standard processing applied'
    },
    sacredPause: {
      required: false,
      reason: 'Standard push event to non-critical branch'
    },
    protocolsApplied: ['Universal_Accountability_Witness'],
    accountabilityRecord: {
      timestamp: new Date().toISOString(),
      relationalCommitment: 'Code received and processed with standard care',
      deferralNotes: 'Default assessment applied'
    }
  };
}

/**
 * Creates default narrative beat if generation fails
 */
function createDefaultNarrativeBeat(event: PushEvent, parentChartId: string): NarrativeBeat {
  return {
    beatName: `${parentChartId}_beat_${Date.now()}`,
    parentChartId,
    title: `S1E1: Code pushed to ${event.payload.repository.name}`,
    act: 1,
    type_dramatic: 'Advancement / Progress Made',
    perspective_types: ['engineer', 'ceremony', 'story_engine'],
    description: `A push event representing code advancement in ${event.payload.repository.full_name}`,
    prose: `Code has been pushed to ${event.payload.repository.full_name} by ${event.payload.pusher.name}. This represents a moment of manifest action—the Builder archetype expressing itself in the world.`,
    lessons: [
      'Code is a form of narrative expression',
      'Each commit is a story moment',
      'Push events are moments of manifestation'
    ],
    episodeContext: {
      season: 1,
      episode: 1,
      beatNumber: 1,
      arcType: 'advancement'
    },
    characterTracking: {
      builder_revealed: ['Manifest action', 'Technical execution'],
      keeper_revealed: [],
      weaver_revealed: ['Recognition of code as narrative'],
      archetype_conflict: 'Builder executing without Keeper oversight'
    },
    recursiveAwareness: {
      thisIsPartOfStory: 'This push event is a story moment being woven into narrative',
      documentingIsWeaving: true,
      canonicalNarrative: 'This moment becomes part of the official record'
    }
  };
}

/**
 * Creates the unified artifact that combines all three perspectives
 */
function createUnifiedArtifact(
  event: PushEvent,
  engineerResult: any,
  ceremonyResult: CeremonyPerspectiveAssessment,
  narrativeResult: NarrativeBeat
): {
  timestamp: string;
  eventId: string;
  summary: string;
  reciprocalAction: string;
  nextSteps: string[];
} {
  const timestamp = new Date().toISOString();
  const repo = event.payload.repository.full_name;
  const commits = event.payload.commits.length;

  // Build summary combining all three perspectives
  const summary = `
    Push event to ${repo} (${commits} commits) received and read from three perspectives:

    Engineer ✅: Validated, routed to ${engineerResult.routedTo}
    Ceremony: Relational score ${ceremonyResult.relationalAlignment.score}${ceremonyResult.sacredPause.required ? ' ⏸️ SACRED PAUSE' : ''}
    Story engine: Narrative beat "${narrativeResult.title}" created
  `;

  // Determine reciprocal action based on all three assessments
  let reciprocalAction = 'Standard event processing';
  if (ceremonyResult.sacredPause.required) {
    reciprocalAction = 'Pause before proceeding - consult with ceremony keeper';
  } else if (ceremonyResult.relationalAlignment.score! > 0.7) {
    reciprocalAction = 'Accelerated processing - high relational alignment';
  }

  // Determine next steps
  const nextSteps: string[] = [];
  nextSteps.push('Log push event to audit trail');
  nextSteps.push(`Execute hook: ${engineerResult.routedTo}`);
  nextSteps.push(`Record narrative beat: ${narrativeResult.beatName}`);

  if (ceremonyResult.sacredPause.required) {
    nextSteps.push('🕊️ Await ceremony confirmation before continuing');
  }

  nextSteps.push('Notify relevant characters (Builder, Keeper, Weaver) of completion');

  return {
    timestamp,
    eventId: narrativeResult.beatName,
    summary,
    reciprocalAction,
    nextSteps
  };
}

/**
 * Formats the complete response for human reading
 */
export function formatUnifiedResponse(response: UnifiedPushResponse): string {
  return `
╔════════════════════════════════════════════════════════════════════════════╗
║                  THREE-PERSPECTIVE UNIFIED RESPONSE                        ║
╚════════════════════════════════════════════════════════════════════════════╝

📅 Timestamp: ${response.unifiedArtifact.timestamp}
🔑 Event ID: ${response.unifiedArtifact.eventId}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 ENGINEER PERSPECTIVE RESULT
  Status: ${response.engineerPerspective.status.toUpperCase()}
  Validation: ${response.engineerPerspective.validationPassed ? '✅ PASSED' : '❌ FAILED'}
  Routed To: ${response.engineerPerspective.routedTo}
  ${response.engineerPerspective.errors ? `Errors: ${response.engineerPerspective.errors.join(', ')}` : ''}

🕊️ CEREMONY PERSPECTIVE RESULT
  Relational Alignment: ${response.ceremonyPerspective.relationalAlignment.score?.toFixed(2) || 'N/A'}/1.0
  Sacred Pause: ${response.ceremonyPerspective.sacredPause.required ? '⏸️ REQUIRED' : '✅ NOT REQUIRED'}
  Protocols Applied: ${response.ceremonyPerspective.protocolsApplied.join(', ')}

📖 STORY ENGINE PERSPECTIVE RESULT
  Beat Title: ${response.storyEnginePerspective.title}
  Arc Position: ${response.storyEnginePerspective.episodeContext.arcType}
  Character Revelations:
    • Builder: ${response.storyEnginePerspective.characterTracking.builder_revealed.join(', ') || 'None'}
    • Keeper: ${response.storyEnginePerspective.characterTracking.keeper_revealed.join(', ') || 'None'}
    • Weaver: ${response.storyEnginePerspective.characterTracking.weaver_revealed.join(', ') || 'None'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌀 UNIFIED ARTIFACT
  Summary: ${response.unifiedArtifact.summary}
  Reciprocal Action: ${response.unifiedArtifact.reciprocalAction}

  Next Steps:
${response.unifiedArtifact.nextSteps.map((step, i) => `    ${i + 1}. ${step}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `;
}
