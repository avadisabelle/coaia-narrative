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
