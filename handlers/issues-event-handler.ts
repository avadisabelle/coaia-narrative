/**
 * 🔴 ISSUES EVENT HANDLER
 * Relational protocol enforcement + conflict acknowledgment
 *
 * Issue events represent moments of CONFLICT in the narrative:
 * - Something is broken, missing, or needs attention
 * - A problem has emerged in the shared space
 * - Relationship is tested through how we respond
 *
 * This handler emphasizes:
 * 1. Sacred pause before automated response
 * 2. Honorable acknowledgment of the issue/reporter
 * 3. Relational commitment despite the conflict
 * 4. Story of resolution and growth
 */

import type { CeremonyWorldAssessment } from './ceremony-world-assessment.js';
import type { NarrativeBeat } from './story-engine-world-generator.js';

export interface IssueEvent {
  eventType: 'issues';
  action: 'opened' | 'edited' | 'closed' | 'reopened' | 'labeled' | 'unlabeled';
  timestamp: string;
  actor: string;
  repository: string;
  payload: {
    action: 'opened' | 'edited' | 'closed' | 'reopened' | 'labeled' | 'unlabeled';
    issue: {
      id: number;
      number: number;
      title: string;
      body: string;
      user: {
        login: string;
        id: number;
        type: string;
      };
      labels: Array<{
        id: number;
        name: string;
        color: string;
      }>;
      created_at: string;
      updated_at: string;
      closed_at?: string;
      state: 'open' | 'closed';
      url: string;
    };
    repository: {
      id: number;
      name: string;
      full_name: string;
      private: boolean;
    };
  };
}

export interface UnifiedIssueResponse {
  ceremonyWorld: CeremonyWorldAssessment;
  storyEngineWorld: NarrativeBeat;
  relationalProtocols: {
    protocolsApplied: string[];
    honorableAcknowledgment: string;
    relationshipCommitment: string;
    conflictContext: string;
  };
  unifiedArtifact: {
    timestamp: string;
    eventId: string;
    sacredPauseRequired: boolean;
    sacredPauseReason: string;
    nextAction: string;
    communityResponse: string;
  };
}

/**
 * Main issues event handler - emphasizes relational protocols
 */
