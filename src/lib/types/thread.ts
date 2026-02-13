/**
 * Thread/Project types for pipeline management
 */

export interface ThreadMention {
  type: "person" | "framework";
  value: string;
}

export interface ThreadMetadata {
  status?: string;
  contact?: string;
  company?: string;
  opportunityType?: string;
  totalInvestment?: string;
  nextAction?: string;
  blocker?: string;
  priority?: "high" | "medium" | "low";
}

export interface Thread {
  filename: string;
  title: string;
  category: "M&A" | "Partnerships" | "Property" | "Personal" | "Other";
  status: "open" | "waiting" | "resolved";
  metadata: ThreadMetadata;
  mentions: ThreadMention[];
  lastModified: Date;
  wordCount: number;
  contentPreview: string;
}

export interface ProjectHealth {
  score: number; // 0-100
  status: "green" | "yellow" | "red";
  momentum: "accelerating" | "steady" | "stalling" | "stalled";
  daysActive: number;
  daysSinceUpdate: number;
  blockers: string[];
  nextAction: string | null;
}

export type PipelineStage = "active" | "stalled" | "closing";

export interface ProjectWithHealth extends Thread {
  health: ProjectHealth;
  pipelineStage: PipelineStage;
}
