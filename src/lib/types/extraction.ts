/**
 * Activity Log & Extraction History Types
 *
 * Supports "Trust Through Transparency" by showing AI extraction history
 * with confidence levels and extracted data.
 */

import type { EntryFrontmatter } from "@amk/command-center-sdk";

export type ExtractionType = "voice" | "text" | "morning-ritual" | "manual";
export type ConfidenceLevel = "high" | "medium" | "low";

export interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  type: ExtractionType;
  fields: string[]; // ['sleep', 'energy', 'intentions']
  confidence: number; // 0-100
  confidenceLevel: ConfidenceLevel;
  summary: string;
  extractedData?: Partial<EntryFrontmatter>;
  source?: ExtractionType;
}
