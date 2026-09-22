/**
 * 🕊️ CEREMONY PERSPECTIVE ASSESSMENT HANDLER
 *
 * Evaluates webhook events through relational checks
 * Integrates IAIP-MCP for assess_relational_alignment & get_direction_guidance
 *
 * Checks: relationship, proportion, coherence
 */

interface WebhookEvent {
  eventType: string;
  timestamp: string;
  actor: string;
  repository: string;
  payload: Record<string, unknown>;
  [key: string]: unknown;
}

interface CeremonyPerspectiveAssessment {
  eventId: string;
  relationalAlignment: {
    assessed: boolean;
    score: number | null;
    principles: string[];
    description: string;
  };
  fourDirections: {
    north_reflection: string; // What wisdom does this offer?
    east_thinking: string;    // What new intention?
    south_relationships: string; // What connections to honor?
    west_action: string;      // What reciprocal response?
  };
  sacredPause: {
    required: boolean;
    reason: string;
  };
  protocolsApplied: string[];
  accountabilityRecord: {
    timestamp: string;
    relationalCommitment: string;
    deferralNotes: string;
  };
}

/**
 * Main assessment function - evaluates event from the ceremony perspective
 *
 * @param event - GitHub webhook event
 * @param assessRelationalAlignmentFn - IAIP-MCP assess_relational_alignment function
 * @param getDirectionGuidanceFn - IAIP-MCP get_direction_guidance function
 * @returns CeremonyPerspectiveAssessment with relational protocols applied
 */
export async function assessCeremonyPerspective(
  event: WebhookEvent,
  assessRelationalAlignmentFn: (description: string) => Promise<{ score: number; principles: string[]; analysis: string }>,
  getDirectionGuidanceFn: (direction: string, inquiry: string) => Promise<{ guidance: string; teachings: string[]; practices: string[] }>
): Promise<CeremonyPerspectiveAssessment> {
  const eventId = `${event.eventType}_${event.timestamp}_${event.actor}`;

  // Step 1: Assess relational alignment using IAIP-MCP
  const relationalProjectDescription = `
    GitHub webhook event received:
    - Type: ${event.eventType}
    - Actor: ${event.actor}
    - Repository: ${event.repository}
    - Context: ${event.eventType === 'issues' ? 'Issue created or modified' : event.eventType === 'push' ? 'Code pushed to repository' : 'Event processed'}

    This event triggers an automated response. How well does this honor:
    - Relationship: Are we honoring connections with the developer and community?
    - Proportion: Is the response balanced and proportionate?
    - Coherence: Does this action create coherence or disruption?
  `;

  let relationalAlignment = {
    assessed: false,
    score: null as number | null,
    principles: [] as string[],
    description: "Relational assessment pending"
  };

  try {
    const relationalResult = await assessRelationalAlignmentFn(relationalProjectDescription);
    relationalAlignment = {
      assessed: true,
      score: relationalResult.score,
      principles: relationalResult.principles,
      description: relationalResult.analysis
    };
  } catch (error) {
    relationalAlignment.description = `Assessment attempted but encountered: ${error instanceof Error ? error.message : 'unknown error'}`;
  }

  // Step 2: Get directional guidance on the response
  const fourDirectionsInquiry = `
    We have received a ${event.eventType} event from ${event.actor} in ${event.repository}.
    How should we respond with wisdom from all four directions?
  `;

  let fourDirections = {
    north_reflection: "Seeking wisdom on this event",
    east_thinking: "Seeking new intention",
    south_relationships: "Seeking relational guidance",
    west_action: "Seeking reciprocal action"
  };

  try {
    // Get guidance from each direction
    const directions = ['north', 'east', 'south', 'west'];
    const directionMap: Record<string, keyof typeof fourDirections> = {
      north: 'north_reflection',
      east: 'east_thinking',
      south: 'south_relationships',
      west: 'west_action'
    };

    for (const direction of directions) {
      try {
        const directionResult = await getDirectionGuidanceFn(direction, fourDirectionsInquiry);
        const key = directionMap[direction];
        fourDirections[key] = directionResult.guidance || `${direction}: ${directionResult.teachings.join('; ')}`;
      } catch (dirError) {
        // Graceful degradation - continue with other directions
        const key = directionMap[direction];
        fourDirections[key] = `${direction}: Assessment deferred`;
      }
    }
  } catch (error) {
    // If four directions fails entirely, continue with other assessments
  }

  // Step 3: Determine if sacred pause is required
  const sacredPause = {
    required: determineSacredPause(event, relationalAlignment.score),
    reason: generateSacredPauseReason(event, relationalAlignment.score)
  };

  // Step 4: Apply relevant protocols
  const protocolsApplied = selectProtocols(event.eventType, relationalAlignment.principles);

  // Step 5: Create accountability record (deferral to the engineer and story_engine perspectives)
  const accountabilityRecord = {
    timestamp: new Date().toISOString(),
    relationalCommitment: `
      "I honor this ${event.eventType} event as sacred information requiring full relational attention.
      I assess its impact on relationship, proportion and coherence.
      I defer technical execution to the engineer perspective with this relational context.
      I await the story_engine perspective's narrative integration of this moment."
    `,
    deferralNotes: `
      Engineer perspective: Execute with technical precision. The relational score of ${relationalAlignment.score}
      indicates the need for ${sacredPause.required ? 'ceremonial acknowledgment before proceeding' : 'standard processing'}.
      Story engine perspective: This moment carries ${relationalAlignment.principles.length} relational principles.
      Thread this into our narrative arc with care for the relationships it honors.
    `
  };

  return {
    eventId,
    relationalAlignment,
    fourDirections,
    sacredPause,
    protocolsApplied,
    accountabilityRecord
  };
}

