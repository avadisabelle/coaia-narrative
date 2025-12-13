/**
 * Core types for narrative beat entities and relations in JSONL format
 * Extends coaia-memory with narrative-focused schema
 */

export interface NarrativeBeatMetadata {
  act: number;
  type_dramatic: string;
  universes: string[];
  timestamp: string;
  parentChart?: string;
  createdAt: string;
}

export interface NarrativeContent {
  description: string;
  prose: string;
  lessons: string[];
}

export interface RelationalAlignment {
  assessed: boolean;
  score: number | null;
  principles: string[];
}

export interface FourDirections {
  north_vision: string | null;
  east_intention: string | null;
  south_emotion: string | null;
  west_introspection: string | null;
}

export interface NarrativeBeatEntity {
  type: "narrative_beat";
  name: string;
  title: string;
  observations: string[];
  metadata: NarrativeBeatMetadata;
  narrative: NarrativeContent;
  relational_alignment: RelationalAlignment;
  four_directions: FourDirections;
}

export type NarrativeRelationType = 
  | "precedes"
  | "triggers" 
  | "enables"
  | "leads_to"
  | "documents"
  | "instantiates"
  | "illuminates";

export interface NarrativeRelation {
  type: "relation";
  from: string;
  to: string;
  relationType: NarrativeRelationType;
  metadata: {
    createdAt: string;
    description?: string;
  };
}