export type ChallengeLevel = "low" | "medium" | "high";

export interface CoachConfig {
  id: string;
  name: string;
  enabled: boolean;
  challenge_level: ChallengeLevel;
  triggers: string[];
  auto_activate: boolean;
}

export interface CoachSettings {
  show_immediately: boolean;
  allow_debates: boolean;
  max_coaches_per_response: number;
}

export interface CoachesConfig {
  active_coaches: CoachConfig[];
  settings: CoachSettings;
}

export interface CoachChallenge {
  coach_id: string;
  coach_name: string;
  icon: string;
  message: string;
  quote?: string;
  confidence: number;
}

export interface CoachChallengeResponse {
  challenges: CoachChallenge[];
}

export interface CoachPromptTemplate {
  systemPrompt: string;
  triggers: string[];
  icon: string;
  challengeLevelModifiers: Record<ChallengeLevel, string>;
}