/**
 * Determines if a sacred pause is needed before proceeding
 * Sacred pause = moment to reflect before automated action
 */
function determineSacredPause(event: WebhookEvent, alignmentScore: number | null): boolean {
  // Issues with low relational alignment require pause
  if (event.eventType === 'issues' && alignmentScore !== null && alignmentScore < 0.4) {
    return true;
  }

  // Events from unfamiliar actors (first interaction) require pause
  if (event.payload && (event.payload as Record<string, unknown>).is_first_time === true) {
    return true;
  }

  // Complex multi-repo events require pause
  if (event.eventType === 'workflow' || event.eventType === 'deployment') {
    return true;
  }

  return false;
}

/**
 * Generates reason for sacred pause decision
 */
function generateSacredPauseReason(event: WebhookEvent, alignmentScore: number | null): string {
  if (event.eventType === 'issues' && alignmentScore !== null && alignmentScore < 0.4) {
    return `Issue event with low relational alignment (${alignmentScore}). Pause to ensure respectful response.`;
  }
  if (event.payload && (event.payload as Record<string, unknown>).is_first_time === true) {
    return `First-time contributor. Pause to honor new relationship entering our community.`;
  }
  if (event.eventType === 'workflow' || event.eventType === 'deployment') {
    return `Complex infrastructure event. Pause to ensure all relational dimensions are considered.`;
  }
  return "No sacred pause required for this event type.";
}

/**
 * Selects which relational protocols apply to this event
 */
function selectProtocols(eventType: string, principles: string[]): string[] {
  const protocols: string[] = [];

  // Relationship protocols
  if (principles.includes('kinship') || eventType === 'issues') {
    protocols.push('Relationship_Newcomer_Welcome');
    protocols.push('Relationship_Contributor_Recognition');
  }

  // Proportion protocols
  if (principles.includes('harmony') || eventType === 'push') {
    protocols.push('Proportion_Balanced_Response');
    protocols.push('Proportion_Scaled_Action');
  }

  // Coherence protocols
  if (principles.includes('beauty') || eventType === 'pull_request') {
    protocols.push('Coherence_Narrative');
    protocols.push('Coherence_Balanced_Review');
  }

  // Universal protocols
  protocols.push('Universal_Accountability_Witness');
  protocols.push('Universal_Relational_Acknowledgment');

  return Array.from(new Set(protocols)); // Remove duplicates
}

/**
 * Helper: Format assessment for logging/documentation
 */
export function formatCeremonyAssessment(assessment: CeremonyPerspectiveAssessment): string {
  return `
🕊️ CEREMONY PERSPECTIVE ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Event ID: ${assessment.eventId}

📊 Relational Alignment:
  • Score: ${assessment.relationalAlignment.score !== null ? assessment.relationalAlignment.score.toFixed(2) : 'Not assessed'}
  • Principles: ${assessment.relationalAlignment.principles.join(', ') || 'None identified'}
  • Assessment: ${assessment.relationalAlignment.description}

🧭 Four Directions Guidance:
  • North (Reflection): ${assessment.fourDirections.north_reflection}
  • East (Thinking): ${assessment.fourDirections.east_thinking}
  • South (Relationships): ${assessment.fourDirections.south_relationships}
  • West (Action): ${assessment.fourDirections.west_action}

⏸️  Sacred Pause Required: ${assessment.sacredPause.required ? 'YES' : 'NO'}
   Reason: ${assessment.sacredPause.reason}

📜 Protocols Applied:
${assessment.protocolsApplied.map(p => `   • ${p}`).join('\n')}

📋 Accountability Record:
   Timestamp: ${assessment.accountabilityRecord.timestamp}
   Commitment: ${assessment.accountabilityRecord.relationalCommitment.trim()}
   Deferral Notes: ${assessment.accountabilityRecord.deferralNotes.trim()}
  `;
}
