/**
 * COAIA Narrative - Shared Type Definitions
 *
 * Single source of truth for all data types used by MCP server, CLI, and consumers.
 * Based on Robert Fritz's Structural Tension methodology.
 */

// ==================== Core Data Types ====================

export interface Entity {
  name: string;
  entityType: string;
  observations: string[];
  metadata?: EntityMetadata;
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
  /** @deprecated Use github.issue and github.projectItem instead. */
  sync_target?: LegacyGithubSyncTarget;
  /** @deprecated Use github.issue instead. */
  github_ref?: LegacyGithubRef;
}

export interface Relation {
  from: string;
  to: string;
  relationType: string;
  metadata?: {
    createdAt?: string;
    strength?: number;
    context?: string;
    description?: string;
  };
}

export interface KnowledgeGraph {
  entities: Entity[];
  relations: Relation[];
}

// ==================== MCP Tool Result ====================

export interface McpToolResult {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}
