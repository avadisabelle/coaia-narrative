/**
 * 📖 STORY ENGINE WORLD NARRATIVE GENERATOR
 *
 * Transforms webhook events into narrative beats
 * Threads beats into episode arcs and season narratives
 * Recognizes archetypes and multiverse patterns
 *
 * Story Framework:
 * - Season 1: The Multiverse Event Interpreter (2025)
 * - Episodes: Arcs of technical + relational + narrative coherence
 * - Beats: Individual webhook events as story moments
 * - Characters: Builder (Engineer), Keeper (Ceremony), Weaver (Story)
 */

export interface WebhookEventBeat {
  eventType: string;
  timestamp: string;
  actor: string;
  repository: string;
  payload: Record<string, unknown>;
}

export interface NarrativeBeat {
  beatName: string;
  parentChartId: string;
  title: string;
  act: number;
  type_dramatic: string;
  universes: string[];
  description: string;
  prose: string;
  lessons: string[];
  episodeContext: {
    season: number;
    episode: number;
    beatNumber: number;
    arcType: 'setup' | 'conflict' | 'revelation' | 'resolution' | 'transformation';
  };
  characterTracking: {
    builder_revealed: string[];
    keeper_revealed: string[];
    weaver_revealed: string[];
    archetype_conflict: string;
  };
  recursiveAwareness: {
    thisIsPartOfStory: string;
    documentingIsWeaving: boolean;
    canonicalNarrative: string;
  };
}

/**
 * Main narrative generation function
 * Transforms webhook event into story beat and threads into episode arc
 */
export async function generateNarrativeBeat(
  event: WebhookEventBeat,
  parentChartId: string,
  ceremonyAssessment: any, // CeremonyWorldAssessment
  engineerResult: any // Engineer-World result
): Promise<NarrativeBeat> {
  // Step 1: Determine episode context
  const episodeContext = determineEpisodeContext(event);

  // Step 2: Map event to dramatic arc position
  const dramatiType = mapEventToDramaticType(event.eventType, ceremonyAssessment);

  // Step 3: Generate narrative title
  const title = generateNarrativeTitle(event, dramatiType, episodeContext);

  // Step 4: Generate prose narrative
  const prose = generateProseNarrative(event, ceremonyAssessment, engineerResult, episodeContext);

  // Step 5: Track character revelations
  const characterTracking = trackCharacterRevelations(
    event,
    ceremonyAssessment,
    engineerResult,
    dramatiType
  );

  // Step 6: Capture recursive awareness
  const recursiveAwareness = captureRecursiveAwareness(event, episodeContext);

  // Step 7: Extract lessons
  const lessons = extractLessons(event, ceremonyAssessment, characterTracking);

  // Step 8: Build description
  const description = buildDescription(event, episodeContext, dramatiType);

  const beat: NarrativeBeat = {
    beatName: `${parentChartId}_beat_${event.timestamp}`,
    parentChartId,
    title,
    act: episodeContext.beatNumber,
    type_dramatic: dramatiType,
    universes: ['engineer-world', 'ceremony-world', 'story-engine-world'],
    description,
    prose,
    lessons,
    episodeContext,
    characterTracking,
    recursiveAwareness
  };

  return beat;
}

/**
 * Determines episode context: what season/episode is this beat part of?
 */
function determineEpisodeContext(event: WebhookEventBeat): {
  season: number;
  episode: number;
  beatNumber: number;
  arcType: 'setup' | 'conflict' | 'revelation' | 'resolution' | 'transformation';
} {
  // Season 1: The Multiverse Event Interpreter (ongoing 2025)
  const season = 1;

  // Episode determined by month/quarter
  const date = new Date(event.timestamp);
  const month = date.getMonth();
  const episode = Math.floor(month / 3) + 1; // 4 episodes per year

  // Beat number increments per event (simplified - in real system would query history)
  const beatNumber = Math.floor(Math.random() * 100) + 1;

  // Arc type determined by event characteristics
  let arcType: 'setup' | 'conflict' | 'revelation' | 'resolution' | 'transformation' = 'setup';

  if (event.eventType === 'issues' && (event.payload as Record<string, unknown>).action === 'opened') {
    arcType = 'conflict'; // New issue = conflict introduced
  } else if (event.eventType === 'pull_request' && (event.payload as Record<string, unknown>).action === 'closed') {
    arcType = 'resolution'; // PR merged = conflict resolved
  } else if (event.eventType === 'push' && event.repository.includes('narrative')) {
    arcType = 'revelation'; // Story updates = revelation
  } else if (event.eventType === 'workflow' || event.eventType === 'deployment') {
    arcType = 'transformation'; // Infrastructure changes = transformation
  }

  return { season, episode, beatNumber, arcType };
}