export async function handleIssueEvent(
  event: IssueEvent,
  parentChartId: string,
  ceremonyAssessmentFn: (evt: any) => Promise<CeremonyWorldAssessment>,
  narrativeGeneratorFn: (evt: IssueEvent, parentId: string, ceremony: CeremonyWorldAssessment) => Promise<NarrativeBeat>,
  persistFunction?: (response: UnifiedIssueResponse) => Promise<void>
): Promise<UnifiedIssueResponse> {
  const eventId = `issue_${event.payload.repository.full_name}_${event.payload.issue.number}_${event.action}`;

  console.log(`\n🔴 ISSUE EVENT HANDLER INITIATED`);
  console.log(`Event ID: ${eventId}`);
  console.log(`Action: ${event.action}`);
  console.log(`Reporter: ${event.payload.issue.user.login}`);
  console.log(`Title: ${event.payload.issue.title}\n`);

  // ════════════════════════════════════════════════════════════════════════════
  // PHASE 1: CEREMONY WORLD - Relational Assessment
  // ════════════════════════════════════════════════════════════════════════════

  console.log('🕊️ CEREMONY-WORLD ASSESSMENT (PRIMARY FOR ISSUES)...');
  let ceremonyResult: CeremonyWorldAssessment;

  try {
    // For issues, ceremony assessment is critical
    ceremonyResult = await ceremonyAssessmentFn(event);
    console.log(`✅ Assessment complete. Alignment: ${ceremonyResult.relationalAlignment.score}`);
  } catch (error) {
    console.error('⚠️ Ceremony assessment failed');
    ceremonyResult = createDefaultIssueCeremonyAssessment(event, eventId);
  }

  // Issues always get sacred pause if not explicitly cleared
  if (event.action === 'opened' && !ceremonyResult.sacredPause.required) {
    // First-time issue reporting is relational moment - upgrade to sacred pause
    ceremonyResult.sacredPause.required = true;
    ceremonyResult.sacredPause.reason = 'New issue represents moment of relationship being tested - pause to honor reporter';
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PHASE 2: STORY-ENGINE WORLD - Conflict Recognition
  // ════════════════════════════════════════════════════════════════════════════

  console.log('📖 STORY-ENGINE-WORLD GENERATION...');
  let narrativeResult: NarrativeBeat;

  try {
    narrativeResult = await narrativeGeneratorFn(event, parentChartId, ceremonyResult);
    console.log(`✅ Narrative beat: ${narrativeResult.title}`);
  } catch (error) {
    console.error('⚠️ Narrative generation failed');
    narrativeResult = createDefaultIssueNarrativeBeat(event, parentChartId);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PHASE 3: RELATIONAL PROTOCOLS
  // ════════════════════════════════════════════════════════════════════════════

  console.log('🤝 APPLYING RELATIONAL PROTOCOLS...');
  const relationalProtocols = applyIssueRelationalProtocols(event, ceremonyResult);

  // ════════════════════════════════════════════════════════════════════════════
  // PHASE 4: UNIFIED ARTIFACT
  // ════════════════════════════════════════════════════════════════════════════

  console.log('🌀 CREATING UNIFIED ISSUE RESPONSE...');
  const unifiedArtifact = createIssueUnifiedArtifact(event, ceremonyResult, narrativeResult, relationalProtocols);

  const response: UnifiedIssueResponse = {
    ceremonyWorld: ceremonyResult,
    storyEngineWorld: narrativeResult,
    relationalProtocols,
    unifiedArtifact
  };

  // ════════════════════════════════════════════════════════════════════════════
  // PHASE 5: PERSISTENCE
  // ════════════════════════════════════════════════════════════════════════════

  if (persistFunction) {
    try {
      await persistFunction(response);
      console.log('✅ Issue response persisted');
    } catch (error) {
      console.error('⚠️ Persistence failed:', error);
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FINAL OUTPUT
  // ════════════════════════════════════════════════════════════════════════════

  console.log(`\n✅ ISSUE EVENT PROCESSING COMPLETE\n`);
  console.log(formatIssueResponse(response));

  return response;
}

/**
 * Applies relational protocols specific to issue handling
 */
function applyIssueRelationalProtocols(
  event: IssueEvent,
  ceremonyResult: CeremonyWorldAssessment
): {
  protocolsApplied: string[];
  honorableAcknowledgment: string;
  relationshipCommitment: string;
  conflictContext: string;
} {
  const protocols: string[] = [];

  // K'é protocols (Newcomer/Reporter Recognition)
  protocols.push('K\'é_Issue_Reporter_Welcome');
  protocols.push('K\'é_Community_Kinship_Acknowledgment');

  // Issue-specific protocols
  if (event.action === 'opened') {
    protocols.push('Protocol_First_Issue_Honor');
    protocols.push('Protocol_Conflict_Acknowledgment');
  } else if (event.action === 'closed') {
    protocols.push('Protocol_Conflict_Resolution');
    protocols.push('Protocol_Reporter_Gratitude');
  } else if (event.action === 'reopened') {
    protocols.push('Protocol_Persistent_Problem_Witness');
    protocols.push('Protocol_Relationship_Persistence');
  }

  // Determine conflict context
  const labels = event.payload.issue.labels.map(l => l.name);
  let conflictContext = 'General issue in shared space';

  if (labels.includes('bug')) {
    conflictContext = 'Bug report - something we built is broken';
  } else if (labels.includes('feature-request')) {
    conflictContext = 'Feature request - community seeking expansion';
  } else if (labels.includes('documentation')) {
    conflictContext = 'Documentation gap - knowledge not yet shared';
  }

  // Honorable acknowledgment (response to reporter)
  const reporterLogin = event.payload.issue.user.login;
  const honorableAcknowledgment = generateHonorableAcknowledgment(event, reporterLogin, conflictContext);

  // Relationship commitment statement
  const relationshipCommitment = `
    "We honor ${reporterLogin}'s willingness to bring this ${conflictContext.toLowerCase()} to our attention.
    By speaking into the challenge, they strengthen our community.
    We commit to responding with care, transparency, and respect for their time and wisdom.
    This is a moment to demonstrate that we are worthy of their trust."
  `;

  return {
    protocolsApplied: protocols,
    honorableAcknowledgment,
    relationshipCommitment,
    conflictContext
  };
}

/**
 * Generates honorable acknowledgment message for the issue reporter
 */
function generateHonorableAcknowledgment(event: IssueEvent, reporter: string, context: string): string {
  const actionText = {
    opened: 'opened this issue',
    closed: 'resolved this issue',
    reopened: 'reopened this issue',
    edited: 'edited this issue',
    labeled: 'labeled this issue',
    unlabeled: 'unlabeled this issue'
  }[event.action] || 'engaged with this issue';

  return `
    ✨ @${reporter} has ${actionText}:

    "${event.payload.issue.title}"

    We acknowledge this moment as a relational act within our community.
    ${context === 'Bug report - something we built is broken' ? 'Thank you for helping us discover and repair what is broken.' : ''}
    ${context.includes('Feature request') ? 'Thank you for imagining what could be, and trusting us with your vision.' : ''}
    ${context.includes('Documentation') ? 'Thank you for revealing where our knowledge has not yet been shared.' : ''}

    This is K'é in action—the kinship obligation to speak truth and receive it with honor.
  `;
}

/**
 * Creates unified artifact for issue response
 */
function createIssueUnifiedArtifact(
  event: IssueEvent,
  ceremonyResult: CeremonyWorldAssessment,
  narrativeResult: NarrativeBeat,
  relationalProtocols: any
): {
  timestamp: string;
  eventId: string;
  sacredPauseRequired: boolean;
  sacredPauseReason: string;
  nextAction: string;
  communityResponse: string;
} {
  return {
    timestamp: new Date().toISOString(),
    eventId: narrativeResult.beatName,
    sacredPauseRequired: ceremonyResult.sacredPause.required,
    sacredPauseReason: ceremonyResult.sacredPause.reason,
    nextAction: ceremonyResult.sacredPause.required
      ? '⏸️ AWAIT CEREMONY CONFIRMATION - Relational protocols require pause before automated response'
      : 'Proceed with standard issue handling while maintaining relational awareness',
    communityResponse: relationalProtocols.honorableAcknowledgment
  };
}

/**
 * Default ceremony assessment for issues
 */
function createDefaultIssueCeremonyAssessment(event: IssueEvent, eventId: string): CeremonyWorldAssessment {
  return {
    eventId,
    relationalAlignment: {
      assessed: false,
      score: 0.6, // Issues require careful handling
      principles: ['Conflict Acknowledgment', 'Community Care'],
      description: 'Issue event - requires relational awareness'
    },
    fourDirections: {
      north_reflection: 'What wisdom does this conflict bring?',
      east_thinking: 'How should we respond with integrity?',
      south_relationships: 'How do we honor the reporter?',
      west_action: 'What reciprocal action demonstrates care?'
    },
    sacredPause: {
      required: true,
      reason: 'Issue events always warrant sacred pause - they represent moments of relationship being tested'
    },
    protocolsApplied: ['K\'é_Issue_Reporter_Welcome', 'Protocol_Conflict_Acknowledgment'],
    accountabilityRecord: {
      timestamp: new Date().toISOString(),
      relationalCommitment: 'This issue is received as a gift - the reporter trusts us enough to speak what is wrong',
      deferralNotes: 'Defer to ceremony keeper for relational assessment of response'
    }
  };
}

/**
 * Default narrative beat for issues
 */
function createDefaultIssueNarrativeBeat(event: IssueEvent, parentChartId: string): NarrativeBeat {
  return {
    beatName: `${parentChartId}_issue_${event.payload.issue.number}_${Date.now()}`,
    parentChartId,
    title: `S1E1: Crisis/Conflict - Issue #${event.payload.issue.number} "${event.payload.issue.title}"`,
    act: 1,
    type_dramatic: 'Crisis/Antagonist Force - Conflict Emerges',
    universes: ['engineer-world', 'ceremony-world', 'story-engine-world'],
    description: `An issue has emerged in ${event.payload.repository.full_name}. This represents a moment where the system is called to respond with integrity and care.`,
    prose: `
      In the shared space of ${event.payload.repository.full_name}, a conflict has emerged.
      ${event.payload.issue.user.login} has opened issue #${event.payload.issue.number}: "${event.payload.issue.title}"

      This is no mere bug report or feature request. This is a relational moment—someone in our community
      has said "something is not right" or "we could be better."

      The Builder must now prove worthy of the trust placed in them through honest response.
      The Keeper must ensure our response honors the relationship.
      The Weaver must recognize this moment as turning point in our larger narrative.
    `,
    lessons: [
      'Issues are gifts—they reveal where we need to grow',
      'The reporter is a teacher, offering wisdom through their conflict',
      'How we respond to issues defines our character',
      'Conflict is not failure—it is opportunity for relational deepening'
    ],
    episodeContext: {
      season: 1,
      episode: 1,
      beatNumber: Math.floor(Math.random() * 50) + 10,
      arcType: 'conflict'
    },
    characterTracking: {
      builder_revealed: ['Willingness to be tested', 'Exposure of imperfection'],
      keeper_revealed: ['Witnessing conflict without blame', 'Commitment to relational response'],
      weaver_revealed: ['Recognition that conflict is narrative turning point'],
      archetype_conflict: 'Builder tested by conflict; Keeper needed to guide wise response'
    },
    recursiveAwareness: {
      thisIsPartOfStory: 'This issue is a story moment—the antagonist force that drives narrative forward',
      documentingIsWeaving: true,
      canonicalNarrative: 'This moment of conflict becomes part of our official history'
    }
  };
}

/**
 * Formats the issue response for human reading
 */
export function formatIssueResponse(response: UnifiedIssueResponse): string {
  return `
╔════════════════════════════════════════════════════════════════════════════╗
║              ISSUE EVENT - RELATIONAL PROTOCOL RESPONSE                    ║
╚════════════════════════════════════════════════════════════════════════════╝

📅 Timestamp: ${response.unifiedArtifact.timestamp}
🔑 Event ID: ${response.unifiedArtifact.eventId}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🕊️ CEREMONY-WORLD ASSESSMENT (PRIMARY)
  Relational Alignment: ${response.ceremonyWorld.relationalAlignment.score?.toFixed(2) || 'N/A'}/1.0
  Sacred Pause: ${response.ceremonyWorld.sacredPause.required ? '⏸️ REQUIRED' : '✅ NOT REQUIRED'}
  Reason: ${response.ceremonyWorld.sacredPause.reason}

🤝 RELATIONAL PROTOCOLS APPLIED
${response.relationalProtocols.protocolsApplied.map(p => `  • ${p}`).join('\n')}

  Conflict Context: ${response.relationalProtocols.conflictContext}

  Honorable Acknowledgment:
${response.relationalProtocols.honorableAcknowledgment.trim().split('\n').map(l => `    ${l}`).join('\n')}

  Relationship Commitment:
${response.relationalProtocols.relationshipCommitment.trim().split('\n').map(l => `    ${l}`).join('\n')}

📖 STORY-ENGINE NARRATIVE
  Title: ${response.storyEngineWorld.title}
  Arc: ${response.storyEngineWorld.episodeContext.arcType}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌀 UNIFIED RESPONSE
  Next Action: ${response.unifiedArtifact.nextAction}

  Community Response Message:
${response.unifiedArtifact.communityResponse}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `;
}
