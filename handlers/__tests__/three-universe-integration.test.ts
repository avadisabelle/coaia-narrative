/**
 * 🧪 THREE-UNIVERSE INTEGRATION TESTS
 *
 * Validates that webhook events flow through all three universes
 * and produce unified, coherent responses
 *
 * Test Strategy:
 * 1. Mock event inputs (push, issues)
 * 2. Verify each universe processes correctly
 * 3. Validate unified artifact coherence
 * 4. Ensure relational protocols are applied
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handlePushEvent } from '../push-event-handler';
import { handleIssueEvent } from '../issues-event-handler';
import type { PushEvent } from '../push-event-handler';
import type { IssueEvent } from '../issues-event-handler';
import type { CeremonyWorldAssessment } from '../ceremony-world-assessment';
import type { NarrativeBeat } from '../story-engine-world-generator';

// ════════════════════════════════════════════════════════════════════════════
// TEST FIXTURES & MOCKS
// ════════════════════════════════════════════════════════════════════════════

const mockPushEvent: PushEvent = {
  eventType: 'push',
  action: 'pushed',
  timestamp: new Date().toISOString(),
  actor: 'test-user',
  repository: 'test-repo/test-project',
  payload: {
    ref: 'refs/heads/main',
    before: 'abc123',
    after: 'def456',
    repository: {
      name: 'test-project',
      full_name: 'test-repo/test-project',
      private: false,
      description: 'Test repository'
    },
    pusher: {
      name: 'Test User',
      email: 'test@example.com'
    },
    commits: [
      {
        id: 'def456',
        message: 'Implement three-universe coordination',
        author: {
          name: 'Test User',
          email: 'test@example.com'
        },
        timestamp: new Date().toISOString(),
        added: ['src/handler.ts'],
        removed: [],
        modified: [],
        url: 'https://github.com/test-repo/test-project/commit/def456'
      }
    ],
    head_commit: {
      id: 'def456',
      message: 'Implement three-universe coordination',
      timestamp: new Date().toISOString(),
      url: 'https://github.com/test-repo/test-project/commit/def456'
    }
  }
};

const mockIssueEvent: IssueEvent = {
  eventType: 'issues',
  action: 'opened',
  timestamp: new Date().toISOString(),
  actor: 'community-member',
  repository: 'test-repo/test-project',
  payload: {
    action: 'opened',
    issue: {
      id: 12345,
      number: 1,
      title: 'Sacred pause should be honored in webhook processing',
      body: 'When ceremony-world determines a sacred pause is needed, engineer-world should respect this.',
      user: {
        login: 'community-member',
        id: 99999,
        type: 'User'
      },
      labels: [
        { id: 1, name: 'relational-protocol', color: 'ff00ff' },
        { id: 2, name: 'ceremony-world', color: '00ffff' }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      state: 'open',
      url: 'https://github.com/test-repo/test-project/issues/1'
    },
    repository: {
      id: 54321,
      name: 'test-project',
      full_name: 'test-repo/test-project',
      private: false
    }
  }
};

// Mock MCP functions
const mockCeremonyAssessment = async (event: any): Promise<CeremonyWorldAssessment> => ({
  eventId: `mock_${Date.now()}`,
  relationalAlignment: {
    assessed: true,
    score: 0.75,
    principles: ['Kinship', 'Harmony', 'Balance'],
    description: 'Event demonstrates good relational alignment'
  },
  fourDirections: {
    north_reflection: 'This event brings clarity about our process',
    east_thinking: 'We should prioritize relational awareness',
    south_relationships: 'Community trust is strengthened through transparency',
    west_action: 'Document and share our three-universe approach'
  },
  sacredPause: {
    required: event.eventType === 'issues',
    reason: event.eventType === 'issues' ? 'Issue events require relational pause' : 'No pause needed'
  },
  protocolsApplied: ['K\'é_Kinship', 'SNBH_Harmony', 'Hózhó_Beauty'],
  accountabilityRecord: {
    timestamp: new Date().toISOString(),
    relationalCommitment: 'We honor this event as a relational moment',
    deferralNotes: 'Engineer and Story worlds await ceremony guidance'
  }
});

const mockNarrativeGenerator = async (
  event: any,
  parentChartId: string,
  ceremony: CeremonyWorldAssessment
): Promise<NarrativeBeat> => ({
  beatName: `beat_${parentChartId}_${Date.now()}`,
  parentChartId,
  title: `S1E1: ${event.eventType.toUpperCase()} - Three Universe Test`,
  act: 1,
  type_dramatic: 'Integration Test',
  universes: ['engineer-world', 'ceremony-world', 'story-engine-world'],
  description: `Test beat for ${event.eventType} event`,
  prose: 'This narrative beat was generated as part of three-universe integration testing.',
  lessons: [
    'All three universes can process events coherently',
    'Relational protocols enhance rather than impede processing',
    'Sacred pause creates space for wisdom'
  ],
  episodeContext: {
    season: 1,
    episode: 1,
    beatNumber: 1,
    arcType: event.eventType === 'issues' ? 'conflict' : 'advancement'
  },
  characterTracking: {
    builder_revealed: ['Technical precision'],
    keeper_revealed: ['Relational wisdom'],
    weaver_revealed: ['Narrative coherence'],
    archetype_conflict: 'Balanced expression of all three archetypes'
  },
  recursiveAwareness: {
    thisIsPartOfStory: 'This test moment is part of our larger narrative',
    documentingIsWeaving: true,
    canonicalNarrative: 'Test events become part of our history'
  }
});

// ════════════════════════════════════════════════════════════════════════════
// PUSH EVENT TESTS
// ════════════════════════════════════════════════════════════════════════════

describe('Push Event Handler - Three Universe Integration', () => {
  let persistSpy: any;

  beforeEach(() => {
    persistSpy = vi.fn().mockResolvedValue(undefined);
  });

  it('should process push event through all three universes', async () => {
    const response = await handlePushEvent(
      mockPushEvent,
      'test-chart-123',
      mockCeremonyAssessment,
      mockNarrativeGenerator,
      persistSpy
    );

    // Verify response structure
    expect(response).toHaveProperty('engineerWorld');
    expect(response).toHaveProperty('ceremonyWorld');
    expect(response).toHaveProperty('storyEngineWorld');
    expect(response).toHaveProperty('unifiedArtifact');
  });

  it('Engineer-World should validate push event correctly', async () => {
    const response = await handlePushEvent(
      mockPushEvent,
      'test-chart-123',
      mockCeremonyAssessment,
      mockNarrativeGenerator,
      persistSpy
    );

    const engineer = response.engineerWorld;
    expect(engineer.status).toBe('success');
    expect(engineer.validationPassed).toBe(true);
    expect(engineer.routedTo).toBeDefined();
  });

  it('Ceremony-World should assess relational alignment', async () => {
    const response = await handlePushEvent(
      mockPushEvent,
      'test-chart-123',
      mockCeremonyAssessment,
      mockNarrativeGenerator,
      persistSpy
    );

    const ceremony = response.ceremonyWorld;
    expect(ceremony.relationalAlignment.assessed).toBe(true);
    expect(ceremony.relationalAlignment.score).toBeDefined();
    expect(ceremony.fourDirections).toBeDefined();
  });

  it('Story-Engine should generate narrative beat', async () => {
    const response = await handlePushEvent(
      mockPushEvent,
      'test-chart-123',
      mockCeremonyAssessment,
      mockNarrativeGenerator,
      persistSpy
    );

    const narrative = response.storyEngineWorld;
    expect(narrative.title).toBeDefined();
    expect(narrative.universes).toContain('engineer-world');
    expect(narrative.universes).toContain('ceremony-world');
    expect(narrative.universes).toContain('story-engine-world');
  });

  it('Unified artifact should contain all perspectives', async () => {
    const response = await handlePushEvent(
      mockPushEvent,
      'test-chart-123',
      mockCeremonyAssessment,
      mockNarrativeGenerator,
      persistSpy
    );

    const artifact = response.unifiedArtifact;
    expect(artifact.summary).toContain('Engineer-World');
    expect(artifact.summary).toContain('Ceremony-World');
    expect(artifact.summary).toContain('Story-Engine');
    expect(artifact.nextSteps.length).toBeGreaterThan(0);
  });

  it('should persist push event response', async () => {
    await handlePushEvent(
      mockPushEvent,
      'test-chart-123',
      mockCeremonyAssessment,
      mockNarrativeGenerator,
      persistSpy
    );

    expect(persistSpy).toHaveBeenCalled();
  });

  it('push events should NOT require sacred pause by default', async () => {
    const response = await handlePushEvent(
      mockPushEvent,
      'test-chart-123',
      mockCeremonyAssessment,
      mockNarrativeGenerator,
      persistSpy
    );

    expect(response.ceremonyWorld.sacredPause.required).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ISSUE EVENT TESTS
// ════════════════════════════════════════════════════════════════════════════

describe('Issue Event Handler - Relational Protocol Enforcement', () => {
  let persistSpy: any;

  beforeEach(() => {
    persistSpy = vi.fn().mockResolvedValue(undefined);
  });

  it('should process issue event through all three universes', async () => {
    const response = await handleIssueEvent(
      mockIssueEvent,
      'test-chart-123',
      mockCeremonyAssessment,
      mockNarrativeGenerator,
      persistSpy
    );

    expect(response).toHaveProperty('ceremonyWorld');
    expect(response).toHaveProperty('storyEngineWorld');
    expect(response).toHaveProperty('relationalProtocols');
    expect(response).toHaveProperty('unifiedArtifact');
  });

  it('Ceremony-World should require sacred pause for new issues', async () => {
    const response = await handleIssueEvent(
      mockIssueEvent,
      'test-chart-123',
      mockCeremonyAssessment,
      mockNarrativeGenerator,
      persistSpy
    );

    expect(response.ceremonyWorld.sacredPause.required).toBe(true);
  });

  it('should apply relational protocols for issues', async () => {
    const response = await handleIssueEvent(
      mockIssueEvent,
      'test-chart-123',
      mockCeremonyAssessment,
      mockNarrativeGenerator,
      persistSpy
    );

    const protocols = response.relationalProtocols.protocolsApplied;
    expect(protocols.length).toBeGreaterThan(0);
    expect(protocols.some(p => p.includes('K\'é'))).toBe(true);
  });

  it('should generate honorable acknowledgment for issue reporter', async () => {
    const response = await handleIssueEvent(
      mockIssueEvent,
      'test-chart-123',
      mockCeremonyAssessment,
      mockNarrativeGenerator,
      persistSpy
    );

    const acknowledgment = response.relationalProtocols.honorableAcknowledgment;
    expect(acknowledgment).toContain(mockIssueEvent.payload.issue.user.login);
    expect(acknowledgment).toContain(mockIssueEvent.payload.issue.title);
  });

  it('should map issue as conflict narrative arc', async () => {
    const response = await handleIssueEvent(
      mockIssueEvent,
      'test-chart-123',
      mockCeremonyAssessment,
      mockNarrativeGenerator,
      persistSpy
    );

    const narrative = response.storyEngineWorld;
    expect(narrative.episodeContext.arcType).toBe('conflict');
  });

  it('should demonstrate relationship commitment in response', async () => {
    const response = await handleIssueEvent(
      mockIssueEvent,
      'test-chart-123',
      mockCeremonyAssessment,
      mockNarrativeGenerator,
      persistSpy
    );

    const commitment = response.relationalProtocols.relationshipCommitment;
    expect(commitment).toBeDefined();
    expect(commitment.length).toBeGreaterThan(0);
  });

  it('should persist issue event response', async () => {
    await handleIssueEvent(
      mockIssueEvent,
      'test-chart-123',
      mockCeremonyAssessment,
      mockNarrativeGenerator,
      persistSpy
    );

    expect(persistSpy).toHaveBeenCalled();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// CROSS-UNIVERSE COHERENCE TESTS
// ════════════════════════════════════════════════════════════════════════════

describe('Cross-Universe Coherence', () => {
  it('push event should show all three universes in agreement', async () => {
    const response = await handlePushEvent(
      mockPushEvent,
      'test-chart-123',
      mockCeremonyAssessment,
      mockNarrativeGenerator,
      vi.fn()
    );

    // Engineer validates ✓
    expect(response.engineerWorld.validationPassed).toBe(true);
    // Ceremony assesses ✓
    expect(response.ceremonyWorld.relationalAlignment.assessed).toBe(true);
    // Story weaves ✓
    expect(response.storyEngineWorld.beatName).toBeDefined();
    // All three in unified response ✓
    expect(response.unifiedArtifact.nextSteps.length).toBeGreaterThan(0);
  });

  it('issue event should show ceremony guidance + engineer respect + story coherence', async () => {
    const response = await handleIssueEvent(
      mockIssueEvent,
      'test-chart-123',
      mockCeremonyAssessment,
      mockNarrativeGenerator,
      vi.fn()
    );

    // Ceremony provides wisdom (sacred pause) ✓
    expect(response.ceremonyWorld.sacredPause.required).toBe(true);
    // Engineer respects this ✓
    expect(response.unifiedArtifact.nextAction).toContain('⏸️');
    // Story recognizes conflict ✓
    expect(response.storyEngineWorld.episodeContext.arcType).toBe('conflict');
    // All three honored in artifact ✓
    expect(response.relationalProtocols.honorableAcknowledgment).toBeDefined();
  });

  it('narrative beat should include character revelations from both engineer and ceremony', async () => {
    const response = await handlePushEvent(
      mockPushEvent,
      'test-chart-123',
      mockCeremonyAssessment,
      mockNarrativeGenerator,
      vi.fn()
    );

    const narrative = response.storyEngineWorld;
    // Builder character revealed ✓
    expect(narrative.characterTracking.builder_revealed.length).toBeGreaterThan(0);
    // Keeper character revealed ✓
    expect(narrative.characterTracking.keeper_revealed.length).toBeGreaterThan(0);
    // Weaver revealed ✓
    expect(narrative.characterTracking.weaver_revealed.length).toBeGreaterThan(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ERROR HANDLING & RESILIENCE TESTS
// ════════════════════════════════════════════════════════════════════════════

describe('Three-Universe Resilience', () => {
  it('should continue if ceremony assessment fails', async () => {
    const failingCeremony = async () => {
      throw new Error('Ceremony assessment failed');
    };

    const response = await handlePushEvent(
      mockPushEvent,
      'test-chart-123',
      failingCeremony,
      mockNarrativeGenerator,
      vi.fn()
    );

    // Should still have response
    expect(response).toBeDefined();
    // Should create default ceremony assessment
    expect(response.ceremonyWorld).toBeDefined();
  });

  it('should continue if narrative generation fails', async () => {
    const failingNarrative = async () => {
      throw new Error('Narrative generation failed');
    };

    const response = await handleIssueEvent(
      mockIssueEvent,
      'test-chart-123',
      mockCeremonyAssessment,
      failingNarrative,
      vi.fn()
    );

    // Should still have response
    expect(response).toBeDefined();
    // Should create default narrative beat
    expect(response.storyEngineWorld).toBeDefined();
  });

  it('should handle invalid push event gracefully', async () => {
    const invalidEvent: any = {
      ...mockPushEvent,
      payload: {
        ...mockPushEvent.payload,
        commits: [] // Invalid: no commits
      }
    };

    const response = await handlePushEvent(
      invalidEvent,
      'test-chart-123',
      mockCeremonyAssessment,
      mockNarrativeGenerator,
      vi.fn()
    );

    // Engineer should fail validation
    expect(response.engineerWorld.validationPassed).toBe(false);
    // But we should still have a response structure
    expect(response.unifiedArtifact).toBeDefined();
  });
});