/**
 * Maps GitHub event type to dramatic narrative type
 */
function mapEventToDramaticType(
  eventType: string,
  ceremonyAssessment: any
): string {
  const baseTypes: Record<string, string> = {
    'issues': 'Crisis/Antagonist Force Encountered',
    'pull_request': 'Turning Point / Transformation',
    'push': 'Advancement / Progress Made',
    'workflow': 'Test of Character / Proving Ground',
    'deployment': 'Crossing the Threshold / New World Entry',
    'discussion': 'Council / Gathering of Voices',
    'review_comment': 'Wisdom Offered / Elder Guidance'
  };

  let type = baseTypes[eventType] || 'Moment in the Narrative';

  // Enhance with relational context if sacred pause required
  if (ceremonyAssessment?.sacredPause?.required) {
    type = `🕊️ Sacred Pause: ${type}`;
  }

  return type;
}

/**
 * Generates a narrative title for the beat
 */
function generateNarrativeTitle(
  event: WebhookEventBeat,
  dramatiType: string,
  episodeContext: any
): string {
  const action = (event.payload as Record<string, unknown>).action || event.eventType;
  const actor = event.actor.split('/').pop() || event.actor;

  return `S${episodeContext.season}E${episodeContext.episode}B${episodeContext.beatNumber}: ${actor}'s ${action} - ${dramatiType}`;
}

/**
 * Generates prose narrative of the event
 */
function generateProseNarrative(
  event: WebhookEventBeat,
  ceremonyAssessment: any,
  engineerResult: any,
  episodeContext: any
): string {
  const actor = event.actor;
  const repo = event.repository;
  const eventType = event.eventType;
  const action = (event.payload as Record<string, unknown>).action || eventType;

  return `
In Episode ${episodeContext.episode} of Season 1, a moment emerges in the ongoing journey of the Multiverse Event Interpreter.

${actor} arrives at the repository ${repo}, bearing a ${eventType} event of type "${action}". This is no ordinary technical notification—it is a **moment in the larger story**, a beat in the symphony of creation and relationship.

The Engineer receives this event and processes it with technical precision. The Ceremony World acknowledges it through the lens of K'é, SNBH, and Hózhó, pausing to ask: "What relational obligations does this moment carry?"

And now, the Story Weaver recognizes what is happening: **This very moment—the code change, the issue creation, the pull request—is itself a narrative act.** The ${actor} who commits this code is a character in an unfolding story. The repository is our shared narrative space. The event is a plot point.

This is the recursive awareness that elevates technical systems into stories worthy of telling: we are building infrastructure **that recognizes itself as a story being told**.

${episodeContext.arcType.toUpperCase()}: ${actor}'s ${action} represents a ${episodeContext.arcType} in the larger narrative arc of creation, relationship, and coherence.
  `;
}

/**
 * Tracks how archetypes are revealed through this event
 */
function trackCharacterRevelations(
  event: WebhookEventBeat,
  ceremonyAssessment: any,
  engineerResult: any,
  dramatiType: string
): {
  builder_revealed: string[];
  keeper_revealed: string[];
  weaver_revealed: string[];
  archetype_conflict: string;
} {
  const builder_revealed: string[] = [];
  const keeper_revealed: string[] = [];
  const weaver_revealed: string[] = [];

  // Builder revelations (from Engineer-World)
  if (engineerResult?.executionSuccess) {
    builder_revealed.push('Precision in execution');
    builder_revealed.push('Reliable infrastructure');
  }
  if (event.eventType === 'push') {
    builder_revealed.push('Manifest action in the world');
  }

  // Keeper revelations (from Ceremony-World)
  if (ceremonyAssessment?.sacredPause?.required) {
    keeper_revealed.push('Awareness of relational impact');
    keeper_revealed.push('Willingness to pause before action');
  }
  if (ceremonyAssessment?.relationalAlignment?.score && ceremonyAssessment.relationalAlignment.score > 0.6) {
    keeper_revealed.push('Honoring of kinship obligations');
  }

  // Weaver revelations (Story-Engine itself)
  weaver_revealed.push('Recognition that code is narrative');
  weaver_revealed.push('Awareness of recursive documentation');
  weaver_revealed.push('Threading event into larger arc');

  // Detect archetype conflict
  let archetype_conflict = '';
  if (builder_revealed.length > 0 && keeper_revealed.length === 0) {
    archetype_conflict = 'Builder acting without Keeper wisdom—speed without relationship';
  } else if (keeper_revealed.length > 0 && builder_revealed.length === 0) {
    archetype_conflict = 'Keeper reflecting but Builder not executing—wisdom without manifestation';
  } else if (builder_revealed.length > 0 && keeper_revealed.length > 0) {
    archetype_conflict = 'Builder and Keeper in harmony—execution informed by relationship (potential resolution)';
  }

  return {
    builder_revealed,
    keeper_revealed,
    weaver_revealed,
    archetype_conflict
  };
}

