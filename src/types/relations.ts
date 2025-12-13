/**
 * Extended relation types for narrative beat connections
 */

export type ExtendedRelationType = 
  | "precedes"      // temporal narrative flow (beat A → beat B)
  | "triggers"      // causality (event triggers consequence)  
  | "enables"       // structural progression (enables transition)
  | "leads_to"      // outcome progression
  | "documents"     // beat documents action_step
  | "instantiates"  // abstract archetype becomes concrete story
  | "illuminates"   // beat reveals insight from Four Directions perspective
  | "creates_tension_with"  // from coaia-memory
  | "advances_toward"       // from coaia-memory
  | "telescopes_into"       // from coaia-memory
  | "flows_into";           // from coaia-memory

export interface ExtendedRelation {
  type: "relation";
  from: string;
  to: string;
  relationType: ExtendedRelationType;
  metadata: {
    createdAt: string;
    description?: string;
    strength?: number;
    context?: string;
  };
}