/**
 * COAIA Narrative - Shared Type Definitions
 *
 * Single source of truth for all data types used by MCP server, CLI, and consumers.
 * Based on Robert Fritz's Structural Tension methodology.
 */

// ==================== Core Data Types ====================

export interface Entity {
  type?: string;
  name: string;
  entityType: string;
  observations: string[];
  metadata?: EntityMetadata;
  [key: string]: unknown;
}

export type Direction = 'EAST' | 'SOUTH' | 'WEST' | 'NORTH';

export type GithubSyncState = 'synced' | 'diverged' | 'conflict' | 'project-only' | 'chart-only';

export type GithubSyncAuthority = 'jsonl' | 'project';

export interface GithubIssueRef {
  owner: string;
  repo: string;
  number: number;
  nodeId?: string;
  url?: string;
}

export interface GithubProjectItemRef {
  projectNumber: number;
  projectOwner: string;
  projectTitle?: string;
  itemId: string;
  url?: string;
}

export interface GithubBridgeMetadata {
  issue?: GithubIssueRef;
  projectItem?: GithubProjectItemRef;
  projectItems?: GithubProjectItemRef[];
  syncState?: GithubSyncState;
  lastSyncedAt?: string;
  fieldHash?: string;
  authoritativeOnLastSync?: GithubSyncAuthority;
}

export type GithubChartProvenance = GithubBridgeMetadata;

export type GithubActionStepProvenance = GithubBridgeMetadata;

export interface LegacyGithubSyncTarget {
  owner?: string;
  repo?: string;
  issue_number?: number;
  issueNumber?: number;
  number?: number;
  node_id?: string;
  nodeId?: string;
  issue_url?: string;
  url?: string;
  project_id?: string;
  projectId?: string;
  project_number?: number;
  projectNumber?: number;
  project_owner?: string;
  projectOwner?: string;
  project_title?: string;
  projectTitle?: string;
  item_id?: string;
  itemId?: string;
  project_url?: string;
}

export interface LegacyGithubRef {
  owner?: string;
  repo?: string;
  issue_number?: number;
  issueNumber?: number;
  number?: number;
  node_id?: string;
  nodeId?: string;
  issue_url?: string;
  url?: string;
}

export type SourceSystem =
  | 'coaia-narrative'
  | 'coaia-pde'
  | 'coaia-planning'
  | 'mcp-pde'
  | 'manual'
  | 'miadi'
  | 'coaia-github'
  | (string & {});

export interface SourceProvenance {
  system: SourceSystem;
  version?: string;
  toolName?: string;
  sessionId?: string;
  createdAt?: string;
}

/**
 * Deep Research Foundations metadata for tracking research packet context and evaluation status.
 * Used by Atlas Chronicle and research delegation workflows.
 * 
 * @see https://github.com/avadisabelle/coaia-narrative/issues/39
 */
export interface DeepResearchFoundationMetadata {
  packetRoot?: string;
  foundationType?: string;
  parentIssue?: string;
  baselineIssue?: string;
  inquiryIssue?: string;
  protocolIssue?: string;
  schemaIssue?: string;
  visualizerIssue?: string;
  expectedArtifacts?: string[];
  producedArtifacts?: string[];
  evaluationStatus?: 'expected' | 'delegated' | 'produced' | 'evaluated';
  privacyClass?: 'public-safe' | 'private' | 'mixed';
  publicationStatus?: 'planned' | 'draft' | 'reviewed' | 'published';
  commitHandles?: string[];
}

/**
 * Hermes session lineage metadata tracking conversation branching and handoff state.
 * Used for reconstructing branch maps and session traceability.
 * 
 * @see https://github.com/avadisabelle/coaia-narrative/issues/40
 */
export interface HermesSessionLineageMetadata {
  platform?: string;
  parentChartId?: string;
  sourceBeat?: string;
  originalSessionId?: string;
  branchSessionId?: string;
  branchIndex?: number;
  copiedMessageCount?: number;
  branchPurpose?: string;
  relatedIssues?: string[];
  handoffState?: 'requirements-created' | 'implementation-ready' | 'returned-to-parent';
}

/**
 * Beat-level lived session context metadata capturing the embodied condition of working sessions.
 * Records land-based learning, voice/terminal mode, environmental constraints, and continuity context.
 * 
 * @see https://github.com/avadisabelle/coaia-narrative/issues/42
 */
export interface SessionContextMetadata {
  mode?: 'voice' | 'terminal' | 'mixed';
  setting?: 'desk' | 'walking' | 'land-based' | 'transit' | 'unknown';
  landBasedLearning?: boolean;
  environmentNotes?: string[];
  listeningContext?: string;
  captureQuality?: 'clear' | 'windy' | 'partial';
  continuationKind?: 'branch' | 'parent-return' | 'follow-up';
  privateChroniclePath?: string;
  publicSummaryAllowed?: boolean;
}

export interface EntityMetadata {
  dueDate?: string;
  chartId?: string;
  phase?: 'germination' | 'assimilation' | 'completion';
  completionStatus?: boolean;
  parentChart?: string;
  parentActionStep?: string;
  level?: number;
  createdAt?: string;
  updatedAt?: string;
  // Narrative beat specific metadata
  act?: number;
  type_dramatic?: string;
  universes?: string[];
  timestamp?: string;
  elementsOfPerformance?: Array<{
    description: string;
    type: 'DESIGN' | 'EXECUTION';
  }>;
  mmotEvaluations?: Array<{
    phase: 'acknowledge' | 'analyze' | 'update' | 'recommit';
    assessment: string;
    direction?: 'South' | 'East' | 'West' | 'North';
    timestamp: string;
  }>;
  relationalAlignment?: {
    assessed: boolean;
    score: number | null;
    principles: string[];
  };
  fourDirections?: {
    north_vision: string | null;
    east_intention: string | null;
    south_emotion: string | null;
    west_introspection: string | null;
  };
  narrative?: {
    description: string;
    prose: string;
    lessons: string[];
  };
  github?: GithubBridgeMetadata;
  source?: SourceProvenance;
  /** Deep Research Foundations metadata for research packet tracking and evaluation. */
  foundation?: DeepResearchFoundationMetadata;
  /** Hermes session lineage metadata for conversation branching and handoff tracking. */
  sessionLineage?: HermesSessionLineageMetadata;
  /** Beat-level lived session context capturing embodied working conditions and environmental constraints. */
  sessionContext?: SessionContextMetadata;
  /** @deprecated Use github.issue and github.projectItem instead. */
  sync_target?: LegacyGithubSyncTarget;
  /** @deprecated Use github.issue instead. */
  github_ref?: LegacyGithubRef;
  [key: string]: unknown;
}

export interface Relation {
  type?: string;
  from: string;
  to: string;
  relationType: string;
  metadata?: {
    createdAt?: string;
    strength?: number;
    context?: string;
    description?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface KnowledgeGraph {
  entities: Entity[];
  relations: Relation[];
  rawRecords?: JsonlRecord[];
}

export type JsonlRecord = Record<string, unknown>;

// ==================== MCP Tool Result ====================

export interface McpToolResult {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}