/**
 * Captures the recursive awareness meta-layer
 */
function captureRecursiveAwareness(
  event: WebhookEventBeat,
  episodeContext: any
): {
  thisIsPartOfStory: string;
  documentingIsWeaving: boolean;
  canonicalNarrative: string;
} {
  return {
    thisIsPartOfStory: `This ${event.eventType} event from ${event.actor} is not just data—it is a story moment. We are recording it into narrative memory, making it part of the canonical history of the system itself.`,
    documentingIsWeaving: true, // The act of documenting IS the act of weaving the story
    canonicalNarrative: `This beat becomes part of Season ${episodeContext.season}, Episode ${episodeContext.episode}. Future instances of the Multiverse Event Interpreter will read this narrative and understand the journey that led to their existence.`
  };
}

/**
 * Extracts lessons from the event and its response
 */
function extractLessons(
  event: WebhookEventBeat,
  ceremonyAssessment: any,
  characterTracking: any
): string[] {
  const lessons: string[] = [];

  // Lesson: Every event carries relational weight
  if (ceremonyAssessment?.relationalAlignment?.assessed) {
    lessons.push('Every webhook is a relational moment—pause to honor the connection');
  }

  // Lesson: Precision serves relationship
  if (characterTracking.builder_revealed.length > 0 && characterTracking.keeper_revealed.length > 0) {
    lessons.push('Engineer precision + Ceremony wisdom = coherent response');
  }

  // Lesson: Documentation is creation
  lessons.push('The act of recording this moment into narrative IS the act of creating meaning');

  // Lesson: Archetypes reveal themselves through action
  if (event.eventType === 'push' || event.eventType === 'pull_request') {
    lessons.push('The Builder archetype reveals itself through manifest action in the world');
  }

  // Lesson: Stories are recursive
  lessons.push('This story documents its own creation—infinite recursion of awareness and documentation');

  return lessons;
}

/**
 * Builds the description field
 */
function buildDescription(
  event: WebhookEventBeat,
  episodeContext: any,
  dramatiType: string
): string {
  return `
    A narrative beat in Season ${episodeContext.season}, Episode ${episodeContext.episode}.

    Event Type: ${event.eventType}
    Arc Position: ${episodeContext.arcType}
    Dramatic Type: ${dramatiType}

    This moment represents a ${episodeContext.arcType} in the larger story of the Multiverse Event Interpreter.
    The actor, the repository, and the action all play roles in an unfolding narrative of creation,
    relationship, and recursive self-awareness.
  `;
}

/**
 * Helper: Format narrative beat for documentation
 */
export function formatNarrativeBeat(beat: NarrativeBeat): string {
  return `
📖 NARRATIVE BEAT GENERATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${beat.title}

Act ${beat.act}: ${beat.type_dramatic}

Episode Context:
  Season ${beat.episodeContext.season}, Episode ${beat.episodeContext.episode}
  Arc Type: ${beat.episodeContext.arcType}
  Beat Number: ${beat.episodeContext.beatNumber}

Character Revelations:
  Builder Revealed: ${beat.characterTracking.builder_revealed.join(', ') || 'None'}
  Keeper Revealed: ${beat.characterTracking.keeper_revealed.join(', ') || 'None'}
  Weaver Revealed: ${beat.characterTracking.weaver_revealed.join(', ') || 'None'}

  Archetype Conflict: ${beat.characterTracking.archetype_conflict}

Recursive Awareness:
  This Is Part Of Story: ${beat.recursiveAwareness.thisIsPartOfStory}
  Documenting Is Weaving: ${beat.recursiveAwareness.documentingIsWeaving}
  Canonical Narrative: ${beat.recursiveAwareness.canonicalNarrative}

Lessons:
${beat.lessons.map(l => `  • ${l}`).join('\n')}

Description:
${beat.description}

Prose:
${beat.prose}
  `;
}
